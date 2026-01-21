from fastapi import APIRouter, Request
from typing import Dict, Any
from config import settings
from utils.http_client import service_client

router = APIRouter()


@router.post("/login")
async def login(request: Request):
    """Proxy login request to auth service"""
    body = await request.json()
    
    response = await service_client.proxy_request(
        service_url=settings.AUTH_SERVICE_URL,
        path="/api/v1/auth/login",
        method="POST",
        json=body
    )
    
    return response




@router.post("/refresh")
async def refresh_token(request: Request):
    """Proxy token refresh request to auth service"""
    body = await request.json()
    
    response = await service_client.proxy_request(
        service_url=settings.AUTH_SERVICE_URL,
        path="/api/v1/auth/refresh",
        method="POST",
        json=body
    )
    
    return response


@router.post("/logout")
async def logout(request: Request):
    """Proxy logout request to auth service"""
    authorization = request.headers.get("Authorization", "")
    
    response = await service_client.proxy_request(
        service_url=settings.AUTH_SERVICE_URL,
        path="/api/v1/auth/logout",
        method="POST",
        headers={"Authorization": authorization}
    )
    
    return response