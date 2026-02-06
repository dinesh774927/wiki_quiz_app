from pydantic import BaseModel
from typing import List, Optional, Dict

class QuestionBase(BaseModel):
    question: str
    options: List[str]
    answer: str
    difficulty: str
    explanation: str
    user_answer: Optional[str] = None

class QuizBase(BaseModel):
    title: str
    summary: str
    key_entities: Dict[str, List[str]]
    sections: Optional[List[str]] = None
    related_topics: List[str]
    score: Optional[int] = None

class QuizCreate(BaseModel):
    url: str
    api_key: Optional[str] = None

class QuizResponse(QuizBase):
    id: int
    url: str
    quiz: List[QuestionBase]

class QuizSubmit(BaseModel):
    answers: Dict[int, str] # Question index or ID -> User answer

    class Config:
        from_attributes = True

from datetime import datetime

class HistoryItem(BaseModel):
    id: int
    url: str
    title: str
    created_at: datetime
    score: Optional[int] = None

    class Config:
        from_attributes = True
