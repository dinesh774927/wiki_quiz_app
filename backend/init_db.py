from database import engine, Base
import models
from sqlalchemy_utils import database_exists, create_database

def init_db():
    try:
        # For Supabase/Remote DBs, we usually don't have permission to create the database itself.
        # We only check/create if it's a local or development environment.
        is_remote = "localhost" not in str(engine.url) and "127.0.0.1" not in str(engine.url)
        
        if not is_remote:
            if not database_exists(engine.url):
                create_database(engine.url)
                print(f"Created database: {engine.url.database}")
            else:
                print(f"Database {engine.url.database} already exists.")
        else:
            print("Remote database detected. Skipping database creation check.")

        print("Creating tables...")
        Base.metadata.create_all(bind=engine)
        print("Tables created successfully!")
    except Exception as e:
        print(f"Error initializing database: {e}")

if __name__ == "__main__":
    init_db()
