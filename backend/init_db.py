from database import engine, Base
import models
from sqlalchemy_utils import database_exists, create_database

def init_db():
    try:
        if not database_exists(engine.url):
            create_database(engine.url)
            print(f"Created database: {engine.url.database}")
        else:
            print(f"Database {engine.url.database} already exists.")

        print("Creating tables...")
        Base.metadata.create_all(bind=engine)
        print("Tables created successfully!")
    except Exception as e:
        print(f"Error initializing database: {e}")

if __name__ == "__main__":
    init_db()
