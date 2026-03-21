from django.contrib.auth.tokens import PasswordResetTokenGenerator


class EmailConfirmationTokenGenerator(PasswordResetTokenGenerator):
    """
    Générateur de token pour la confirmation d'email.
    Expire après 10 minutes (600 secondes) au lieu du délai par défaut de Django.
    """

    def __init__(self):
        super().__init__()
        self._timeout = 600  # 10 minutes en secondes

    def check_token(self, user, token):
        """
        Vérifie le token en utilisant notre timeout personnalisé de 10 minutes.
        On surcharge temporairement PASSWORD_RESET_TIMEOUT pour la vérification.
        """
        from django.conf import settings

        # Sauvegarder la valeur originale
        original_timeout = getattr(settings, 'PASSWORD_RESET_TIMEOUT', 259200)

        try:
            # Forcer le timeout à 10 minutes pour cette vérification
            settings.PASSWORD_RESET_TIMEOUT = self._timeout
            return super().check_token(user, token)
        finally:
            # Restaurer la valeur originale
            settings.PASSWORD_RESET_TIMEOUT = original_timeout


email_confirmation_token_generator = EmailConfirmationTokenGenerator()
