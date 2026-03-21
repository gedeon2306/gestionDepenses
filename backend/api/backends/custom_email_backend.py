# api/backends/custom_email_backend.py

from django.core.mail.backends.smtp import EmailBackend as SMTPEmailBackend
import ssl
import smtplib

class CustomEmailBackend(SMTPEmailBackend):
    def __init__(self, *args, **kwargs):
        self.check_hostname = kwargs.pop('check_hostname', True)
        self.verify_mode = kwargs.pop('verify_mode', ssl.CERT_NONE)

        # Ensure compatibility between check_hostname and verify_mode
        if self.verify_mode == ssl.CERT_NONE:
            self.check_hostname = False

        super().__init__(*args, **kwargs)

    def open(self):
        if self.connection:
            return False
        try:
            self.connection = self._create_smtp_connection()
            return True
        except smtplib.SMTPException:
            if not self.fail_silently:
                raise
            return False

    def _create_smtp_connection(self):
        context = ssl.create_default_context()
        context.check_hostname = self.check_hostname
        context.verify_mode = self.verify_mode

        connection_params = {
            'host': self.host,
            'port': self.port,
            'timeout': self.timeout,
        }

        connection = smtplib.SMTP(**connection_params)
        connection.starttls(context=context)

        if self.username and self.password:
            connection.login(self.username, self.password)

        return connection
