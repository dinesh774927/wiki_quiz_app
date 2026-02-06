from sqlalchemy import Column, Integer, String, Text, ForeignKey, JSON, DateTime
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime

class Quiz(Base):
    __tablename__ = "quizzes"

    id = Column(Integer, primary_key=True, index=True)
    url = Column(String, unique=False, index=True) # Allow multiple quizzes for same URL? Maybe unique=False to allow re-generation
    title = Column(String)
    summary = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Store raw extracted entities if needed, or just keep them processed
    key_entities = Column(JSON, nullable=True) 
    sections = Column(JSON, nullable=True) # List of section headings
    score = Column(Integer, nullable=True) # Percentage or count

    questions = relationship("Question", back_populates="quiz", cascade="all, delete-orphan")
    related_topics = relationship("RelatedTopic", back_populates="quiz", cascade="all, delete-orphan")

class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    quiz_id = Column(Integer, ForeignKey("quizzes.id"))
    question_text = Column(String)
    options = Column(JSON) # Store as list of strings
    answer = Column(String)
    explanation = Column(Text)
    difficulty = Column(String)
    user_answer = Column(String, nullable=True)

    quiz = relationship("Quiz", back_populates="questions")

class RelatedTopic(Base):
    __tablename__ = "related_topics"

    id = Column(Integer, primary_key=True, index=True)
    quiz_id = Column(Integer, ForeignKey("quizzes.id"))
    topic_name = Column(String)
    
    quiz = relationship("Quiz", back_populates="related_topics")
