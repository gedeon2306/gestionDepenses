from django.urls import path
from .views import register_user, transaction_detail, transaction_list, get_user_profile
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    # 1. Inscription
    path('register/', register_user, name='register'),
    
    # 2. Connexion (Génère le JWT Access et Refresh)
    # C'est cette URL que Next.js appellera pour le Login
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    
    # 3. Rafraîchir le token (quand le premier expire)
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # 
    path('transactions/', transaction_list, name='transactions'),
    
    # Route pour une transaction spécifique
    path('transactions/<uuid:pk>/', transaction_detail, name='transaction-detail'),

    #Info utilisateur
    path('profile/', get_user_profile, name='user-profile'),
]