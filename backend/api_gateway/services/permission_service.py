import redis.asyncio as redis
import httpx
import json
import logging
from typing import Optional

from config import settings

logger = logging.getLogger(__name__)

_redis_pool: Optional[redis.Redis] = None


async def get_redis() -> redis.Redis:
    """Get Redis connection from pool."""
    global _redis_pool
    if _redis_pool is None:
        _redis_pool = redis.from_url(
            settings.REDIS_URL,
            encoding="utf-8",
            decode_responses=True
        )
    return _redis_pool


async def close_redis():
    """Close Redis connection pool."""
    global _redis_pool
    if _redis_pool:
        await _redis_pool.close()
        _redis_pool = None


async def get_role_permissions_from_auth(role_id: str) -> list[str]:
    """Fetch role permissions from Auth Service."""
    url = f"{settings.AUTH_SERVICE_URL}/api/v1/internal/roles/{role_id}/permissions"
    
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(url)
            if response.status_code == 200:
                return response.json()
            else:
                logger.error(f"Auth service returned {response.status_code} for role {role_id}")
                return []
    except Exception as e:
        logger.error(f"Failed to fetch permissions from auth service: {e}")
        return []


async def has_permission(role_id: str, permission: str) -> bool:
    """
    Check if a role has a specific permission.
    Uses Redis cache with Auth Service fallback.
    
    Returns True if the role has the permission, False otherwise.
    """
    if not role_id:
        return False
    
    cache_key = f"role:{role_id}:permissions"
    
    try:
        redis_client = await get_redis()
        
        exists = await redis_client.sismember(cache_key, permission)
        
        if exists:
            return True
        
        set_exists = await redis_client.exists(cache_key)
        
        if set_exists:
            return False
        
        logger.info(f"Cache miss for role {role_id}, fetching from auth service")
        permissions = await get_role_permissions_from_auth(role_id)
        
        if permissions:
            await redis_client.sadd(cache_key, *permissions)
            await redis_client.expire(cache_key, settings.PERMISSION_CACHE_TTL)
            
            return permission in permissions
        
        return False
        
    except redis.RedisError as e:
        logger.error(f"Redis error: {e}, falling back to auth service")
        permissions = await get_role_permissions_from_auth(role_id)
        return permission in permissions


async def invalidate_role_cache(role_id: str):
    """Invalidate cached permissions for a role."""
    cache_key = f"role:{role_id}:permissions"
    try:
        redis_client = await get_redis()
        await redis_client.delete(cache_key)
        logger.info(f"Invalidated cache for role {role_id}")
    except redis.RedisError as e:
        logger.error(f"Failed to invalidate cache for role {role_id}: {e}")
