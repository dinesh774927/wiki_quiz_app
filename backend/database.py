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
        # 1. Clean up common prefix issues before parsing
        if raw_url.startswith("postgres://"):
            raw_url = raw_url.replace("postgres://", "postgresql://", 1)
        
        # 2. Parse using SQLAlchemy's robust internal parser
        u = sa_url.make_url(raw_url)
        
        # 3. Proactively switch to Supabase IPv4 Pooler (port 6543) if on Vercel
        # Direct connection (5432) uses IPv6 and often fails on Vercel's network.
        new_port = u.port
        if u.host and "supabase.co" in u.host:
            if not u.port or u.port == 5432:
                print(f"UPGRADING CONNECTION: Changing host {u.host} to use port 6543 (Transaction Pooler)")
                new_port = 6543
        
        # 4. Enforce SSL for cloud instances
        new_query = dict(u.query)
        if "sslmode" not in new_query:
            new_query["sslmode"] = "require"
            
        # 5. Reconstruct a clean, standard URL
        optimized = sa_url.URL.create(
            drivername="postgresql",
            username=u.username,
            password=u.password,
            host=u.host,
            port=new_port,
            database=u.database,
            query=new_query
        )
        return str(optimized)
    except Exception as e:
        print(f"DATABASE URL OPTIMIZATION WARNING: {e}")
        return raw_url

DATABASE_URL = get_optimized_url(os.getenv("DATABASE_URL"))

engine = create_engine(DATABASE_URL, poolclass=NullPool)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
