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
    # Critical Check for Supabase on Vercel:
    # Port 5432 is direct (IPv6) and often fails on Vercel.
    # Port 6543 is pooled (IPv4) and works reliably.
    if "supabase.co" in DATABASE_URL and ":5432" in DATABASE_URL:
        print("\n" + "!" * 50)
        print("CRITICAL: You are using Supabase port 5432 (direct) which fails on Vercel.")
        print("Please update your DATABASE_URL to use the Transaction Pooler (port 6543).")
        print("!" * 50 + "\n")

    if "sslmode" not in DATABASE_URL:
        if "?" in DATABASE_URL:
            DATABASE_URL += "&sslmode=require"
        else:
            DATABASE_URL += "?sslmode=require"

engine = create_engine(DATABASE_URL, poolclass=NullPool)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
