from sqlalchemy import create_engine
from sqlalchemy.pool import NullPool
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    DATABASE_URL = "postgresql://user:password@localhost/wikiquiz"

# Use NullPool for serverless environments (Vercel) to avoid connection issues
# and ensure we connect via SSL for cloud providers like Supabase
if "localhost" not in DATABASE_URL:
    # 1. SQLAlchemy requires 'postgresql://' not 'postgres://'
    if DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

    # 2. Proactive Port Fix for Supabase on Vercel:
    # Most users copy port 5432, but Vercel needs 6543 (ipv4 pooler)
    if "supabase.co" in DATABASE_URL and ":5432" in DATABASE_URL:
        print("PROACTIVE FIX: Swapping Supabase port 5432 to 6543 for Vercel compatibility.")
        DATABASE_URL = DATABASE_URL.replace(":5432", ":6543")

    # 3. Force SSL for Cloud DBs
    if "sslmode" not in DATABASE_URL:
        separator = "&" if "?" in DATABASE_URL else "?"
        DATABASE_URL += f"{separator}sslmode=require"

engine = create_engine(DATABASE_URL, poolclass=NullPool)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
