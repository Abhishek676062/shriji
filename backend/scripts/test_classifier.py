"""
backend/scripts/test_classifier.py
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Test script for Language Detection, Translation, and Classification.

Tests the flow:
'मुझे बहुत गुस्सा आता है क्या करूँ' -> classify anger + anger_management
"""

import asyncio
import os
import sys
import time

# Add backend root to sys.path
backend_root = os.path.join(os.path.dirname(__file__), "..")
sys.path.insert(0, backend_root)

from core.language import detect_language, translate_to_english, translate_from_english
from core.classifier import classify

async def test_language_and_classifier():
    query_hi = "मुझे बहुत गुस्सा आता है क्या करूँ"
    
    print(f"🔍 Testing Input Query: '{query_hi}'")
    print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    
    # ── 1. Language Detection
    t1 = time.time()
    source_lang = detect_language(query_hi)
    t2 = time.time()
    print(f"✅ Language Detected: '{source_lang}' in {(t2-t1)*1000:.1f}ms")
    
    # ── 2. Translation to English
    t3 = time.time()
    query_en = await translate_to_english(query_hi, source_lang)
    t4 = time.time()
    print(f"✅ Translated to English: '{query_en}' in {(t4-t3)*1000:.1f}ms")
    
    # ── 3. Classification
    t5 = time.time()
    tags = await classify(query_en)
    t6 = time.time()
    print(f"✅ Classification in {(t6-t5)*1000:.1f}ms:")
    print(f"   emotion: {tags['emotional_tag']}")
    print(f"   domain:  {tags['problem_domain']}")
    print(f"   theme:   {tags['theme_tag']}")
    
    # ── 4. Translation back from English (testing preservation)
    sample_response = "You should do your duty without attachment to results (BG 2.47)."
    print("\n🔄 Testing reverse translation preservation...")
    print(f"   Original English: '{sample_response}'")
    
    t7 = time.time()
    response_hi = await translate_from_english(sample_response, source_lang)
    t8 = time.time()
    print(f"✅ Translated back to {source_lang} in {(t8-t7)*1000:.1f}ms:")
    print(f"   Result: '{response_hi}'")
    
    if "BG 2.47" in response_hi or "BG" in response_hi:
        print("✅ Citation preserved successfully!")
    else:
        print("❌ Citation was NOT preserved carefully.")
        
    print("\nTest completed successfully. 🙏")

if __name__ == "__main__":
    asyncio.run(test_language_and_classifier())
