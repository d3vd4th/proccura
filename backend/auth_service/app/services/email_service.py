import resend
import logging
from app.core.config import settings

logger = logging.getLogger(__name__)


def send_welcome_email(
    to_email: str,
    first_name: str,
    tenant_name: str = "Proccura",
    role_name: str = "User",
    login_url: str = f"{settings.FRONTEND_URL}/login" if hasattr(settings, "FRONTEND_URL") else "http://localhost:5173/login",
):
    """Send a welcome email to a new user."""

    subject = f"Welcome to {tenant_name} on Proccura"

    html_body = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: 'Inter', Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f7; }}
            .container {{ max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; margin-top: 32px; margin-bottom: 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }}
            .header {{ background-color: #0B1D51; padding: 32px; text-align: center; }}
            .header h1 {{ color: #ffffff; margin: 0; font-size: 24px; font-weight: 400; }}
            .body {{ padding: 32px; color: #333; line-height: 1.6; }}
            .body h2 {{ color: #0B1D51; margin-top: 0; }}
            .cta-button {{ display: inline-block; background-color: #0B1D51; color: #ffffff !important; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: 600; font-size: 16px; margin: 24px 0; }}
            .footer {{ background-color: #f8fafc; padding: 24px 32px; text-align: center; color: #64748b; font-size: 13px; border-top: 1px solid #e2e8f0; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>proccura.</h1>
            </div>
            <div class="body">
                <h2>Hello {first_name},</h2>
                <p>Welcome to <strong>{tenant_name}</strong> on Proccura!</p>
                <p>Your account has been created successfully with the role: <strong>{role_name}</strong>.</p>
                <p>You can now log in to access the platform.</p>
                <div style="text-align: center;">
                    <a href="{login_url}" class="cta-button">Login to Proccura</a>
                </div>
                <p>If you did not request this account, please ignore this email.</p>
            </div>
            <div class="footer">
                <p>&copy; proccura. All rights reserved.</p>
                <p>This is an automated email. Please do not reply directly.</p>
            </div>
        </div>
    </body>
    </html>
    """

    # Dev mode fallback
    if not settings.RESEND_API_KEY:
        logger.warning(
            f"RESEND_API_KEY not configured. Welcome email for {to_email} not sent via API."
        )
        print(f"\n{'='*60}")
        print(f"📧 WELCOME EMAIL (Dev Mode - Resend not configured)")
        print(f"   To: {to_email}")
        print(f"   Name: {first_name}")
        print(f"   Login URL: {login_url}")
        print(f"{'='*60}\n")
        return True

    try:
        print(f"Sending welcome email to {to_email}")
        resend.api_key = settings.RESEND_API_KEY

        params = {
            "from": settings.RESEND_FROM_EMAIL,
            "to": [to_email],
            "subject": subject,
            "html": html_body,
        }

        email = resend.Emails.send(params)
        logger.info(f"Welcome email sent to {to_email} (id: {email['id']})")
        return True

    except Exception as e:
        logger.error(f"Failed to send welcome email to {to_email}: {str(e)}")
        # Don't raise exception to avoid rolling back user creation just for email failure
        return False
