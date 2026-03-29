from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from decimal import Decimal
from datetime import datetime, timedelta
from .models import Transaction, User
from .serializers import UserSerializer, TransactionSerializer

User = get_user_model()


# ============================================================================
# TESTS DES MODELS
# ============================================================================

class UserModelTest(TestCase):
    """Tests du modèle User"""

    def test_create_user_successfully(self):
        """Test création d'un utilisateur avec les données valides"""
        user = User.objects.create_user(
            email='test@example.com',
            name='Test User',
            password='ValidPassword123'
        )
        self.assertEqual(user.email, 'test@example.com')
        self.assertEqual(user.name, 'Test User')
        self.assertFalse(user.is_active)  # Inactif tant que pas de confirmation email
        self.assertTrue(user.check_password('ValidPassword123'))

    def test_create_user_without_email_raises_error(self):
        """Test qu'une erreur est levée si pas d'email"""
        with self.assertRaises(ValueError):
            User.objects.create_user(
                email='',
                name='Test User',
                password='ValidPassword123'
            )

    def test_user_email_is_normalized(self):
        """Test que l'email est normalisé"""
        user = User.objects.create_user(
            email='TEST@EXAMPLE.COM',
            name='Test User',
            password='ValidPassword123'
        )
        self.assertEqual(user.email, 'test@example.com')

    def test_user_has_unique_email(self):
        """Test que les emails sont uniques"""
        User.objects.create_user(
            email='test@example.com',
            name='User 1',
            password='ValidPassword123'
        )
        with self.assertRaises(Exception):
            User.objects.create_user(
                email='test@example.com',
                name='User 2',
                password='ValidPassword123'
            )

    def test_user_string_representation(self):
        """Test la représentation string de User"""
        user = User.objects.create_user(
            email='test@example.com',
            name='Test User',
            password='ValidPassword123'
        )
        # Django utilise par défaut email comme USERNAME_FIELD
        self.assertEqual(str(user), 'test@example.com')


class TransactionModelTest(TestCase):
    """Tests du modèle Transaction"""

    def setUp(self):
        """Créer un utilisateur pour les tests"""
        self.user = User.objects.create_user(
            email='test@example.com',
            name='Test User',
            password='ValidPassword123'
        )

    def test_create_transaction_successfully(self):
        """Test création d'une transaction"""
        transaction = Transaction.objects.create(
            user=self.user,
            text='Salaire',
            amount=Decimal('1000.00')
        )
        self.assertEqual(transaction.user, self.user)
        self.assertEqual(transaction.text, 'Salaire')
        self.assertEqual(transaction.amount, Decimal('1000.00'))

    def test_transaction_with_negative_amount(self):
        """Test création d'une transaction négative (dépense)"""
        transaction = Transaction.objects.create(
            user=self.user,
            text='Loyer',
            amount=Decimal('-500.00')
        )
        self.assertEqual(transaction.amount, Decimal('-500.00'))

    def test_transaction_has_created_at(self):
        """Test que created_at est automatiquement défini"""
        transaction = Transaction.objects.create(
            user=self.user,
            text='Dépense',
            amount=Decimal('-50.00')
        )
        self.assertIsNotNone(transaction.created_at)

    def test_transaction_ordering(self):
        """Test que les transactions sont ordonnées par date décroissante"""
        t1 = Transaction.objects.create(
            user=self.user,
            text='Transaction 1',
            amount=Decimal('100.00')
        )
        # Attendre un peu et créer une deuxième transaction
        t2 = Transaction.objects.create(
            user=self.user,
            text='Transaction 2',
            amount=Decimal('200.00')
        )
        transactions = Transaction.objects.filter(user=self.user)
        self.assertEqual(list(transactions), [t2, t1])

    def test_transaction_string_representation(self):
        """Test la représentation string d'une transaction"""
        transaction = Transaction.objects.create(
            user=self.user,
            text='Salaire',
            amount=Decimal('1000.00')
        )
        self.assertEqual(str(transaction), 'Salaire (1000.00)')


# ============================================================================
# TESTS DES SERIALIZERS
# ============================================================================

class UserSerializerTest(TestCase):
    """Tests du UserSerializer"""

    def test_user_serializer_creates_user(self):
        """Test que le serializer crée un utilisateur avec mot de passe hashé"""
        data = {
            'email': 'test@example.com',
            'name': 'Test User',
            'password': 'ValidPassword123'
        }
        serializer = UserSerializer(data=data)
        self.assertTrue(serializer.is_valid())
        user = serializer.save()
        self.assertEqual(user.email, 'test@example.com')
        self.assertTrue(user.check_password('ValidPassword123'))

    def test_user_serializer_password_is_write_only(self):
        """Test que le mot de passe n'est pas retourné dans les données"""
        user = User.objects.create_user(
            email='test@example.com',
            name='Test User',
            password='ValidPassword123'
        )
        serializer = UserSerializer(user)
        self.assertNotIn('password', serializer.data)

    def test_user_serializer_validation_error_without_email(self):
        """Test erreur si pas d'email"""
        data = {
            'name': 'Test User',
            'password': 'ValidPassword123'
        }
        serializer = UserSerializer(data=data)
        self.assertFalse(serializer.is_valid())


class TransactionSerializerTest(TestCase):
    """Tests du TransactionSerializer"""

    def setUp(self):
        """Créer un utilisateur pour les tests"""
        self.user = User.objects.create_user(
            email='test@example.com',
            name='Test User',
            password='ValidPassword123'
        )

    def test_transaction_serializer_valid_data(self):
        """Test sérialisation d'une transaction valide"""
        transaction = Transaction.objects.create(
            user=self.user,
            text='Salaire',
            amount=Decimal('1000.00')
        )
        serializer = TransactionSerializer(transaction)
        self.assertEqual(serializer.data['text'], 'Salaire')
        self.assertEqual(serializer.data['amount'], '1000.00')

    def test_transaction_serializer_user_is_read_only(self):
        """Test que l'utilisateur ne peut pas être modifié"""
        data = {
            'text': 'Test',
            'amount': '100.00',
            'user': 'some-other-user-id'
        }
        serializer = TransactionSerializer(data=data)
        # Le serializer devrait être valide pour text et amount
        # mais user est read_only donc il sera ignoré
        self.assertIn('user', serializer.Meta.read_only_fields)


# ============================================================================
# TESTS DES ENDPOINTS API
# ============================================================================

class AuthenticationAPITest(APITestCase):
    """Tests des endpoints d'authentification"""

    def setUp(self):
        """Initialiser le client API"""
        self.client = APIClient()
        self.register_url = '/api/register/'
        self.login_url = '/api/login/'

    def test_register_user_successfully(self):
        """Test l'inscription d'un nouvel utilisateur"""
        data = {
            'email': 'newuser@example.com',
            'name': 'New User',
            'password': 'ValidPassword123'
        }
        response = self.client.post(self.register_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('message', response.data)
        self.assertIn('user', response.data)

    def test_register_user_with_short_password(self):
        """Test que l'inscription échoue avec un mot de passe trop court"""
        data = {
            'email': 'newuser@example.com',
            'name': 'New User',
            'password': 'short'  # Moins de 8 caractères
        }
        response = self.client.post(self.register_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_user_without_email(self):
        """Test que l'inscription échoue sans email"""
        data = {
            'name': 'New User',
            'password': 'ValidPassword123'
        }
        response = self.client.post(self.register_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_duplicate_email(self):
        """Test l'inscription avec un email qui existe déjà"""
        # Créer un premier utilisateur
        User.objects.create_user(
            email='existing@example.com',
            name='Existing User',
            password='ValidPassword123'
        )
        User.objects.filter(email='existing@example.com').update(is_active=True)

        # Essayer de s'inscrire avec le même email
        data = {
            'email': 'existing@example.com',
            'name': 'Another User',
            'password': 'AnotherPassword123'
        }
        response = self.client.post(self.register_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_forgot_password_existing_user(self):
        """Test la demande de réinitialisation pour un utilisateur existant"""
        # Créer un utilisateur actif
        user = User.objects.create_user(
            email='test@example.com',
            name='Test User',
            password='ValidPassword123'
        )
        user.is_active = True
        user.save()

        response = self.client.post(
            '/api/forgot-password/',
            {'email': 'test@example.com'},
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_forgot_password_nonexistent_user(self):
        """Test la demande de réinitialisation pour un utilisateur inexistant"""
        response = self.client.post(
            '/api/forgot-password/',
            {'email': 'nonexistent@example.com'},
            format='json'
        )
        # Devrait toujours retourner 200 pour des raisons de sécurité
        self.assertEqual(response.status_code, status.HTTP_200_OK)


class TransactionAPITest(APITestCase):
    """Tests des endpoints de transaction"""

    def setUp(self):
        """Créer un utilisateur et le client API"""
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='test@example.com',
            name='Test User',
            password='ValidPassword123'
        )
        self.user.is_active = True
        self.user.save()

        # Authentifier l'utilisateur
        from rest_framework_simplejwt.views import TokenObtainPairView
        response = self.client.post(
            '/api/login/',
            {'email': 'test@example.com', 'password': 'ValidPassword123'},
            format='json'
        )
        if response.status_code == status.HTTP_200_OK:
            self.token = response.data.get('access')
            self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token}')

        self.transactions_url = '/api/transactions/'

    def test_list_transactions_authenticated(self):
        """Test la récupération des transactions d'un utilisateur authentifié"""
        # Créer quelques transactions
        Transaction.objects.create(
            user=self.user,
            text='Salaire',
            amount=Decimal('1000.00')
        )
        Transaction.objects.create(
            user=self.user,
            text='Loyer',
            amount=Decimal('-500.00')
        )

        response = self.client.get(self.transactions_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_create_transaction_authenticated(self):
        """Test la création d'une transaction"""
        data = {
            'text': 'Salaire',
            'amount': '1000.00'
        }
        response = self.client.post(self.transactions_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['text'], 'Salaire')
        self.assertEqual(response.data['amount'], '1000.00')

    def test_create_transaction_anonymous_fails(self):
        """Test qu'un utilisateur non authentifié ne peut pas créer de transaction"""
        self.client.credentials()  # Supprimer les credentials
        data = {
            'text': 'Salaire',
            'amount': '1000.00'
        }
        response = self.client.post(self.transactions_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_get_transaction_detail(self):
        """Test la récupération des détails d'une transaction"""
        transaction = Transaction.objects.create(
            user=self.user,
            text='Salaire',
            amount=Decimal('1000.00')
        )
        response = self.client.get(f'{self.transactions_url}{transaction.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['text'], 'Salaire')

    def test_update_transaction(self):
        """Test la modification d'une transaction"""
        transaction = Transaction.objects.create(
            user=self.user,
            text='Salaire',
            amount=Decimal('1000.00')
        )
        data = {'text': 'Prime', 'amount': '1500.00'}
        response = self.client.put(
            f'{self.transactions_url}{transaction.id}/',
            data,
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['text'], 'Prime')

    def test_delete_transaction(self):
        """Test la suppression d'une transaction"""
        transaction = Transaction.objects.create(
            user=self.user,
            text='Salaire',
            amount=Decimal('1000.00')
        )
        response = self.client.delete(f'{self.transactions_url}{transaction.id}/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Transaction.objects.filter(id=transaction.id).exists())

    def test_cannot_access_other_user_transaction(self):
        """Test qu'un utilisateur ne peut pas accéder aux transactions d'un autre"""
        # Créer un deuxième utilisateur
        other_user = User.objects.create_user(
            email='other@example.com',
            name='Other User',
            password='ValidPassword123'
        )
        other_user.is_active = True
        other_user.save()

        # Créer une transaction pour l'autre utilisateur
        transaction = Transaction.objects.create(
            user=other_user,
            text='Secret',
            amount=Decimal('1000.00')
        )

        # Essayer d'accéder avec le premier utilisateur
        response = self.client.get(f'{self.transactions_url}{transaction.id}/')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


class UserProfileAPITest(APITestCase):
    """Tests des endpoints de profil utilisateur"""

    def setUp(self):
        """Créer un utilisateur et le client API"""
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='test@example.com',
            name='Test User',
            password='ValidPassword123'
        )
        self.user.is_active = True
        self.user.save()

        # Authentifier l'utilisateur
        response = self.client.post(
            '/api/login/',
            {'email': 'test@example.com', 'password': 'ValidPassword123'},
            format='json'
        )
        if response.status_code == status.HTTP_200_OK:
            self.token = response.data.get('access')
            self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token}')

        self.profile_url = '/api/profile/'

    def test_get_user_profile(self):
        """Test la récupération du profil utilisateur"""
        response = self.client.get(self.profile_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['email'], 'test@example.com')
        self.assertEqual(response.data['name'], 'Test User')

    def test_update_user_profile(self):
        """Test la modification du profil utilisateur"""
        data = {'name': 'Updated Name'}
        response = self.client.put(self.profile_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'Updated Name')

        # Vérifier que le changement est persisté
        self.user.refresh_from_db()
        self.assertEqual(self.user.name, 'Updated Name')

    def test_update_password(self):
        """Test la modification du mot de passe"""
        data = {
            'currentPassword': 'ValidPassword123',
            'newPassword': 'NewPassword123!'
        }
        response = self.client.put(
            '/api/password/',
            data,
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Vérifier que le nouveau mot de passe fonctionne
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password('NewPassword123!'))

    def test_update_password_with_wrong_current_password(self):
        """Test que la modification de mot de passe échoue avec un mot de passe incorrect"""
        data = {
            'currentPassword': 'WrongPassword',
            'newPassword': 'NewPassword123!'
        }
        response = self.client.put(
            '/api/password/',
            data,
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_delete_user_account(self):
        """Test la suppression du compte utilisateur"""
        response = self.client.delete(self.profile_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(User.objects.filter(email='test@example.com').exists())


class MonthlySummaryAPITest(APITestCase):
    """Tests de l'endpoint du résumé mensuel"""

    def setUp(self):
        """Créer un utilisateur avec transactions"""
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='test@example.com',
            name='Test User',
            password='ValidPassword123'
        )
        self.user.is_active = True
        self.user.save()

        # Authentifier l'utilisateur
        response = self.client.post(
            '/api/login/',
            {'email': 'test@example.com', 'password': 'ValidPassword123'},
            format='json'
        )
        if response.status_code == status.HTTP_200_OK:
            self.token = response.data.get('access')
            self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token}')

        # Créer des transactions pour le mois actuel
        now = datetime.now()
        Transaction.objects.create(
            user=self.user,
            text='Salaire',
            amount=Decimal('1000.00'),
            created_at=now
        )
        Transaction.objects.create(
            user=self.user,
            text='Loyer',
            amount=Decimal('-500.00'),
            created_at=now
        )
        Transaction.objects.create(
            user=self.user,
            text='Courses',
            amount=Decimal('-100.00'),
            created_at=now
        )

        self.summary_url = '/api/monthly-summary/'

    def test_monthly_summary_valid_month_year(self):
        """Test le résumé mensuel avec mois et année valides"""
        now = datetime.now()
        data = {
            'month': now.month,
            'year': now.year
        }
        response = self.client.post(self.summary_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['total_income'], Decimal('1000.00'))
        self.assertEqual(response.data['total_expenses'], Decimal('-600.00'))
        self.assertEqual(response.data['balance'], Decimal('400.00'))
        self.assertEqual(response.data['total_count'], 3)

    def test_monthly_summary_without_month(self):
        """Test que le résumé échoue sans mois"""
        data = {'year': 2025}
        response = self.client.post(self.summary_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_monthly_summary_invalid_month(self):
        """Test que le résumé échoue avec un mois invalide"""
        data = {'month': 13, 'year': 2025}
        response = self.client.post(self.summary_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_monthly_summary_empty_month(self):
        """Test le résumé pour un mois sans transactions"""
        data = {'month': 1, 'year': 2020}
        response = self.client.post(self.summary_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['total_count'], 0)
        self.assertEqual(response.data['total_income'], Decimal('0.00'))
        self.assertEqual(response.data['total_expenses'], Decimal('0.00'))
        self.assertEqual(response.data['balance'], Decimal('0.00'))

    def test_monthly_summary_anonymous_fails(self):
        """Test que l'endpoint nécessite l'authentification"""
        self.client.credentials()  # Supprimer les credentials
        data = {'month': 1, 'year': 2025}
        response = self.client.post(self.summary_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
