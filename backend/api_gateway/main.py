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
