import os
# from dotenv import load_dotenv
from pathlib import Path
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from shared.database import Base

# BASE_DIR = Path(__file__).resolve().parents[2]  # auth_service/
# ENV_PATH = BASE_DIR / ".env"

# load_dotenv()




DATABASE_URL = os.getenv("DATABASE_URL")
DB_SCHEMA = os.getenv("DB_SCHEMA", "auth_schema")

if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL not set")

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
)

# 🔑 Ensure schema exists (safe in dev)
with engine.connect() as conn:
    conn.execute(text(f"CREATE SCHEMA IF NOT EXISTS {DB_SCHEMA}"))
    conn.commit()

# 🔑 Bind schema dynamically
Base.metadata.schema = DB_SCHEMA

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)
