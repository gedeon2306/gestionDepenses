import uuid
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager

# Manager pour gérer la création des utilisateurs
class UserManager(BaseUserManager):
    def create_user(self, email, name, password=None):
        # 1) On vérifie que l'email est bien fourni
        if not email:
            raise ValueError("L'email est obligatoire")

        # 2) On crée l'instance d'utilisateur SANS l'enregistrer
        user = self.model(
            email=self.normalize_email(email),
            name=name,
        )

        # 3) On hache le mot de passe
        user.set_password(password)

        # 4) Par sécurité, l'utilisateur est inactif tant
        #    qu'il n'a pas confirmé son adresse email
        user.is_active = False

        # 5) On enregistre l'utilisateur en base
        user.save(using=self._db)
        return user

class User(AbstractBaseUser):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    # L'utilisateur ne pourra pas se connecter tant qu'il
    # n'a pas confirmé son adresse email
    is_active = models.BooleanField(default=False)
    
    objects = UserManager()

    USERNAME_FIELD = 'email' # On se connecte avec l'email
    REQUIRED_FIELDS = ['name']

class Transaction(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='transactions')
    text = models.CharField(max_length=255)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.text} ({self.amount})"