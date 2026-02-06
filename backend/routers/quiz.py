from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import logging
import os

from database import get_db
import models
import schemas
from services import scraper, llm

# Initialize router and logging
router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/generate", response_model=schemas.QuizResponse)
def handle_quiz_creation(payload: schemas.QuizCreate, db: Session = Depends(get_db)):
    """
    Orchestrates the creation of a new quiz: scrapes content, 
    processes it via LLM, and persists results to storage.
    """
    # 1. Scrape content from the target Wikipedia source
    logger.info(f"Targeting article: {payload.url}")
    article = scraper.scrape_wikipedia(payload.url)
    
    if not article:
        logger.warning("Article scraping failed")
        raise HTTPException(status_code=400, detail="Unable to retrieve content from the provided URL.")

    # 2. Extract intelligence and generate quiz structure
    secret_key = payload.api_key or os.getenv("GEMINI_API_KEY")
    if not secret_key:
         logger.error("System configuration error: Missing Credentials")
         raise HTTPException(status_code=400, detail="Missing API credentials for intelligence engine.")
    
    logger.info("Executing semantic analysis...")
    dataset = llm.process_content_to_quiz(article['full_text'], secret_key)
    
    if not dataset or not dataset.get("quiz"):
         logger.error("Intelligence engine failed to return valid quiz data")
         raise HTTPException(status_code=500, detail="Content analysis failed. Please try a different topic.")
         
    # 3. Persist the assessment to the database
    new_record = models.Quiz(
        url=payload.url,
        title=article['title'],
        summary=article['summary'],
        key_entities=dataset.get("key_entities", {}),
        sections=article.get("sections", [])
    )
    db.add(new_record)
    db.commit()
    db.refresh(new_record)
    
    # Map and store individual questions
    for q_data in dataset.get("quiz", []):
        db.add(models.Question(
            quiz_id=new_record.id,
            question_text=q_data["question"],
            options=q_data["options"],
            answer=q_data["answer"],
            explanation=q_data.get("explanation", ""),
            difficulty=q_data.get("difficulty", "medium")
        ))
    
    # Map and store context-related topics
    for topic_label in dataset.get("related_topics", []):
        db.add(models.RelatedTopic(
            quiz_id=new_record.id,
            topic_name=topic_label
        ))
        
    db.commit()
    db.refresh(new_record)
    
    # Return finalized assessment details
    return _build_quiz_payload(new_record)

@router.get("/history", response_model=List[schemas.HistoryItem])
def fetch_assessment_history(db: Session = Depends(get_db)):
    """Retrieves a historical list of generated assessments."""
    return db.query(models.Quiz).order_by(models.Quiz.created_at.desc()).all()

@router.get("/quiz/{quiz_id}", response_model=schemas.QuizResponse)
def get_assessment_details(quiz_id: int, db: Session = Depends(get_db)):
    """Fetches full details for a specific assessment record."""
    record = db.query(models.Quiz).filter(models.Quiz.id == quiz_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Assessment not found.")
        
    return _build_quiz_payload(record)

@router.put("/quiz/{quiz_id}/score", response_model=schemas.QuizResponse)
def submit_assessment_data(quiz_id: int, entry: schemas.QuizSubmit, db: Session = Depends(get_db)):
    """Updates users answers and calculates the final performance metric."""
    assessment = db.query(models.Quiz).filter(models.Quiz.id == quiz_id).first()
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found.")
    
    questions = assessment.questions
    
    # Reset/Retry Logic: Clear existing performance data if submission is empty
    if not entry.answers:
        assessment.score = None
        for q in questions:
            q.user_answer = None
    else:
        # Calculate grade and store user responses
        correct_marks = 0
        for idx, q in enumerate(questions):
            # Support both integer and string keys for compatibility
            user_val = entry.answers.get(idx) or entry.answers.get(str(idx))
            q.user_answer = user_val
            if user_val == q.answer:
                correct_marks += 1
        
        assessment.score = int((correct_marks / len(questions)) * 100) if questions else 0
        
    db.commit()
    db.refresh(assessment)
    return _build_quiz_payload(assessment)

def _build_quiz_payload(quiz_obj: models.Quiz) -> dict:
    """Helper to transform DB object into the expected API payload structure."""
    return {
        "id": quiz_obj.id,
        "url": quiz_obj.url,
        "title": quiz_obj.title,
        "summary": quiz_obj.summary,
        "key_entities": quiz_obj.key_entities,
        "sections": quiz_obj.sections,
        "score": quiz_obj.score,
        "quiz": [
            {
                "question": q.question_text,
                "options": q.options,
                "answer": q.answer,
                "difficulty": q.difficulty,
                "explanation": q.explanation,
                "user_answer": q.user_answer
            } for q in quiz_obj.questions
        ],
        "related_topics": [t.topic_name for t in quiz_obj.related_topics]
    }
