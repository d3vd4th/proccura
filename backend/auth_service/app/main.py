from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parents[1]  # auth_service/
load_dotenv(BASE_DIR / ".env")
from fastapi import FastAPI
from auth_service.app.api.v1.router import api_router

import os
print("SECRET_KEY =", os.getenv("SECRET_KEY"))
app = FastAPI(
    title="Auth Service",
    version="1.0.0",
)

app.include_router(api_router, prefix="/api/v1")

@app.get("/health")
def health():
    return {"status": "Auth Service healthy"}