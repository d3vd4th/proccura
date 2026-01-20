import time
from collections import defaultdict
from starlette.middleware.base import BaseHTTPMiddleware
from fastapi import Request, HTTPException, status
from api_gateway.config import settings


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Simple in-memory rate limiting (use Redis in production)"""
    
    def __init__(self, app):
        super().__init__(app)
        # Store: {client_ip: [(timestamp, count)]}
        self.clients = defaultdict(list)
        self.cleanup_interval = 60  # Clean up every 60 seconds
        self.last_cleanup = time.time()
    
    def _cleanup_old_requests(self):
        """Remove old request records"""
        current_time = time.time()
        if current_time - self.last_cleanup > self.cleanup_interval:
            cutoff_time = current_time - settings.RATE_LIMIT_PERIOD
            for client_ip in list(self.clients.keys()):
                self.clients[client_ip] = [
                    req_time for req_time in self.clients[client_ip]
                    if req_time > cutoff_time
                ]
                if not self.clients[client_ip]:
                    del self.clients[client_ip]
            self.last_cleanup = current_time
    
    async def dispatch(self, request: Request, call_next):
        # Skip rate limiting for health checks
        if request.url.path in ["/health", "/ready", "/"]:
            return await call_next(request)
        
        # Get client IP
        client_ip = request.client.host
        
        # Cleanup old records periodically
        self._cleanup_old_requests()
        
        # Get current time
        current_time = time.time()
        cutoff_time = current_time - settings.RATE_LIMIT_PERIOD
        
        # Get recent requests from this IP
        recent_requests = [
            req_time for req_time in self.clients[client_ip]
            if req_time > cutoff_time
        ]
        
        # Check rate limit
        if len(recent_requests) >= settings.RATE_LIMIT_REQUESTS:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail={
                    "error": "Rate limit exceeded",
                    "limit": settings.RATE_LIMIT_REQUESTS,
                    "period": f"{settings.RATE_LIMIT_PERIOD}s",
                    "retry_after": int(settings.RATE_LIMIT_PERIOD - (current_time - min(recent_requests)))
                }
            )
        
        # Add current request
        self.clients[client_ip].append(current_time)
        
        # Process request
        response = await call_next(request)
        
        # Add rate limit headers
        response.headers["X-RateLimit-Limit"] = str(settings.RATE_LIMIT_REQUESTS)
        response.headers["X-RateLimit-Remaining"] = str(
            settings.RATE_LIMIT_REQUESTS - len(recent_requests) - 1
        )
        response.headers["X-RateLimit-Reset"] = str(
            int(current_time + settings.RATE_LIMIT_PERIOD)
        )
        
        return response