"""
Tests d'intégration pour le backend API

Ces tests couvrent les flux complets end-to-end:
- Inscription → Confirmation email → Login → Transactions
- Création et gestion de multiples transactions
- Résumé mensuel détaillé
- Changement et réinitialisation de mot de passe
- Scénarios complexes impliquant plusieurs utilisateurs
"""

from django.test import TestCase, override_settings
from django.contrib.auth import get_user_model
from django.core import mail
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from decimal import Decimal
from django.utils import timezone
from datetime import datetime, timedelta

from unittest.mock import patch
import json

from .models import Transaction, User
from .tokens import email_confirmation_token_generator
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode

User = get_user_model()

User = get_user_model()


# ============================================================================
# TESTS D'INTÉGRATION - FLUX D'AUTHENTIFICATION
# ============================================================================

class AuthenticationFlowIntegrationTest(APITestCase):
    """Test les flux complets d'authentification"""

    def setUp(self):
        self.client = APIClient()
        self.register_url = '/api/register/'
        self.login_url = '/api/login/'
        self.confirm_email_url = '/api/confirm-email/'
        self.resend_confirmation_url = '/api/resend-confirmation/'

    @override_settings(EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend')
    def test_complete_registration_flow(self):
        """
        Test: Inscription → Email confirmation → Login automatique
        
        Flux:
        1. Utilisateur s'inscrit
        2. Email de confirmation est envoyé
        3. Cliquer sur le lien active le compte et génère JWT
        4. Utilisateur peut se connecter
        """
        # 1. Inscription
        registration_data = {
            'email': 'newuser@example.com',
            'name': 'New User',
            'password': 'SecurePassword123'
        }
        response = self.client.post(self.register_url, registration_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['user']['email'], 'newuser@example.com')

        # 2. Vérifier que l'utilisateur est créé mais inactif
        user = User.objects.get(email='newuser@example.com')
        self.assertFalse(user.is_active)

        # 3. Vérifier que l'email de confirmation a été envoyé
        self.assertEqual(len(mail.outbox), 1)
        email = mail.outbox[0]
        self.assertIn('newuser@example.com', email.to)
        self.assertIn('Confirmez votre inscription', email.subject)

        # 4. Générer les token/uid pour la confirmation
        uidb64 = urlsafe_base64_encode(force_bytes(user.pk))
        token = email_confirmation_token_generator.make_token(user)

        # 5. Cliquer sur le lien de confirmation
        confirm_response = self.client.get(
            f'{self.confirm_email_url}{uidb64}/{token}/'
        )
        self.assertEqual(confirm_response.status_code, status.HTTP_200_OK)
        self.assertIn('access', confirm_response.data)
        self.assertIn('refresh', confirm_response.data)

        # 6. Vérifier que l'utilisateur est maintenant actif
        user.refresh_from_db()
        self.assertTrue(user.is_active)

        # 7. Vérifier que le token JWT fonctionne
        access_token = confirm_response.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')
        
        # Accéder à un endpoint sécurisé
        profile_response = self.client.get('/api/profile/')
        self.assertEqual(profile_response.status_code, status.HTTP_200_OK)

    @override_settings(EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend')
    def test_resend_confirmation_email(self):
        """
        Test: Renvoi de l'email de confirmation
        
        Flux:
        1. Utilisateur s'inscrit mais perd l'email initial
        2. Demande un renvoi de l'email
        3. Reçoit un nouvel email
        4. Confirme son inscription
        """
        # 1. Inscription
        registration_data = {
            'email': 'user@example.com',
            'name': 'Test User',
            'password': 'SecurePassword123'
        }
        response = self.client.post(self.register_url, registration_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # 2. Vider la boîte mail
        mail.outbox = []

        # 3. Demander un renvoi
        resend_data = {
            'email': 'user@example.com',
            'action': 'inscription'
        }
        resend_response = self.client.post(
            self.resend_confirmation_url,
            resend_data,
            format='json'
        )
        self.assertEqual(resend_response.status_code, status.HTTP_200_OK)

        # 4. Vérifier que le nouvel email a été envoyé
        self.assertEqual(len(mail.outbox), 1)

    def test_duplicate_registration_inactive_user(self):
        """
        Test: Tentative d'inscription avec un email existant (compte inactif)
        
        Flux:
        1. Utilisateur s'inscrit
        2. Tentative de réinscription avec le même email
        3. Doit recevoir un message de renvoi d'email au lieu d'une erreur
        """
        # 1. Création d'un utilisateur inactif
        User.objects.create_user(
            email='user@example.com',
            name='User',
            password='Password123'
        )

        # 2. Tentative de réinscription
        registration_data = {
            'email': 'user@example.com',
            'name': 'Another User',
            'password': 'AnotherPassword123'
        }
        response = self.client.post(self.register_url, registration_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('Vérifie ta boîte mail', response.data['message'])


# ============================================================================
# TESTS D'INTÉGRATION - FLUX DE MOT DE PASSE
# ============================================================================

class PasswordResetFlowIntegrationTest(APITestCase):
    """Test les flux de réinitialisation de mot de passe"""

    def setUp(self):
        self.client = APIClient()
        self.forgot_password_url = '/api/forgot-password/'
        self.password_confirm_url = '/api/password-confirm/'
        self.reset_password_url = '/api/reset-password/'
        self.login_url = '/api/login/'

        # Créer un utilisateur actif
        self.user = User.objects.create_user(
            email='user@example.com',
            name='Test User',
            password='OldPassword123'
        )
        self.user.is_active = True
        self.user.save()

    @override_settings(EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend')
    def test_complete_password_reset_flow(self):
        """
        Test: Mot de passe oublié → Email → Vérification → Reset
        
        Flux:
        1. Utilisateur demande réinitialisation
        2. Email envoyé avec token
        3. Vérification du token
        4. Changement du mot de passe
        5. Se connecter avec nouveau mot de passe
        """
        # 1. Demander réinitialisation
        forgot_response = self.client.post(
            self.forgot_password_url,
            {'email': 'user@example.com'},
            format='json'
        )
        self.assertEqual(forgot_response.status_code, status.HTTP_200_OK)

        # 2. Vérifier que l'email a été envoyé
        self.assertEqual(len(mail.outbox), 1)

        # 3. Générer le token
        uidb64 = urlsafe_base64_encode(force_bytes(self.user.pk))
        token = email_confirmation_token_generator.make_token(self.user)

        # 4. Vérifier le token
        verify_response = self.client.get(
            f'{self.password_confirm_url}{uidb64}/{token}/'
        )
        self.assertEqual(verify_response.status_code, status.HTTP_200_OK)
        self.assertIn('uid', verify_response.data)
        self.assertIn('token', verify_response.data)

        # 5. Réinitialiser le mot de passe
        reset_data = {
            'uid': uidb64,
            'token': token,
            'password': 'NewPassword456',
            'password_confirm': 'NewPassword456'
        }
        reset_response = self.client.post(
            self.reset_password_url,
            reset_data,
            format='json'
        )
        self.assertEqual(reset_response.status_code, status.HTTP_200_OK)

        # 6. Vérifier que le nouveau mot de passe fonctionne
        login_response = self.client.post(
            self.login_url,
            {'email': 'user@example.com', 'password': 'NewPassword456'},
            format='json'
        )
        self.assertEqual(login_response.status_code, status.HTTP_200_OK)
        self.assertIn('access', login_response.data)

    def test_reset_password_with_mismatched_passwords(self):
        """Test que le reset échoue si les mots de passe ne correspondent pas"""
        uidb64 = urlsafe_base64_encode(force_bytes(self.user.pk))
        token = email_confirmation_token_generator.make_token(self.user)

        reset_data = {
            'uid': uidb64,
            'token': token,
            'password': 'NewPassword456',
            'password_confirm': 'DifferentPassword789'
        }
        response = self.client.post(self.reset_password_url, reset_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('ne correspondent pas', response.data['error'])

    def test_reset_password_invalid_token(self):
        """Test que le reset échoue avec un token invalide"""
        uidb64 = urlsafe_base64_encode(force_bytes(self.user.pk))
        invalid_token = 'invalid-token'

        reset_data = {
            'uid': uidb64,
            'token': invalid_token,
            'password': 'NewPassword456',
            'password_confirm': 'NewPassword456'
        }
        response = self.client.post(self.reset_password_url, reset_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


# ============================================================================
# TESTS D'INTÉGRATION - GESTION DES TRANSACTIONS
# ============================================================================

class TransactionManagementFlowIntegrationTest(APITestCase):
    """Test les flux complets de gestion des transactions"""

    def setUp(self):
        self.client = APIClient()

        # Créer deux utilisateurs
        self.user1 = User.objects.create_user(
            email='user1@example.com',
            name='User 1',
            password='Password123'
        )
        self.user1.is_active = True
        self.user1.save()

        self.user2 = User.objects.create_user(
            email='user2@example.com',
            name='User 2',
            password='Password123'
        )
        self.user2.is_active = True
        self.user2.save()

        # Authentifier user1
        login_response = self.client.post(
            '/api/login/',
            {'email': 'user1@example.com', 'password': 'Password123'},
            format='json'
        )
        self.token1 = login_response.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token1}')

        self.transactions_url = '/api/transactions/'

    def test_create_multiple_transactions_and_retrieve(self):
        """
        Test: Créer plusieurs transactions et les récupérer
        
        Flux:
        1. Créer plusieurs transactions de types différents
        2. Récupérer la liste
        3. Vérifier l'ordre (par date décroissante)
        """
        # 1. Créer transactions
        transactions_data = [
            {'text': 'Salaire', 'amount': '2000.00'},
            {'text': 'Loyer', 'amount': '-1000.00'},
            {'text': 'Courses', 'amount': '-150.50'},
            {'text': 'Bonus', 'amount': '500.00'},
        ]

        for data in transactions_data:
            response = self.client.post(self.transactions_url, data, format='json')
            self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # 2. Récupérer la liste
        list_response = self.client.get(self.transactions_url)
        self.assertEqual(list_response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(list_response.data), 4)

        # 3. Vérifier l'ordre (plus récent d'abord)
        transactions = list_response.data
        for i in range(len(transactions) - 1):
            self.assertGreaterEqual(
                transactions[i]['created_at'],
                transactions[i + 1]['created_at']
            )

    def test_update_and_delete_transaction(self):
        """
        Test: Modifier puis supprimer une transaction
        
        Flux:
        1. Créer une transaction
        2. La modifier
        3. Vérifier la modification
        4. La supprimer
        5. Vérifier la suppression
        """
        # 1. Créer
        create_response = self.client.post(
            self.transactions_url,
            {'text': 'Salaire', 'amount': '1000.00'},
            format='json'
        )
        self.assertEqual(create_response.status_code, status.HTTP_201_CREATED)
        transaction_id = create_response.data['id']

        # 2. Modifier
        update_response = self.client.put(
            f'{self.transactions_url}{transaction_id}/',
            {'text': 'Salaire Augmenté', 'amount': '1500.00'},
            format='json'
        )
        self.assertEqual(update_response.status_code, status.HTTP_200_OK)
        self.assertEqual(update_response.data['text'], 'Salaire Augmenté')
        self.assertEqual(update_response.data['amount'], '1500.00')

        # 3. Vérifier la modification
        get_response = self.client.get(f'{self.transactions_url}{transaction_id}/')
        self.assertEqual(get_response.status_code, status.HTTP_200_OK)
        self.assertEqual(get_response.data['text'], 'Salaire Augmenté')

        # 4. Supprimer
        delete_response = self.client.delete(f'{self.transactions_url}{transaction_id}/')
        self.assertEqual(delete_response.status_code, status.HTTP_204_NO_CONTENT)

        # 5. Vérifier la suppression
        get_response = self.client.get(f'{self.transactions_url}{transaction_id}/')
        self.assertEqual(get_response.status_code, status.HTTP_404_NOT_FOUND)

    def test_transaction_isolation_between_users(self):
        """
        Test: Les transactions d'un utilisateur ne sont pas visibles à un autre
        
        Flux:
        1. User1 crée des transactions
        2. User2 se connecte
        3. User2 ne peut pas voir les transactions de User1
        4. User1 ne peut pas modifier les transactions de User2
        """
        # 1. User1 crée une transaction
        user1_transaction = self.client.post(
            self.transactions_url,
            {'text': 'Transaction User1', 'amount': '1000.00'},
            format='json'
        )
        user1_trans_id = user1_transaction.data['id']

        # 2. User2 crée une transaction
        login_response = self.client.post(
            '/api/login/',
            {'email': 'user2@example.com', 'password': 'Password123'},
            format='json'
        )
        token2 = login_response.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token2}')

        user2_transaction = self.client.post(
            self.transactions_url,
            {'text': 'Transaction User2', 'amount': '500.00'},
            format='json'
        )
        user2_trans_id = user2_transaction.data['id']

        # 3. User2 ne peut pas voir la transaction de User1
        get_response = self.client.get(f'{self.transactions_url}{user1_trans_id}/')
        self.assertEqual(get_response.status_code, status.HTTP_404_NOT_FOUND)

        # 4. User2 voit seulement sa propre transaction
        list_response = self.client.get(self.transactions_url)
        self.assertEqual(len(list_response.data), 1)
        self.assertEqual(list_response.data[0]['id'], user2_trans_id)

        # 5. User1 ne peut pas modifier la transaction de User2
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token1}')
        update_response = self.client.put(
            f'{self.transactions_url}{user2_trans_id}/',
            {'text': 'Hacké par User1', 'amount': '9999.00'},
            format='json'
        )
        self.assertEqual(update_response.status_code, status.HTTP_404_NOT_FOUND)


# ============================================================================
# TESTS D'INTÉGRATION - RÉSUMÉ MENSUEL
# ============================================================================

class MonthlySummaryIntegrationTest(APITestCase):
    """Test les flux d'analyse financière mensuelle"""

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='user@example.com',
            name='Test User',
            password='Password123'
        )
        self.user.is_active = True
        self.user.save()

        # Authentifier
        login_response = self.client.post(
            '/api/login/',
            {'email': 'user@example.com', 'password': 'Password123'},
            format='json'
        )
        self.token = login_response.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token}')

        self.summary_url = '/api/monthly-summary/'

    def test_monthly_summary_with_complex_transactions(self):
        """
        Test: Résumé détaillé d'un mois complexe
        
        Flux:
        1. Créer plusieurs transactions (revenus + dépenses)
        2. Demander le résumé
        3. Vérifier les calculs (total, balance, etc.)
        """
        now = timezone.now()
        transactions_url = '/api/transactions/'

        # 1. Créer transactions variées
        transactions_data = [
            {'text': 'Salaire', 'amount': '2000.00'},
            {'text': 'Bonus', 'amount': '500.00'},
            {'text': 'Loyer', 'amount': '-1000.00'},
            {'text': 'Courses', 'amount': '-150.50'},
            {'text': 'Électricité', 'amount': '-80.00'},
            {'text': 'Freelance', 'amount': '800.00'},
        ]

        for data in transactions_data:
            self.client.post(transactions_url, data, format='json')

        # 2. Demander le résumé
        summary_response = self.client.post(
            self.summary_url,
            {'month': now.month, 'year': now.year},
            format='json'
        )
        self.assertEqual(summary_response.status_code, status.HTTP_200_OK)

        # 3. Vérifier les calculs
        data = summary_response.data
        self.assertEqual(data['total_count'], 6)
        self.assertEqual(data['total_income'], Decimal('3300.00'))
        self.assertEqual(data['total_expenses'], Decimal('-1230.50'))
        self.assertEqual(data['balance'], Decimal('2069.50'))

        # Vérifier les listes séparées
        self.assertEqual(len(data['income_transactions']), 3)
        self.assertEqual(len(data['expense_transactions']), 3)

    def test_monthly_summary_empty_month_vs_busy_month(self):
        """
        Test: Résumés contrastés entre un mois vide et un mois chargé
        
        Flux:
        1. Demander résumé mois vide
        2. Ajouter transactions
        3. Demander résumé pour mois chargé
        4. Comparer
        """
        now = timezone.now()
        transactions_url = '/api/transactions/'

        # 1. Résumé mois vide
        empty_response = self.client.post(
            self.summary_url,
            {'month': 12, 'year': 2020},
            format='json'
        )
        self.assertEqual(empty_response.data['total_count'], 0)

        # 2. Ajouter transactions
        for i in range(5):
            self.client.post(
                transactions_url,
                {'text': f'Transaction {i}', 'amount': f'{100 * (i + 1)}.00'},
                format='json'
            )

        # 3. Résumé mois chargé
        busy_response = self.client.post(
            self.summary_url,
            {'month': now.month, 'year': now.year},
            format='json'
        )
        self.assertEqual(busy_response.data['total_count'], 5)
        self.assertGreater(busy_response.data['total_income'], 0)
    
    def test_report_malformed_request(self):
        """Test du rapport avec requête mal formée"""
        
        # Sans mois et année
        response = self.client.post(self.summary_url, {})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        
        # Avec mois invalide
        response = self.client.post(self.summary_url, {
            "month": 13,
            "year": 2025
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


# ============================================================================
# TESTS D'INTÉGRATION - PROFIL UTILISATEUR
# ============================================================================

class UserProfileIntegrationTest(APITestCase):
    """Test les flux de gestion du profil utilisateur"""

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='user@example.com',
            name='Original Name',
            password='Password123'
        )
        self.user.is_active = True
        self.user.save()

        # Authentifier
        login_response = self.client.post(
            '/api/login/',
            {'email': 'user@example.com', 'password': 'Password123'},
            format='json'
        )
        self.token = login_response.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token}')

        self.profile_url = '/api/profile/'
        self.password_url = '/api/password/'

    def test_complete_password_change_flow(self):
        """
        Test: Voir profil → Changer mot de passe → Se reconnecter
        
        Flux:
        1. Voir le profil actuel
        2. Changer le mot de passe
        3. Se déconnecter (supprimer credentials)
        4. Se reconnecter avec le nouveau mot de passe
        """
        # 1. Voir profil
        profile_response = self.client.get(self.profile_url)
        self.assertEqual(profile_response.status_code, status.HTTP_200_OK)
        self.assertEqual(profile_response.data['name'], 'Original Name')

        # 2. Changer mot de passe
        password_response = self.client.put(
            self.password_url,
            {
                'currentPassword': 'Password123',
                'newPassword': 'NewPassword456!'
            },
            format='json'
        )
        self.assertEqual(password_response.status_code, status.HTTP_200_OK)

        # 3. Supprimer credentials et essayer de se connecter avec ancien mot de passe
        self.client.credentials()
        old_login_response = self.client.post(
            '/api/login/',
            {'email': 'user@example.com', 'password': 'Password123'},
            format='json'
        )
        self.assertEqual(old_login_response.status_code, status.HTTP_401_UNAUTHORIZED)

        # 4. Se reconnecter avec nouveau mot de passe
        new_login_response = self.client.post(
            '/api/login/',
            {'email': 'user@example.com', 'password': 'NewPassword456!'},
            format='json'
        )
        self.assertEqual(new_login_response.status_code, status.HTTP_200_OK)
        new_token = new_login_response.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {new_token}')

        # 5. Vérifier qu'on peut accéder aux endpoints sécurisés
        profile_response = self.client.get(self.profile_url)
        self.assertEqual(profile_response.status_code, status.HTTP_200_OK)

    def test_update_profile_and_verify(self):
        """
        Test: Modifier le profil et vérifier la persistance
        
        Flux:
        1. Modifier le nom
        2. Vérifier la modification immédiate
        3. Se reconnecter et vérifier la persistance
        """
        # 1. Modifier
        update_response = self.client.put(
            self.profile_url,
            {'name': 'Updated Name'},
            format='json'
        )
        self.assertEqual(update_response.status_code, status.HTTP_200_OK)

        # 2. Vérifier immédiatement
        get_response = self.client.get(self.profile_url)
        self.assertEqual(get_response.data['name'], 'Updated Name')

        # 3. Se reconnecter et vérifier
        self.client.credentials()
        login_response = self.client.post(
            '/api/login/',
            {'email': 'user@example.com', 'password': 'Password123'},
            format='json'
        )
        token = login_response.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

        profile_response = self.client.get(self.profile_url)
        self.assertEqual(profile_response.data['name'], 'Updated Name')

    def test_delete_account_removes_all_data(self):
        """
        Test: Supprimer un compte supprime l'utilisateur et ses transactions
        
        Flux:
        1. Créer des transactions
        2. Supprimer le compte
        3. Vérifier que l'utilisateur n'existe pas
        4. Vérifier que les transactions sont supprimées
        """
        transactions_url = '/api/transactions/'

        # 1. Créer des transactions
        for i in range(3):
            self.client.post(
                transactions_url,
                {'text': f'Transaction {i}', 'amount': '100.00'},
                format='json'
            )

        # Vérifier les transactions
        list_response = self.client.get(transactions_url)
        self.assertEqual(len(list_response.data), 3)

        # 2. Supprimer le compte
        delete_response = self.client.delete(self.profile_url)
        self.assertEqual(delete_response.status_code, status.HTTP_204_NO_CONTENT)

        # 3. Vérifier que l'utilisateur n'existe pas
        self.assertFalse(User.objects.filter(email='user@example.com').exists())

        # 4. Vérifier que les transactions sont supprimées
        self.assertEqual(Transaction.objects.filter(user__email='user@example.com').count(), 0)


# ============================================================================
# TESTS D'INTÉGRATION - SCÉNARIOS COMPLEXES
# ============================================================================

class ComplexIntegrationScenarios(APITestCase):
    """Test des scénarios complexes implicant plusieurs flux"""

    def setUp(self):
        self.client = APIClient()

    @override_settings(EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend')
    def test_multi_user_financial_scenario(self):
        """
        Test: Scénario réaliste avec plusieurs utilisateurs
        
        Flux:
        1. Deux utilisateurs s'inscrivent
        2. Confirment leurs comptes
        3. Créent des transactions
        4. Consultent leurs résumés séparés
        5. Un utilisateur change son mot de passe
        """
        # 1 & 2. Inscription et confirmation pour User1
        user1_data = {
            'email': 'alice@example.com',
            'name': 'Alice',
            'password': 'Alice12345'
        }
        response1 = self.client.post('/api/register/', user1_data, format='json')
        self.assertEqual(response1.status_code, status.HTTP_201_CREATED)

        user1 = User.objects.get(email='alice@example.com')
        uidb64_1 = urlsafe_base64_encode(force_bytes(user1.pk))
        token_1 = email_confirmation_token_generator.make_token(user1)
        self.client.get(f'/api/confirm-email/{uidb64_1}/{token_1}/')

        # Inscription et confirmation pour User2
        user2_data = {
            'email': 'bob@example.com',
            'name': 'Bob',
            'password': 'Bob12345'
        }
        response2 = self.client.post('/api/register/', user2_data, format='json')
        self.assertEqual(response2.status_code, status.HTTP_201_CREATED)

        user2 = User.objects.get(email='bob@example.com')
        uidb64_2 = urlsafe_base64_encode(force_bytes(user2.pk))
        token_2 = email_confirmation_token_generator.make_token(user2)
        self.client.get(f'/api/confirm-email/{uidb64_2}/{token_2}/')

        # 3. Create transactions for Alice
        login_alice = self.client.post(
            '/api/login/',
            {'email': 'alice@example.com', 'password': 'Alice12345'},
            format='json'
        )
        token_alice = login_alice.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token_alice}')

        alice_transactions = [
            {'text': 'Salaire', 'amount': '3000.00'},
            {'text': 'Loyer', 'amount': '-1200.00'},
        ]
        for t in alice_transactions:
            self.client.post('/api/transactions/', t, format='json')

        # 4. Create transactions for Bob
        login_bob = self.client.post(
            '/api/login/',
            {'email': 'bob@example.com', 'password': 'Bob12345'},
            format='json'
        )
        token_bob = login_bob.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token_bob}')

        bob_transactions = [
            {'text': 'Freelance', 'amount': '1500.00'},
            {'text': 'Courses', 'amount': '-200.00'},
        ]
        for t in bob_transactions:
            self.client.post('/api/transactions/', t, format='json')

        # 4. Check summaries
        now = timezone.now()
        summary_bob = self.client.post(
            '/api/monthly-summary/',
            {'month': now.month, 'year': now.year},
            format='json'
        )
        self.assertEqual(summary_bob.data['total_count'], 2)
        self.assertEqual(summary_bob.data['balance'], Decimal('1300.00'))

        # Check Alice's summary
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token_alice}')
        summary_alice = self.client.post(
            '/api/monthly-summary/',
            {'month': now.month, 'year': now.year},
            format='json'
        )
        self.assertEqual(summary_alice.data['total_count'], 2)
        self.assertEqual(summary_alice.data['balance'], Decimal('1800.00'))

        # 5. Alice changes password
        password_change = self.client.put(
            '/api/password/',
            {
                'currentPassword': 'Alice12345',
                'newPassword': 'NewAlice99!'
            },
            format='json'
        )
        self.assertEqual(password_change.status_code, status.HTTP_200_OK)

        # Verify Alice can't login with old password
        self.client.credentials()
        old_login = self.client.post(
            '/api/login/',
            {'email': 'alice@example.com', 'password': 'Alice12345'},
            format='json'
        )
        self.assertEqual(old_login.status_code, status.HTTP_401_UNAUTHORIZED)

        # Verify Alice can login with new password
        new_login = self.client.post(
            '/api/login/',
            {'email': 'alice@example.com', 'password': 'NewAlice99!'},
            format='json'
        )
        self.assertEqual(new_login.status_code, status.HTTP_200_OK)
