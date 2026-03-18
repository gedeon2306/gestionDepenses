from django.shortcuts import render
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from drf_spectacular.utils import extend_schema, inline_serializer
from drf_spectacular.types import OpenApiTypes
from rest_framework import serializers as drf_serializers
from rest_framework import status
from .models import Transaction
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
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        return Response({
            "message": "Utilisateur créé !",
            "user": {"email": user.email, "name": user.name}
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


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