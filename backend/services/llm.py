from google import genai
from google.genai import types
import json
import os
import logging
from typing import Dict, Any

# Configure logging for tracking service events
logger = logging.getLogger(__name__)

def process_content_to_quiz(content: str, token: str) -> Dict[str, Any]:
    """
    Core engine that transforms raw article text into a structured quiz dataset.
    Uses the Gemini generative engine for semantic analysis and extraction.
    """
    try:
        engine = genai.Client(api_key=token)
        
        # System instructions optimized for structured data extraction
        system_instructions = (
            "EXTRACT knowledge from the text below and FORMAT as a JSON quiz.\n\n"
            "REQUIREMENTS:\n"
            "1. Identify key entities (Peoples, Organizations, Locations).\n"
            "2. Generate 10 distinct questions (4 options each, balanced difficulty).\n"
            "3. 'answer' field must be an exact string match for one of the 'options'.\n"
            "4. Provide a succinct 'explanation' for each correct answer.\n"
            "5. List related conceptual topics for further study.\n\n"
            "SCHEMA:\n"
            "{\n"
            "  \"key_entities\": { \"people\": [], \"organizations\": [], \"locations\": [] },\n"
            "  \"quiz\": [{ \"question\": \"\", \"options\": [], \"answer\": \"\", \"difficulty\": \"\", \"explanation\": \"\" }],\n"
            "  \"related_topics\": []\n"
            "}\n"
        )
        
        runtime_prompt = f"{system_instructions}\n\nTARGET CONTENT:\n{content}"

        output = engine.models.generate_content(
            model='gemini-flash-latest', # Using the stable latest-flash alias for better compatibility
            contents=runtime_prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json"
            )
        )
        
        raw_result = output.text
        if not raw_result:
            raise ValueError("Generator returned an empty response")

        # Strip markdown baggage if present
        sanitized = raw_result.strip().strip("`").replace("json\n", "")
        
        return json.loads(sanitized)

    except Exception as error:
        logger.error(f"Intelligence processing failed: {error}")
        # Return graceful fallback structure
        return {
            "key_entities": {"people": [], "organizations": [], "locations": []},
            "quiz": [],
            "related_topics": []
        }
