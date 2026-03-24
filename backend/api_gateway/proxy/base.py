from fastapi import Request, Response, HTTPException
import httpx
import logging

logger = logging.getLogger(__name__)


async def proxy_request(
    request: Request, 
    target_base_url: str, 
    path: str
) -> Response:

    # Build full URL
    full_url = f"{target_base_url}{path}"
    
    logger.info(f"Proxying {request.method} {path} → {full_url}")
    
    # Get request body
    body = await request.body()
    
    # Forward headers (exclude problematic ones)
    headers = {
        k: v for k, v in request.headers.items() 
        if k.lower() not in ["host", "content-length"]
    }

    # Inject user context headers if authenticated
    user = getattr(request.state, "user", None)
    if user:
        if user.get("id"):
            headers["X-User-ID"] = str(user["id"])
        if user.get("email"):
            headers["X-User-Email"] = str(user["email"])
        if user.get("tenant_id"):
            headers["X-Tenant-ID"] = str(user["tenant_id"])
        if user.get("role_id"):
            headers["X-Role-ID"] = str(user["role_id"])
        if user.get("user_type"):
            headers["X-User-Type"] = str(user["user_type"])
        if "is_super_admin" in user:
            headers["X-Is-Super-Admin"] = str(user["is_super_admin"]).lower()
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.request(
                method=request.method,
                url=full_url,
                headers=headers,
                params=dict(request.query_params),
                content=body,
            )
        
        # Return response as-is from backend
        return Response(
            content=response.content,
            status_code=response.status_code,
            headers=dict(response.headers),
        )
    
    except httpx.TimeoutException:
        logger.error(f"Timeout calling {full_url}")
        raise HTTPException(status_code=504, detail="Service timeout")
    
    except httpx.RequestError as e:
        logger.error(f"Error calling {full_url}: {str(e)}")
        raise HTTPException(status_code=503, detail="Service unavailable")