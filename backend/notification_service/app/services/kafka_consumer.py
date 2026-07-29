import json
import logging
from confluent_kafka import Consumer, KafkaError
from app.services.email_service import (
    send_welcome_email,
    send_invitation_email,
    send_registration_notification,
)
from app.schemas.email import (
    WelcomeEmailPayload,
    InvitationEmailPayload,
    RegistrationNotificationPayload,
)

logger = logging.getLogger(__name__)

TOPICS = [
    "notification.email.welcome",
    "notification.email.invitation",
    "notification.email.registration_complete",
]

HANDLERS = {
    "notification.email.welcome": (
        WelcomeEmailPayload, 
        lambda p: send_welcome_email(
            to_email=p.to_email, first_name=p.first_name,
            tenant_name=p.tenant_name, role_name=p.role_name
        )
    ),
    "notification.email.invitation": (
        InvitationEmailPayload,
        lambda p: send_invitation_email(
            to_email=p.to_email, business_name=p.business_name,
            invitation_token=p.invitation_token, tenant_name=p.tenant_name
        )
    ),
    "notification.email.registration_complete": (
        RegistrationNotificationPayload,
        lambda p: send_registration_notification(
            to_email=p.to_email, vendor_name=p.vendor_name,
            business_name=p.business_name, tenant_name=p.tenant_name
        )
    ),
}


class NotificationConsumer:
    def __init__(self, bootstrap_servers: str):
        self.consumer = Consumer({
            "bootstrap.servers": bootstrap_servers,
            "group.id": "notification-service",
            "auto.offset.reset": "earliest",
            "enable.auto.commit": True,
        })
        self._running = False

    def start(self):
        self.consumer.subscribe(TOPICS)
        self._running = True
        logger.info(f"Kafka consumer started, subscribed to: {TOPICS}")

        while self._running:
            msg = self.consumer.poll(timeout=1.0)
            if msg is None:
                continue
            if msg.error():
                if msg.error().code() == KafkaError._PARTITION_EOF:
                    continue
                logger.error(f"Kafka error: {msg.error()}")
                continue

            topic = msg.topic()
            try:
                data = json.loads(msg.value().decode("utf-8"))
                logger.info(f"Received message on topic '{topic}': {data}")

                if topic in HANDLERS:
                    schema_cls, handler_fn = HANDLERS[topic]
                    payload = schema_cls(**data)
                    handler_fn(payload)
                else:
                    logger.warning(f"No handler for topic: {topic}")
            except Exception as e:
                logger.error(f"Error processing message from '{topic}': {e}")

    def stop(self):
        self._running = False
        self.consumer.close()
        logger.info("Kafka consumer stopped.")
