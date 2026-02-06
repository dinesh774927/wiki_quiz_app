from sqlalchemy import create_engine, text
from sqlalchemy.pool import NullPool
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.engine import url as sa_url
import os
import re
from dotenv import load_dotenv

load_dotenv()

def get_optimized_url(raw_url: str) -> str:
    if not raw_url or "localhost" in raw_url:
        return raw_url or "postgresql://user:password@localhost/wikiquiz"
    
    try:
        # 1. Clean up common prefix issues
        if raw_url.startswith("postgres://"):
            raw_url = raw_url.replace("postgres://", "postgresql://", 1)
        
        # 2. Parse using SQLAlchemy's parser
        u = sa_url.make_url(raw_url)
        
        # 3. FIX: Sometimes an extra '@' or special character gets 
        # stuck to the front of the host during manual config.
        clean_host = u.host
        if clean_host and "@" in clean_host:
            # If host is "Priya1@db.xxx", we only want "db.xxx"
            clean_host = clean_host.split("@")[-1]
            print(f"URL FIX: Cleaned host from '{u.host}' to '{clean_host}'")

        # 4. Proactive Port Fix for Supabase on Vercel
        new_port = u.port
        if clean_host and "supabase.co" in clean_host:
            # Switch to port 6543 (Transaction Pooler) for IPv4 support on Vercel
            if not u.port or u.port == 5432:
                print(f"UPGRADING CONNECTION: Routing {clean_host} through port 6543 (Transaction Pooler)")
                new_port = 6543
        
        # 5. Enforce SSL
        new_query = dict(u.query)
        if "sslmode" not in new_query:
            new_query["sslmode"] = "require"
            
        # 6. Reconstruct
        optimized = sa_url.URL.create(
            drivername="postgresql",
            username=u.username,
            password=u.password,
            host=clean_host,
            port=new_port,
            database=u.database,
            query=new_query
        )
        
        return str(optimized)
    except Exception as e:
        print(f"DATABASE URL OPTIMIZATION WARNING: {e}")
        return raw_url

# Check for common environment variables used by Vercel and Supabase
DATABASE_URL = get_optimized_url(
    os.getenv("DATABASE_URL") or 
    os.getenv("POSTGRES_URL") or 
    os.getenv("SUPABASE_URL") or
    os.getenv("SUPABASE_POSTGRES_URL")
)

engine = create_engine(DATABASE_URL, poolclass=NullPool)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
