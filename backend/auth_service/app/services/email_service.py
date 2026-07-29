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


def send_welcome_email(
    to_email: str,
    first_name: str,
    tenant_name: str = "Proccura",
    role_name: str = "User",
):
    """Publish a welcome email event to Kafka."""
    payload = {
        "to_email": to_email,
        "first_name": first_name,
        "tenant_name": tenant_name,
        "role_name": role_name,
    }
    try:
        producer = _get_producer()
        producer.produce(
            topic="notification.email.welcome",
            value=json.dumps(payload).encode("utf-8"),
            callback=_delivery_report,
        )
        producer.flush(timeout=5)
        logger.info(f"Welcome email event published for {to_email}")
    except Exception as e:
        logger.error(f"Failed to publish welcome email event for {to_email}: {e}")
