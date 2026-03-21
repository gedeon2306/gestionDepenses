from django.shortcuts import render, redirect
from django.conf import settings
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from .tokens import email_confirmation_token_generator
from django.core.mail import send_mail
from .email_utils import send_confirmation_email, send_password_reset_email

from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from drf_spectacular.utils import extend_schema, inline_serializer
from drf_spectacular.types import OpenApiTypes
from rest_framework import serializers as drf_serializers

from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import Transaction, User
from .serializers import UserSerializer, TransactionSerializer


def landing_view(request):
    return render(request, "landing.html")

@extend_schema(
    tags=["Auth"],
    summary="Créer un compte utilisateur",
    request=UserSerializer,
    responses={
        201: inline_serializer(
            name="RegisterSuccess",
            fields={
                "message": drf_serializers.CharField(),
                "user": inline_serializer(
                    name="RegisterUserInfo",
                    fields={
                        "email": drf_serializers.EmailField(),
                        "name": drf_serializers.CharField(),
                    }
                ),
            }
        ),
        400: None,
    },
)
@api_view(['POST'])
@permission_classes([AllowAny]) # Tout le monde peut s'inscrire
def register_user(request):

    if len(request.data.get('password', '')) < 8:
        return Response(
            {"error": "Le mot de passe doit contenir au moins 8 caractères."},
            status=status.HTTP_400_BAD_REQUEST
        )

    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()

        # Envoi de l'email de confirmation via la fonction utilitaire
        send_confirmation_email(user)

        return Response({
            "message": "Utilisateur créé ! Vérifie ta boîte mail pour confirmer ton inscription.",
            "user": {"email": user.email, "name": user.name}
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@extend_schema(
    tags=["Auth"],
    summary="Confirmer l'email de l'utilisateur et le connecter automatiquement",
)
@api_view(['GET'])
@permission_classes([AllowAny])
def confirm_email(request, uidb64, token):
    """
    Étapes :
    1) On récupère l'utilisateur à partir de l'identifiant encodé (uidb64)
    2) On vérifie que le token est valide
    3) Si tout est bon : on active le compte
    4) On génère les tokens JWT (access + refresh)
    5) On renvoie les tokens au frontend (JSON)
    """
    try:
        # 1) Décodage de l'identifiant utilisateur
        uid = force_str(urlsafe_base64_decode(uidb64))
        user = User.objects.get(pk=uid)
    except (TypeError, ValueError, OverflowError, User.DoesNotExist):
        user = None

    # 2) Vérification du token
    if user is not None and not email_confirmation_token_generator.check_token(user, token):
        # Token expiré ou invalide → on renvoie l'email pour permettre le renvoi
        return Response({
            "error": "Lien de confirmation invalide ou expiré.",
            "email": user.email
        }, status=status.HTTP_400_BAD_REQUEST)

    if user is None:
        return Response({"error": "Lien de confirmation invalide ou expiré."}, status=status.HTTP_400_BAD_REQUEST)

    # 3) On active le compte si nécessaire
    if not user.is_active:
        user.is_active = True
        user.save()

    # 4) On génère les tokens JWT pour connecter automatiquement l'utilisateur
    #    (sans demander le mot de passe, puisqu'il vient de prouver qu'il possède l'email)
    refresh = TokenObtainPairSerializer.get_token(user)
    access = str(refresh.access_token)
    refresh_str = str(refresh)

    # 5) On renvoie les tokens en JSON.
    #    Le frontend (via une route Next) pourra ensuite les mettre
    #    dans des cookies HTTP-only.
    return Response({"access": access, "refresh": refresh_str}, status=status.HTTP_200_OK)


@extend_schema(
    tags=["Auth"],
    summary="Renvoyer l'email de confirmation",
    request=inline_serializer(
        name="ResendConfirmationRequest",
        fields={
            "email": drf_serializers.EmailField(),
        }
    ),
    responses={
        200: inline_serializer(
            name="ResendConfirmationSuccess",
            fields={"message": drf_serializers.CharField()}
        ),
    },
)
@api_view(['POST'])
@permission_classes([AllowAny])
def resend_confirmation_email(request):
    """
    Renvoie l'email de confirmation pour un utilisateur inactif.
    On renvoie toujours un message de succès pour ne pas révéler
    si un email est inscrit ou non (sécurité).
    """
    email = request.data.get('email', '').strip().lower()
    action = request.data.get('action', '')

    if not email:
        return Response(
            {"error": "L'adresse email est obligatoire."},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        user = User.objects.get(email=email)

        if action == "inscription":

            if user.is_active:
                # Compte déjà activé → on ne renvoie pas d'email
                return Response(
                    {"message": "Si un compte existe avec cet email, un nouveau lien a été envoyé."},
                    status=status.HTTP_200_OK
                )

            send_confirmation_email(user)
        elif action == "forgot-password":
            send_password_reset_email(user)
        else:
            return Response(
                {"message": "Données invalides."},
                status=status.HTTP_400_BAD_REQUEST
            )

    except User.DoesNotExist:
        # On ne révèle pas que l'email n'existe pas
        pass

    return Response(
        {"message": "Si un compte existe avec cet email, un nouveau lien a été envoyé."},
        status=status.HTTP_200_OK
    )


@extend_schema(
    tags=["Auth"],
    summary="Demander un email de réinitialisation de mot de passe",
    request=inline_serializer(
        name="ForgotPasswordRequest",
        fields={
            "email": drf_serializers.EmailField(),
        }
    ),
    responses={
        200: inline_serializer(
            name="ForgotPasswordSuccess",
            fields={"message": drf_serializers.CharField()}
        ),
    },
)
@api_view(['POST'])
@permission_classes([AllowAny])
def forgot_password(request):
    """
    Envoie un email de réinitialisation de mot de passe.
    Renvoie toujours un succès pour ne pas révéler si l'email existe.
    """
    email = request.data.get('email', '').strip().lower()

    if not email:
        return Response(
            {"error": "L'adresse email est obligatoire."},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        user = User.objects.get(email=email)

        if not user.is_active:
            # Compte non activé → on ne renvoie pas d'email de reset
            return Response(
                {"message": "Email de réinitialisation envoyé ! Vérifiez votre boîte mail."},
                status=status.HTTP_200_OK
            )

        send_password_reset_email(user)

    except User.DoesNotExist:
        pass

    return Response(
        {"message": "Email de réinitialisation envoyé ! Vérifiez votre boîte mail."},
        status=status.HTTP_200_OK
    )


@extend_schema(
    tags=["Auth"],
    summary="Confirmer le token pour reinitialiser le mot de passe",
    request=inline_serializer(
        name="PasswordConfirmRequest",
        fields={
            "uid": drf_serializers.CharField(),
            "token": drf_serializers.CharField(),
        }
    ),
    responses={
        200: inline_serializer(
            name="PasswordConfirmSuccess",
            fields={"message": drf_serializers.CharField()}
        ),
        400: inline_serializer(
            name="PasswordConfirmError",
            fields={"error": drf_serializers.CharField()}
        ),
    },
)
@api_view(['GET'])
@permission_classes([AllowAny])
def password_confirm(request, uidb64, token):
    """
    Valide le token de réinitialisation .
    """

    try:
        # 1) Décodage de l'identifiant utilisateur
        uid = force_str(urlsafe_base64_decode(uidb64))
        user = User.objects.get(pk=uid)
    except (TypeError, ValueError, OverflowError, User.DoesNotExist):
        user = None

    # 2) Vérification du token
    if user is not None and not email_confirmation_token_generator.check_token(user, token):
        return Response(
            {"error": "Le lien de réinitialisation est invalide ou a expiré."},
            status=status.HTTP_400_BAD_REQUEST
        )

    if user is None:
        return Response({"error": "Lien de confirmation invalide ou expiré."}, status=status.HTTP_400_BAD_REQUEST)


    return Response(
        {"uid": uid, "token": token},
        status=status.HTTP_200_OK
    )


@extend_schema(
    tags=["Auth"],
    summary="Réinitialiser le mot de passe avec un token",
    request=inline_serializer(
        name="ResetPasswordConfirmRequest",
        fields={
            "uid": drf_serializers.CharField(),
            "token": drf_serializers.CharField(),
            "password": drf_serializers.CharField(),
            "password_confirm": drf_serializers.CharField(),
        }
    ),
    responses={
        200: inline_serializer(
            name="ResetPasswordConfirmSuccess",
            fields={"message": drf_serializers.CharField()}
        ),
        400: inline_serializer(
            name="ResetPasswordConfirmError",
            fields={"error": drf_serializers.CharField()}
        ),
    },
)
@api_view(['POST'])
@permission_classes([AllowAny])
def reset_password_confirm(request):
    """
    Valide le token de réinitialisation et change le mot de passe.
    Après set_password(), le token est automatiquement invalidé
    car Django utilise le hash du mot de passe dans le token.
    """
    uid = request.data.get('uid', '')
    token = request.data.get('token', '')
    password = request.data.get('password', '')
    password_confirm = request.data.get('password_confirm', '')

    if not uid or not token or not password or not password_confirm:
        return Response(
            {"error": "Tous les champs sont obligatoires."},
            status=status.HTTP_400_BAD_REQUEST
        )

    if password != password_confirm:
        return Response(
            {"error": "Les mots de passe ne correspondent pas."},
            status=status.HTTP_400_BAD_REQUEST
        )

    if len(password) < 8:
        return Response(
            {"error": "Le mot de passe doit contenir au moins 8 caractères."},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        user_id = force_str(urlsafe_base64_decode(uid))
        user = User.objects.get(pk=user_id)
    except (TypeError, ValueError, OverflowError, User.DoesNotExist):
        return Response(
            {"error": "Le Lien de réinitialisation est invalide ou a expiré."},
            status=status.HTTP_400_BAD_REQUEST
        )

    if not email_confirmation_token_generator.check_token(user, token):
        return Response(
            {"error": "Le lien de réinitialisation est invalide ou a expiré."},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Changer le mot de passe (invalide automatiquement le token)
    user.set_password(password)
    user.save()

    return Response(
        {"message": "Mot de passe réinitialisé avec succès. Vous pouvez maintenant vous connecter."},
        status=status.HTTP_200_OK
    )


@extend_schema(
    tags=["Transactions"],
    methods=["GET"],
    summary="Lister les transactions de l'utilisateur connecté",
    responses={200: TransactionSerializer(many=True)},
)
@extend_schema(
    tags=["Transactions"],
    methods=["POST"],
    summary="Créer une nouvelle transaction pour l'utilisateur connecté",
    request=TransactionSerializer,
    responses={201: TransactionSerializer, 400: None},
)
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def transaction_list(request):
    if request.method == 'GET':
        # On ne récupère que les transactions de l'utilisateur connecté
        transactions = Transaction.objects.filter(user=request.user)
        serializer = TransactionSerializer(transactions, many=True)
        return Response(serializer.data)

    if request.method == 'POST':
        # On force l'utilisateur de la transaction à être l'utilisateur connecté
        serializer = TransactionSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@extend_schema(
    tags=["Transactions"],
    methods=["GET"],
    summary="Récupérer les détails de la transaction",
    responses={200: TransactionSerializer, 404: None},
)
@extend_schema(
    tags=["Transactions"],
    methods=["PUT"],
    summary="Mettre à jour une transaction",
    request=TransactionSerializer,
    responses={200: TransactionSerializer, 400: None, 404: None},
)
@extend_schema(
    tags=["Transactions"],
    methods=["DELETE"],
    summary="Supprimer une transaction",
    responses={
        204: inline_serializer(
            name="BarberDeleteResponse",
            fields={"message": drf_serializers.CharField()}
        ),
        404: None,
    },
)
@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def transaction_detail(request, pk):
    # 1. On cherche la transaction appartenant à l'utilisateur connecté
    try:
        transaction = Transaction.objects.get(pk=pk, user=request.user)
    except Transaction.DoesNotExist:
        return Response({"error": "Transaction non trouvée"}, status=status.HTTP_404_NOT_FOUND)

    # 2. Modification (PUT)
    if request.method == 'PUT':
        serializer = TransactionSerializer(transaction, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # 3. Suppression (DELETE)
    elif request.method == 'DELETE':
        transaction.delete()
        return Response({"message": "Supprimée avec succès"}, status=status.HTTP_204_NO_CONTENT)
    
    # 4. Lecture d'une seule transaction (GET)
    elif request.method == 'GET':
        serializer = TransactionSerializer(transaction)
        return Response(serializer.data)


@extend_schema(
    tags=["Profil"],
    methods=["GET"],
    summary="Récupérer le profil de l'utilisateur connecté",
    responses={
        200: inline_serializer(
            name="UserProfileResponse",
            fields={
                "id": drf_serializers.UUIDField(),
                "name": drf_serializers.CharField(),
                "email": drf_serializers.EmailField(),
            }
        ),
    },
)
@extend_schema(
    tags=["Profil"],
    methods=["PUT"],
    summary="Mettre à jour le profil de l'utilisateur connecté",
    request=UserSerializer,
    responses={
        200: inline_serializer(
            name="UserProfileUpdateResponse",
            fields={
                "id": drf_serializers.UUIDField(),
                "name": drf_serializers.CharField(),
                "email": drf_serializers.EmailField(),
            }
        ),
        400: None,
    },
)
@extend_schema(
    tags=["Profil"],
    methods=["DELETE"],
    summary="Supprimer le compte de l'utilisateur connecté",
    responses={
        204: inline_serializer(
            name="UserDeleteResponse",
            fields={"message": drf_serializers.CharField()}
        ),
    },
)
@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def get_user_profile(request):
    if request.method == 'GET':
        return Response({ "id": request.user.id, "name": request.user.name, "email": request.user.email })
    
    if request.method == 'PUT':
        # partial=True permet de n'envoyer que les champs modifiés
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({ "id": request.user.id, "name": request.user.name, "email": request.user.email })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    if request.method == 'DELETE':
        request.user.delete()
        return Response({"message": "Utilisateur supprimé avec succès."}, status=status.HTTP_204_NO_CONTENT)


@extend_schema(
    tags=["Profil"],
    summary="Changer le mot de passe de l'utilisateur connecté",
    request=inline_serializer(
        name="UpdatePasswordRequest",
        fields={
            "currentPassword": drf_serializers.CharField(),
            "newPassword": drf_serializers.CharField(),
        }
    ),
    responses={
        200: inline_serializer(
            name="UpdatePasswordSuccess",
            fields={"message": drf_serializers.CharField()}
        ),
        400: inline_serializer(
            name="UpdatePasswordError",
            fields={"error": drf_serializers.CharField()}
        ),
    },
)
@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_password(request):
    currentPassword = request.data.get("currentPassword")
    newPassword = request.data.get("newPassword")
    if not currentPassword or not newPassword:
        return Response(
            {"error": "Les champs 'password' et 'newpassword' sont obligatoires."},
            status=status.HTTP_400_BAD_REQUEST,
        )
    user = request.user
    if not user.check_password(currentPassword):
        return Response(
            {"error": "Mot de passe actuel incorrect."},
            status=status.HTTP_400_BAD_REQUEST,
        )
    user.set_password(newPassword)
    user.save()
    return Response(
        {"message": "Mot de passe mis à jour avec succès."},
        status=status.HTTP_200_OK,
    )


@extend_schema(
    tags=["Stats"],
    summary="Statistiques du mois",
    request=inline_serializer(
        name="MonthlySummary",
        fields={
            "month": drf_serializers.CharField(),
            "year": drf_serializers.CharField(),
        }
    ),
    responses={
        200: inline_serializer(
            name="MonthlySummarySuccess",
            fields={"message": drf_serializers.CharField()}
        ),
        400: inline_serializer(
            name="MonthlySummaryError",
            fields={"error": drf_serializers.CharField()}
        ),
    },
)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def monthly_summary(request):
    """
    POST /api/transactions/monthly-summary/
    Body: { "month": 6, "year": 2025 }
    Retourne un résumé financier complet du mois demandé
    """
    from django.db.models import Sum, Count
    from decimal import Decimal

    # ── 1. Validation des paramètres ──────────────────────────────────────────
    month = request.data.get("month")
    year = request.data.get("year")

    if not month or not year:
        return Response(
            {"error": "Les champs 'month' et 'year' sont obligatoires."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        month = int(month)
        year = int(year)
    except (ValueError, TypeError):
        return Response(
            {"error": "'month' et 'year' doivent être des entiers."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # ── 2. Toutes les transactions du mois pour cet utilisateur ───────────────
    all_transactions = Transaction.objects.filter(
        user=request.user,
        created_at__month=month,
        created_at__year=year,
    )

    # ── 3. Nombre total de transactions du mois ───────────────────────────────
    total_count = all_transactions.count()

    # ── 4. Séparation des transactions positives (revenus) et négatives (dépenses)
    # amount > 0 → revenus (ex: salaire, vente...)
    # amount < 0 → dépenses (ex: loyer, facture...)
    positive_qs = all_transactions.filter(amount__gt=0)
    negative_qs = all_transactions.filter(amount__lt=0)

    # ── 5. Calcul des totaux ───────────────────────────────────────────────────
    # Sum retourne None si aucune transaction → on force 0.00
    total_income = positive_qs.aggregate(
        total=Sum("amount")
    )["total"] or Decimal("0.00")

    total_expenses = negative_qs.aggregate(
        total=Sum("amount")
    )["total"] or Decimal("0.00")

    # La balance est la différence entre revenus et dépenses
    # total_expenses est déjà négatif, donc on additionne directement
    # Ex: revenus = 500 000, dépenses = -150 000 → balance = 350 000
    balance = total_income + total_expenses

    # ── 6. Sérialisation des listes de transactions ───────────────────────────
    # On construit manuellement pour garder le contrôle sur les champs retournés
    def serialize_transactions(queryset):
        return [
            {
                "id": str(t.id),
                "text": t.text,
                "amount": t.amount,
                "created_at": t.created_at,
            }
            for t in queryset
        ]

    positive_list = serialize_transactions(positive_qs)
    negative_list = serialize_transactions(negative_qs)

    # ── 7. Retour de la réponse complète ──────────────────────────────────────
    return Response({
        "month": month,
        "year": year,
        "total_count": total_count,             # Nombre total de transactions
        "total_income": total_income,           # Somme des montants positifs
        "total_expenses": total_expenses,       # Somme des montants négatifs
        "balance": balance,                     # Différence revenus - dépenses
        "income_transactions": positive_list,   # Liste des transactions positives
        "expense_transactions": negative_list,  # Liste des transactions négatives
    }, status=status.HTTP_200_OK)
