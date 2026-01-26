from fastapi import Request, Response, HTTPException
import httpx
import logging

logger = logging.getLogger(__name__)


async def proxy_request(
    request: Request, 
    target_base_url: str, 
    path: str
) -> Response:
    """
    Generic proxy function that forwards requests to backend services.
    
    Args:
        request: FastAPI request object
        target_base_url: Base URL of target service (e.g., http://localhost:8001)
        path: Path to append to base URL (e.g., /api/v1/auth/login)
    
    Returns:
        Response from backend service
    """
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