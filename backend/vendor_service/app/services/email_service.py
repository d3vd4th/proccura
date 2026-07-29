import json
import logging
from confluent_kafka import Producer
from app.core.config import settings

logger = logging.getLogger(__name__)

_producer = None


def _get_producer() -> Producer:
    global _producer
    if _producer is None:
        _producer = Producer({
            "bootstrap.servers": settings.KAFKA_BOOTSTRAP_SERVERS,
        })
    return _producer


def _delivery_report(err, msg):
    if err is not None:
        logger.error(f"Kafka delivery failed: {err}")
    else:
        logger.info(f"Message delivered to {msg.topic()} [{msg.partition()}]")


def send_invitation_email(
    to_email: str,
    business_name: str,
    invitation_token: str,
    tenant_name: str = "Proccura",
):
    """Publish an invitation email event to Kafka."""
    payload = {
        "to_email": to_email,
        "business_name": business_name,
        "invitation_token": invitation_token,
        "tenant_name": tenant_name,
    }
    try:
        producer = _get_producer()
        producer.produce(
            topic="notification.email.invitation",
            value=json.dumps(payload).encode("utf-8"),
            callback=_delivery_report,
        )
        producer.flush(timeout=5)
        logger.info(f"Invitation email event published for {to_email}")
    except Exception as e:
        logger.error(f"Failed to publish invitation email event for {to_email}: {e}")


def send_registration_notification(
    to_email: str,
    vendor_name: str,
    business_name: str,
    tenant_name: str = "Proccura",
):
    """Publish a registration notification event to Kafka."""
    payload = {
        "to_email": to_email,
        "vendor_name": vendor_name,
        "business_name": business_name,
        "tenant_name": tenant_name,
    }
    try:
        producer = _get_producer()
        producer.produce(
            topic="notification.email.registration_complete",
            value=json.dumps(payload).encode("utf-8"),
            callback=_delivery_report,
        )
        producer.flush(timeout=5)
        logger.info(f"Registration notification event published for {to_email}")
    except Exception as e:
        logger.error(f"Failed to publish registration notification event for {to_email}: {e}")
