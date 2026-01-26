#!/bin/bash

set -e

BASE_DIR="backend"
PROJECT_NAME="$BASE_DIR/api_gateway"

echo "🚀 Creating API Gateway inside backend/ ..."

mkdir -p $PROJECT_NAME/{proxy,middleware}

touch $PROJECT_NAME/main.py
touch $PROJECT_NAME/config.py
touch $PROJECT_NAME/requirements.txt
touch $PROJECT_NAME/.env

# Proxy files
touch $PROJECT_NAME/proxy/{__init__.py,base.py,auth.py,tenants.py,users.py,orders.py}

# Middleware files
touch $PROJECT_NAME/middleware/{__init__.py,auth.py,rate_limit.py}

echo "✅ Directory structure created"

# -------- requirements.txt --------
cat > $PROJECT_NAME/requirements.txt <<EOF
fastapi
uvicorn
httpx
pydantic-settings
python-dotenv
EOF

# -------- config.py --------
cat > $PROJECT_NAME/config.py <<EOF
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    APP_NAME: str = "Proccura API Gateway"
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    AUTH_SERVICE_URL: str
    TENANT_SERVICE_URL: str
    USER_SERVICE_URL: str
    ORDER_SERVICE_URL: str

    model_config = SettingsConfigDict(env_file=".env")

settings = Settings()
EOF

# -------- proxy/base.py --------
cat > $PROJECT_NAME/proxy/base.py <<EOF
from fastapi import Request, Response
import httpx

async def proxy_request(request: Request, target_base_url: str, path: str):
    async with httpx.AsyncClient() as client:
        resp = await client.request(
            method=request.method,
            url=f"{target_base_url}{path}",
            headers={k: v for k, v in request.headers.items() if k.lower() != "host"},
            params=request.query_params,
            content=await request.body(),
        )

    return Response(
        content=resp.content,
        status_code=resp.status_code,
        headers=dict(resp.headers),
    )
EOF

# -------- proxy/auth.py --------
cat > $PROJECT_NAME/proxy/auth.py <<EOF
from fastapi import APIRouter, Request
from config import settings
from proxy.base import proxy_request

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH"])
async def auth_proxy(path: str, request: Request):
    return await proxy_request(
        request,
        settings.AUTH_SERVICE_URL,
        f"/auth/{path}"
    )
EOF

# -------- proxy/tenants.py --------
cat > $PROJECT_NAME/proxy/tenants.py <<EOF
from fastapi import APIRouter, Request, Depends
from config import settings
from proxy.base import proxy_request
from middleware.auth import require_auth

router = APIRouter(
    prefix="/tenants",
    tags=["Tenants"],
    dependencies=[Depends(require_auth)]
)

@router.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH"])
async def tenants_proxy(path: str, request: Request):
    return await proxy_request(
        request,
        settings.TENANT_SERVICE_URL,
        f"/tenants/{path}"
    )
EOF

# -------- proxy/users.py --------
cat > $PROJECT_NAME/proxy/users.py <<EOF
from fastapi import APIRouter, Request, Depends
from config import settings
from proxy.base import proxy_request
from middleware.auth import require_auth

router = APIRouter(
    prefix="/users",
    tags=["Users"],
    dependencies=[Depends(require_auth)]
)

@router.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH"])
async def users_proxy(path: str, request: Request):
    return await proxy_request(
        request,
        settings.USER_SERVICE_URL,
        f"/users/{path}"
    )
EOF

# -------- proxy/orders.py --------
cat > $PROJECT_NAME/proxy/orders.py <<EOF
from fastapi import APIRouter, Request, Depends
from config import settings
from proxy.base import proxy_request
from middleware.auth import require_auth

router = APIRouter(
    prefix="/orders",
    tags=["Orders"],
    dependencies=[Depends(require_auth)]
)

@router.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH"])
async def orders_proxy(path: str, request: Request):
    return await proxy_request(
        request,
        settings.ORDER_SERVICE_URL,
        f"/orders/{path}"
    )
EOF

# -------- middleware/auth.py --------
cat > $PROJECT_NAME/middleware/auth.py <<EOF
from fastapi import Request, HTTPException

async def require_auth(request: Request):
    auth = request.headers.get("Authorization")
    if not auth:
        raise HTTPException(status_code=401, detail="Missing Authorization header")
EOF

# -------- middleware/rate_limit.py --------
cat > $PROJECT_NAME/middleware/rate_limit.py <<EOF
# Rate limiting placeholder
EOF

# -------- main.py --------
cat > $PROJECT_NAME/main.py <<EOF
from fastapi import FastAPI
from proxy import auth, tenants, users, orders

app = FastAPI(title="Proccura API Gateway")

app.include_router(auth.router)
app.include_router(tenants.router)
app.include_router(users.router)
app.include_router(orders.router)

@app.get("/health")
def health():
    return {"status": "gateway-running"}
EOF

# -------- .env --------
cat > $PROJECT_NAME/.env <<EOF
AUTH_SERVICE_URL=http://localhost:8001
TENANT_SERVICE_URL=http://localhost:8002
USER_SERVICE_URL=http://localhost:8003
ORDER_SERVICE_URL=http://localhost:8004
EOF

echo "🎉 API Gateway created at backend/api_gateway"
echo "👉 Run it:"
echo "   cd backend/api_gateway"
echo "   python -m venv venv && source venv/bin/activate"
echo "   pip install -r requirements.txt"
echo "   uvicorn main:app --reload"
