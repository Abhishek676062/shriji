"""
backend/core/classifier.py
━━━━━━━━━━━━━━━━━━━━━━━━━━
Emotion and problem domain classifier targeting exact metadata tags.
Uses Groq openai.
"""

import json
import os
from typing import Dict, Any

from dotenv import load_dotenv
from groq import AsyncGroq

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "..", ".env"))

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
client = AsyncGroq(api_key=GROQ_API_KEY)
MODEL_NAME = "openai/gpt-oss-20b"

# The prompt exactly maps to the required gita_verses_enhanced tags
CLASSIFICATION_PROMPT = """You are an intent classification system for a Bhagavad Gita AI assistant.
Analyze the user's query and map it to exactly one category from each of the three lists below.
If a category does not strongly match, output null for that key.
Output ONLY a JSON object and nothing else.

Query: "{query}"

Valid 'emotional_tag' values:
[anger, fear, grief, confusion, loneliness, anxiety, purpose, guilt, jealousy, determination]

Valid 'problem_domain' values:
[career_anxiety, relationship_conflict, self_doubt, grief_loss, anger_management, fear_of_failure, leadership_pressure, family_conflict, spiritual_seeking, work_stress, uncertainty]

Valid 'theme_tag' values:
[karma_yoga, bhakti_yoga, jnana_yoga, detachment, dharma, self_knowledge, renunciation, devotion, action]

JSON Format:
{{
  "emotional_tag": "str or null",
  "problem_domain": "str or null",
  "theme_tag": "str or null"
}}"""


async def classify(query_en: str) -> Dict[str, Any]:
    """
    Classify an English query into predefined emotion, domain, and theme tags.
    Returns: {"emotional_tag": str, "problem_domain": str, "theme_tag": str}
    """
    default_response = {"emotional_tag": None, "problem_domain": None, "theme_tag": None}
    
    if not query_en or not GROQ_API_KEY:
        return default_response

    try:
        response = await client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": "You are a precise JSON classification AI."
                },
                {
                    "role": "user",
                    "content": CLASSIFICATION_PROMPT.format(query=query_en)
                }
            ],
            model=MODEL_NAME,
            temperature=0.0,  # Zero explicitly for strict classification
            response_format={"type": "json_object"}
        )
        
        content = response.choices[0].message.content
        if content:
            parsed = json.loads(content)
            # Ensure the structure matches expectations
            return {
                "emotional_tag": parsed.get("emotional_tag"),
                "problem_domain": parsed.get("problem_domain"),
                "theme_tag": parsed.get("theme_tag")
            }
            
    except Exception as e:
        print(f"⚠️ Classification error: {e}")
        
    return default_response
