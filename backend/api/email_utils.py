from django.conf import settings
from django.core.mail import send_mail
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode

from .tokens import email_confirmation_token_generator


def send_confirmation_email(user):
    """
    Génère un token + envoie l'email de confirmation d'inscription.
    Réutilisable partout (register, resend, etc.)
    """
    uidb64 = urlsafe_base64_encode(force_bytes(user.pk))
    token = email_confirmation_token_generator.make_token(user)
    action = "inscription"

    confirm_url = f"{settings.FRONTEND_URL.rstrip('/')}/auth/confirm?uid={uidb64}&token={token}&action={action}"

    subject = "Confirmez votre inscription à DepenseFlow"
    message = (
        f"Bonjour {user.name},\n\n"
        "Merci de vous être inscrit à DepenseFlow.\n"
        "Pour activer votre compte et vous connecter automatiquement, cliquez sur le lien suivant :\n\n"
        f"{confirm_url}\n\n"
        "Ce lien expire dans 10 minutes.\n\n"
        "Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet email."
    )

    send_mail(
        subject,
        message,
        settings.EMAIL_HOST_USER,
        [user.email],
        fail_silently=False,
    )


def send_password_reset_email(user):
    """
    Génère un token + envoie l'email de réinitialisation de mot de passe.
    Utilise le même générateur avec expiration de 10 minutes.
    """
    uidb64 = urlsafe_base64_encode(force_bytes(user.pk))
    token = email_confirmation_token_generator.make_token(user)
    action = "forgot-password"

    reset_url = f"{settings.FRONTEND_URL.rstrip('/')}/auth/confirm?uid={uidb64}&token={token}&action={action}"

    subject = "Réinitialisation de votre mot de passe — DepenseFlow"
    message = (
        f"Bonjour {user.name},\n\n"
        "Vous avez demandé la réinitialisation de votre mot de passe.\n"
        "Cliquez sur le lien suivant pour choisir un nouveau mot de passe :\n\n"
        f"{reset_url}\n\n"
        "Ce lien expire dans 10 minutes.\n\n"
        "Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet email."
    )

    send_mail(
        subject,
        message,
        settings.EMAIL_HOST_USER,
        [user.email],
        fail_silently=False,
    )
