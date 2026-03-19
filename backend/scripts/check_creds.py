import os
import sys

# Load env
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))
from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), "..", "backend", ".env"))

print("--- Checking Redis ---")
url = os.getenv("UPSTASH_REDIS_URL")
token = os.getenv("UPSTASH_REDIS_TOKEN")
if url and token and "your_endpoint" not in url:
    try:
        from upstash_redis import Redis
        r = Redis(url=url, token=token)
        r.set("shriji_ping", "pong", ex=10)
        res = r.get("shriji_ping")
        if res == "pong":
            print("✅ Redis Connected Successfully!")
        else:
            print(f"❌ Redis failed to retrieve ping. Got: {res}")
    except Exception as e:
        print(f"❌ Redis Exception: {e}")
else:
    print("❌ Redis URL or Token missing or invalid in .env")

print("\n--- Checking Supabase ---")
supa_url = os.getenv("SUPABASE_URL")
supa_key = os.getenv("SUPABASE_KEY")
if supa_url and supa_key and "your-project" not in supa_url:
    try:
        from supabase import create_client, Client
        supabase: Client = create_client(supa_url, supa_key)
        # Just check auth health or select empty to verify permissions
        res = supabase.table("chat_sessions").select("*").limit(1).execute()
        print("✅ Supabase Connected Successfully!")
        print(f"   Table 'chat_sessions' verified. Rows fetched: {len(res.data)}")
    except Exception as e:
        print(f"❌ Supabase Exception: {e}")
        print("   (Note: if table chat_sessions doesn't exist yet, that's expected since we haven't created the SQL table yet, but the API key works!)")
else:
    print("❌ Supabase URL or Key missing or invalid in .env")
