import httpx
import logging
from typing import Optional, Dict, Any
from fastapi import HTTPException
from config import settings

logger = logging.getLogger(__name__)


class ServiceClient:
    """HTTP client for communicating with backend microservices"""
    
    def __init__(self):
        self.timeout = httpx.Timeout(settings.SERVICE_TIMEOUT)
    
    async def _make_request(
        self,
        method: str,
        url: str,
        headers: Optional[Dict[str, str]] = None,
        json: Optional[Dict[str, Any]] = None,
        params: Optional[Dict[str, Any]] = None,
    ) -> httpx.Response:
        """Make HTTP request to backend service"""
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.request(
                    method=method,
                    url=url,
                    headers=headers,
                    json=json,
                    params=params
                )
                return response
        except httpx.TimeoutException:
            logger.error(f"Service timeout: {url}")
            raise HTTPException(
                status_code=504,
                detail="Service timeout"
            )
        except httpx.RequestError as e:
            logger.error(f"Service request error: {str(e)}")
            raise HTTPException(
                status_code=503,
                detail="Service unavailable"
            )
    
    async def proxy_request(
        self,
        service_url: str,
        path: str,
        method: str,
        headers: Optional[Dict[str, str]] = None,
        json: Optional[Dict[str, Any]] = None,
        params: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """
        Proxy request to backend service and return response.
        
        Args:
            service_url: Base URL of the service (e.g., http://localhost:8001)
            path: API path (e.g., /api/v1/users)
            method: HTTP method
            headers: Request headers to forward
            json: JSON body
            params: Query parameters
        
        Returns:
            Response JSON data
        """
        full_url = f"{service_url}{path}"
        
        logger.info(f"Proxying {method} request to {full_url}")
        
        response = await self._make_request(
            method=method,
            url=full_url,
            headers=headers,
            json=json,
            params=params
        )
        
        # If service returns error, propagate it
        if response.status_code >= 400:
            try:
                error_data = response.json()
            except:
                error_data = {"detail": response.text}
            
            raise HTTPException(
                status_code=response.status_code,
                detail=error_data
            )
        
        # Return successful response
        try:
            return response.json()
        except:
            return {"message": "Success"}


# Singleton instance
service_client = ServiceClient()