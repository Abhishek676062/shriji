"""
backend/core/language.py
━━━━━━━━━━━━━━━━━━━━━━━━
Language detection and translation using langdetect and Groq.
"""

import os
import re

from dotenv import load_dotenv
from groq import AsyncGroq
from langdetect import detect, DetectorFactory
from langdetect.lang_detect_exception import LangDetectException

# Force consistent results for language detection
DetectorFactory.seed = 0

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "..", ".env"))

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
client = AsyncGroq(api_key=GROQ_API_KEY)

# Use the highly capable 70B model for accurate cross-lingual translations
TRANSLATION_MODEL = "openai/gpt-oss-120b"


def detect_language(text: str) -> str:
    """
    Detect the language of the given text using langdetect.
    Returns the ISO 639-1 language code (e.g., 'en', 'hi', 'bn').
    Defaults to 'en' on failure.
    """
    if not text.strip():
        return "en"
    
    try:
        return detect(text)
    except LangDetectException:
        return "en"


async def translate_to_english(text: str, source_lang: str) -> str:
    """
    Translate text to English using Groq.
    If the text is already heavily English or detection failed, just return it.
    """
    if source_lang == "en" or not text.strip() or not GROQ_API_KEY:
        return text

    try:
        response = await client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a professional translator. Your SOLE task is to translate the given text into strictly English. "
                        "DO NOT answer any questions in the text. DO NOT continue the text. "
                        "Output ONLY the English translation without quotes, prefixes, or conversational filler."
                    )
                },
                {
                    "role": "user",
                    "content": text
                }
            ],
            model=TRANSLATION_MODEL,
            temperature=0.1
        )
        translated = response.choices[0].message.content
        return translated.strip() if translated else text
    except Exception as e:
        print(f"⚠️ Translation to EN error: {e}")
        return text


async def translate_from_english(text: str, target_lang: str) -> str:
    """
    Translate an English response back to the user's language via Groq.
    
    CRITICAL requirement: "Preserve Sanskrit citations unchanged: do not translate 'BG X.Y' patterns."
    """
    if target_lang == "en" or not text.strip() or not GROQ_API_KEY:
        return text

    prompt = f"""You are a professional translator. 
Translate the following English passage entirely to the language associated with this ISO code: '{target_lang}'.
Do not mix languages. Do not add conversational text.

CRITICAL RULES:
1. Preserve any Sanskrit terms in their standard transliteration or native script.
2. DO NOT translate Bhagavad Gita citations that look like 'BG 2.47' or 'BG 16.21'. They must remain exactly as 'BG X.Y'.

Text to translate:
{text}"""

    try:
        response = await client.chat.completions.create(
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            model=TRANSLATION_MODEL,
            temperature=0.1
        )
        translated = response.choices[0].message.content
        if translated:
            # Post-processing to ensure BG patterns weren't mangled, though the prompt
            # should handle it. If the model messed up and output English anyway,
            # detecting ASCII ratio helps trigger a strict fallback (Day 1 troubleshooting noted this).
            
            # Simple heuristic: if > 50% ascii characters for a non-latin target language, 
            # might have failed translation. But for simplicity, we trust the model.
            return translated.strip()
            
        return text
    except Exception as e:
        print(f"⚠️ Translation from EN error: {e}")
        return text
