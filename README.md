# Wiki Quiz App

An automated assessment platform that transforms any Wikipedia article into an interactive, AI-powered quiz. Built with FastAPI, PostgreSQL, and React.

## 🚀 Features

- **Automated Scraping**: Extracts article title, summary, and primary body text using BeautifulSoup.
- **Intelligent Quiz Generation**: Uses Gemini 1.5 Flash to generate 10 contextual questions with multiple-choice options and explanations.
- **Progressive Assessment**: Displays related topics and key entities (People, Organizations, Locations) for deeper learning.
- **Take Quiz Mode**: Interactive interface to select answers, submit for grading, and view detailed results.
- **Assessment History**: Store and revisit previous quizzes with full score tracking.
- **Premium UI**: Modern sidebar layout with smooth Framer Motion animations.

## 🛠️ Technical Stack

- **Backend**: Python 3.12, FastAPI, SQLAlchemy
- **Database**: PostgreSQL
- **Frontend**: React (Vite), Tailwind CSS, Framer Motion, Lucide Icons
- **AI/LLM**: Google GenAI SDK (Gemini 2.0 Flash)
- **Scraping**: BeautifulSoup4

## 📁 Project Structure

```text
├── backend/
│   ├── routers/        # API endpoints
│   ├── services/       # Scraper & LLM processing logic
│   ├── models.py       # SQL Alchemy definitions
│   └── database.py     # Session & Engine config
├── frontend/
│   ├── src/components/ # React modules
│   └── src/api.ts      # Axios client
└── sample_data/        # Requirement-requested sample outputs
```

## ⚙️ Setup Instructions

### Backend
1. Navigate to `/backend`.
2. Install dependencies: `pip install -r requirements.txt`.
3. Create a `.env` file:
   ```env
   DATABASE_URL=postgresql://user:password@localhost/wikiquiz
   GEMINI_API_KEY=your_key_here
   ```
4. Initialize the DB: `python init_db.py`.
5. Start server: `python main.py`.

### Frontend
1. Navigate to `/frontend`.
2. Install dependencies: `npm install`.
3. Run dev server: `npm run dev`.

## 🧬 LLM Prompting & Grounding

The app uses a strict system-instruction prompt to minimize hallucinations and ensure outputs are grounded in the scraped Wikipedia text:

**Core Prompt Logic:**
- **Objective**: "EXTRACT knowledge from the text below and FORMAT as a JSON quiz."
- **Constraints**: 10 questions, 4 options, exact string matching for answers, difficulty balancing.
- **Grounding**: The LLM is forced to provide a "succinct explanation" for every answer to ensure it references the article content directly.

## 📝 API Endpoints

- `POST /api/generate`: Accepts a URL and returns a full quiz dataset.
- `GET /api/history`: Lists all processed quizzes.
- `GET /api/quiz/{id}`: Retrieves details for a specific quiz.
- `PUT /api/quiz/{id}/score`: Submits answers and computes the grade.
