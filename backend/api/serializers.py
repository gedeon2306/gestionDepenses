from rest_framework import serializers
from .models import User, Transaction

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'name', 'email', 'password']
        extra_kwargs = {'password': {'write_only': True}} # On ne renvoie jamais le MDP en JSON

    def create(self, validated_data):
        # Utilise la méthode create_user définie dans le Manager pour hacher le MDP
        return User.objects.create_user(**validated_data)

class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = '__all__' # Expose tous les champs (id, text, amount, user, etc.)
        read_only_fields = ['user']