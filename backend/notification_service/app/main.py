import threading
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from app.core.config import settings
from app.services.kafka_consumer import NotificationConsumer
from app.api.endpoints import router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

consumer_instance = None
consumer_thread = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global consumer_instance, consumer_thread
    consumer_instance = NotificationConsumer(settings.KAFKA_BOOTSTRAP_SERVERS)
    consumer_thread = threading.Thread(target=consumer_instance.start, daemon=True)
    consumer_thread.start()
    logger.info("Notification service started with Kafka consumer.")
    yield
    if consumer_instance:
        consumer_instance.stop()
    logger.info("Notification service shutting down.")


app = FastAPI(
    title="Proccura Notification Service",
    description="Centralized notification microservice",
    version="1.0.0",
    lifespan=lifespan,
)

app.include_router(router)
