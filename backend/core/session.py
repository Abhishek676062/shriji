"""
backend/core/session.py
━━━━━━━━━━━━━━━━━━━━━━━
Logs interactions persistently into Supabase.
"""

import os
from datetime import datetime
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

_supabase_client = None

def get_supabase():
    global _supabase_client
    if _supabase_client is None:
        url = os.getenv("SUPABASE_URL", "")
        key = os.getenv("SUPABASE_KEY", "")
        # Only initialize if valid format is present
        if url and key and key.startswith("ey"):
            try:
                from supabase import create_client
                _supabase_client = create_client(url, key)
            except Exception as e:
                print(f"⚠️ Supabase Init Error: {e}")
    return _supabase_client


def log_chat_interaction(session_id: str, language: str, user_message: str, ai_response: str):
    """
    Append a user/ai turn to the Supabase history JSONB field.
    Creates row if session_id is new, else updates.
    """
    client = get_supabase()
    if not client:
        return  # Silently skip if DB not configured yet
        
    try:
        # Check if session exists
        resp = client.table("chat_sessions").select("history").eq("session_id", session_id).execute()
        
        interaction = {
            "timestamp": datetime.utcnow().isoformat(),
            "user": user_message,
            "assistant": ai_response
        }
        
        if len(resp.data) == 0:
            # Create new
            client.table("chat_sessions").insert({
                "session_id": session_id,
                "language": language,
                "history": [interaction]
            }).execute()
        else:
            # Append array
            existing_history = resp.data[0].get("history", [])
            existing_history.append(interaction)
            client.table("chat_sessions").update({
                "history": existing_history,
                "language": language,
                "updated_at": datetime.utcnow().isoformat()
            }).eq("session_id", session_id).execute()
            
    except Exception as e:
        print(f"⚠️ Supabase logging error (Row might not exist / Invalid Keys): {e}")


def get_session_history(session_id: str, limit: int = 4) -> list:
    """
    Retrieve the last N conversation turns from Supabase for follow-up context.
    Returns list of dicts: [{"user": "...", "assistant": "..."}, ...]
    """
    client = get_supabase()
    if not client:
        return []
    
    try:
        resp = client.table("chat_sessions").select("history").eq("session_id", session_id).execute()
        if resp.data and len(resp.data) > 0:
            history = resp.data[0].get("history", [])
            return history[-limit:] if len(history) > limit else history
    except Exception as e:
        print(f"⚠️ Session history fetch error: {e}")
    
    return []
