import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.config import settings

logger = logging.getLogger(__name__)


def send_invitation_email(
    to_email: str,
    business_name: str,
    invitation_token: str,
    tenant_name: str = "Proccura",
):
    """Send an invitation email with a unique registration link."""
    
    registration_url = f"{settings.FRONTEND_URL}/register/{invitation_token}"
    
    subject = f"You're Invited to Register on {tenant_name}"
    
    html_body = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: 'Inter', Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f7; }}
            .container {{ max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; margin-top: 32px; margin-bottom: 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }}
            .header {{ background-color: #0B1D51; padding: 32px; text-align: center; }}
            .header h1 {{ color: #ffffff; margin: 0; font-size: 24px; font-weight: 600; }}
            .body {{ padding: 32px; color: #333; line-height: 1.6; }}
            .body h2 {{ color: #0B1D51; margin-top: 0; }}
            .cta-button {{ display: inline-block; background-color: #0B1D51; color: #ffffff !important; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: 600; font-size: 16px; margin: 24px 0; }}
            .cta-button:hover {{ background-color: #162d6e; }}
            .footer {{ background-color: #f8fafc; padding: 24px 32px; text-align: center; color: #64748b; font-size: 13px; border-top: 1px solid #e2e8f0; }}
            .note {{ background-color: #f1f5f9; border-left: 4px solid #0B1D51; padding: 12px 16px; margin: 16px 0; border-radius: 0 4px 4px 0; font-size: 14px; color: #475569; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Proccura</h1>
            </div>
            <div class="body">
                <h2>Hello {business_name},</h2>
                <p>You have been invited to register as a vendor on <strong>{tenant_name}</strong>'s procurement platform.</p>
                <p>Please click the button below to complete your pre-registration:</p>
                <div style="text-align: center;">
                    <a href="{registration_url}" class="cta-button">Complete Registration</a>
                </div>
                <div class="note">
                    If the button doesn't work, copy and paste this link into your browser:<br>
                    <a href="{registration_url}" style="color: #0B1D51; word-break: break-all;">{registration_url}</a>
                </div>
                <p>This is a one-time use link. Once you complete the registration, the link will expire.</p>
            </div>
            <div class="footer">
                <p>&copy; Proccura. All rights reserved.</p>
                <p>This is an automated email. Please do not reply directly.</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    # If SMTP is not configured, log the URL instead (dev mode)
    if not settings.SMTP_USER or not settings.SMTP_PASSWORD:
        logger.warning(
            f"SMTP not configured. Invitation link for {to_email}: {registration_url}"
        )
        print(f"\n{'='*60}")
        print(f"📧 INVITATION EMAIL (Dev Mode - SMTP not configured)")
        print(f"   To: {to_email}")
        print(f"   Business: {business_name}")
        print(f"   Link: {registration_url}")
        print(f"{'='*60}\n")
        return True
    
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = f"{settings.SMTP_FROM_NAME} <{settings.SMTP_FROM_EMAIL}>"
        msg["To"] = to_email
        
        msg.attach(MIMEText(html_body, "html"))
        
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            server.starttls()
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.send_message(msg)
        
        logger.info(f"Invitation email sent to {to_email}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to send invitation email to {to_email}: {str(e)}")
        raise
