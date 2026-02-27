from django.shortcuts import render
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import Transaction
from .serializers import UserSerializer, TransactionSerializer


def landing_view(request):
    return render(request, "landing.html")

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

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated]) # SEULS les gens avec un JWT valide entrent ici
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

@api_view(['GET', 'PUT'])
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