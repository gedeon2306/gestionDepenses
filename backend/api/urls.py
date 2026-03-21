from django.urls import path
from .views import (
    register_user,
    resend_confirmation_email,
    confirm_email,
    forgot_password,
    password_confirm,
    reset_password_confirm,
    transaction_detail,
    transaction_list,
    get_user_profile,
    update_password,
    monthly_summary,
)
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    # 1. Inscription (envoi d'un email de confirmation)
    path('register/', register_user, name='register'),
    # 1.bis Confirmation de l'email (lien cliqué dans le mail)
    path('confirm-email/<str:uidb64>/<str:token>/', confirm_email, name='confirm-email'),
    # 1.ter Renvoi de l'email de confirmation (si le lien a expiré)
    path('resend-confirmation/', resend_confirmation_email, name='resend-confirmation'),
    
    # 2. Connexion (Génère le JWT Access et Refresh)
    # C'est cette URL que Next.js appellera pour le Login
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    
    # 3. Rafraîchir le token (quand le premier expire)
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # 4. Mot de passe oublié
    path('forgot-password/', forgot_password, name='forgot-password'),
    path('password-confirm/<str:uidb64>/<str:token>/', password_confirm, name='password-confirm'),
    path('reset-password/', reset_password_confirm, name='reset-password'),

    # Transactions
    path('transactions/', transaction_list, name='transactions'),
    
    # Route pour une transaction spécifique
    path('transactions/<uuid:pk>/', transaction_detail, name='transaction-detail'),

    # Info utilisateur
    path('profile/', get_user_profile, name='user-profile'),

    # Mot de passe
    path('password/', update_password, name='update-password'),

    # Statisques par mois
    path('monthly-summary/', monthly_summary, name='monthly-summary'),
]