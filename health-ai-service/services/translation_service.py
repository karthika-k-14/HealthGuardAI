import logging
from typing import Dict, Any
from deep_translator import GoogleTranslator

logger = logging.getLogger("health-ai-service.translation")

# Dictionary fallback for offline resilience
OFFLINE_DICTIONARY = {
    "hi": {
        "I have fever and headache": "मुझे बुखार और सिरदर्द है",
        "Please consult a doctor near your primary health center immediately.": "कृपया तुरंत अपने निकटतम प्राथमिक स्वास्थ्य केंद्र के डॉक्टर से परामर्श लें।",
        "High urgency case detected": "उच्च तात्कालिकता का मामला दर्ज किया गया"
    },
    "or": {
        "I have fever and headache": "ମୋତେ ଜ୍ୱର ଏବଂ ମୁଣ୍ଡବିନ୍ଧା ହେଉଛି",
        "Please consult a doctor near your primary health center immediately.": "ଦୟାକରି ଆପଣଙ୍କର ନିକଟତମ ପ୍ରାଥମିକ ସ୍ୱାସ୍ଥ୍ୟ କେନ୍ଦ୍ରର ଡାକ୍ତରଙ୍କ ସହିତ ତୁରନ୍ତ ପରାମର୍ଶ କରନ୍ତୁ।",
        "High urgency case detected": "ଉଚ୍ଚ ଜରୁରୀ ପରିସ୍ଥିତି ଚିହ୍ନଟ ହୋଇଛି"
    },
    "ta": {
        "I have fever and headache": "எனக்கு காய்ச்சல் மற்றும் தலைவலி உள்ளது",
        "Please consult a doctor near your primary health center immediately.": "உடனடியாக உங்கள் அருகில் உள்ள ஆரம்ப சுகாதார நிலைய மருத்துவரை அணுகவும்.",
        "High urgency case detected": "உயர் அவசர நிலை கண்டறியப்பட்டது"
    }
}


def translate_text(text: str, source_lang: str, target_lang: str) -> Dict[str, Any]:
    """
    Translates text between English, Hindi, Odia, and Tamil.
    """
    if not text or not text.strip() or source_lang.lower() == target_lang.lower():
        return {
            "translatedText": text,
            "sourceLang": source_lang,
            "targetLang": target_lang,
            "status": "SUCCESS"
        }
        
    s_lang = source_lang.lower()
    t_lang = target_lang.lower()
    
    # Try GoogleTranslator via deep-translator
    try:
        translated = GoogleTranslator(source=s_lang, target=t_lang).translate(text)
        if translated:
            return {
                "translatedText": translated,
                "sourceLang": source_lang,
                "targetLang": target_lang,
                "status": "SUCCESS"
            }
    except Exception as e:
        logger.warning(f"Online translation failed ({source_lang}->{target_lang}): {e}")
        
    # Dictionary fallback
    fallback_dict = OFFLINE_DICTIONARY.get(t_lang, {})
    if text in fallback_dict:
        return {
            "translatedText": fallback_dict[text],
            "sourceLang": source_lang,
            "targetLang": target_lang,
            "status": "FALLBACK"
        }
        
    # Default return original text if translation service is unavailable
    return {
        "translatedText": text,
        "sourceLang": source_lang,
        "targetLang": target_lang,
        "status": "UNCHANGED"
    }
