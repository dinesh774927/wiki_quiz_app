import sys
import os
# Ensure the backend directory is in the python path for Vercel deployment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from database import engine, Base
from routers import quiz

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Wiki Quiz API", description="Generate quizzes from Wikipedia articles.")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(quiz.router, prefix="/api")

@app.get("/")
def read_root():
    return {"message": "Wiki Quiz API is running!"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
