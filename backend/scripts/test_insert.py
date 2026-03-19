import os
import sys

# Load env
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))
from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), "..", "backend", ".env"))

import traceback
from datetime import datetime

print("--- Testing Supabase Insert ---")
supa_url = os.getenv("SUPABASE_URL")
supa_key = os.getenv("SUPABASE_KEY")
print("URL:", supa_url)

if supa_url and supa_key:
    try:
        from supabase import create_client
        client = create_client(supa_url, supa_key)
        
        # Test 1: Fetch
        print("1. Fetching...")
        res = client.table("chat_sessions").select("*").limit(1).execute()
        print("   Fetch Success. Rows in DB:", len(res.data))
        
        # Test 2: Insert
        print("2. Inserting a test record...")
        test_session_id = "00000000-0000-0000-0000-000000000001"
        new_row = {
            "session_id": test_session_id,
            "language": "en",
            "history": [{"timestamp": datetime.utcnow().isoformat(), "user": "test", "assistant": "test"}]
        }
        res2 = client.table("chat_sessions").insert(new_row).execute()
        print("   Insert Success!", res2.data)
        
        # Test 3: Update
        print("3. Updating test record...")
        res3 = client.table("chat_sessions").update({"language": "hr"}).eq("session_id", test_session_id).execute()
        print("   Update Success!", res3.data)
        
    except Exception as e:
        print("❌ Supabase Operation Failed!")
        traceback.print_exc()
else:
    print("❌ Missing URL/KEY")
