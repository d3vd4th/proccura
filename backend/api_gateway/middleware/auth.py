from fastapi import Request, HTTPException
from jose import jwt, JWTError
from config import settings

async def require_auth(request: Request):
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        raise HTTPException(status_code=401, detail="Missing Authorization header")
    
    try:
        scheme, token = auth_header.split()
        if scheme.lower() != 'bearer':
             raise HTTPException(status_code=401, detail="Invalid authentication scheme")
             
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        request.state.user = payload # Store user info in request state
        
    except (ValueError, JWTError):
        raise HTTPException(status_code=401, detail="Invalid token")
