from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional
from services.intent_service import predict_intent
from services.disease_service import predict_disease
from services.urgency_service import predict_urgency
from services.translation_service import translate_text

router = APIRouter(tags=["Unified Chat Analysis Pipeline"])


class ChatAnalysisRequest(BaseModel):
    message: str = Field(..., example="I have high fever and headache")
    language: Optional[str] = Field("en", example="en")


class ChatAnalysisResponse(BaseModel):
    intent: str = Field(..., example="SYMPTOM_QUERY")
    disease: str = Field(..., example="DENGUE")
    urgency: str = Field(..., example="HIGH")
    score: int = Field(..., example=89)
    response: str = Field(..., example="Please consult a doctor near your primary health center immediately.")
    originalMessage: str = Field(..., example="I have high fever and headache")
    detectedLanguage: str = Field("en", example="en")


@router.post("/analyze-chat", response_model=ChatAnalysisResponse)
@router.post("/chat/analyze-chat", response_model=ChatAnalysisResponse)
def handle_analyze_chat(request: ChatAnalysisRequest):
    """
    Complete Citizen Chat Analysis Pipeline:
    1. Translate incoming citizen message to English (if language is hi, or, ta)
    2. NLP Intent Detection
    3. Disease Category Classification
    4. Urgency Scoring & Risk Assessment
    5. Construct advisory response & Translate back to citizen language
    """
    if not request.message or not request.message.strip():
        raise HTTPException(status_code=400, detail="Chat message cannot be empty.")
        
    user_lang = (request.language or "en").lower()
    
    # 1. Translate to English if needed
    if user_lang != "en":
        trans_in = translate_text(request.message, source_lang=user_lang, target_lang="en")
        en_message = trans_in.get("translatedText", request.message)
    else:
        en_message = request.message
        
    # 2. Intent Detection
    intent_res = predict_intent(en_message)
    intent_val = intent_res.get("intent", "SYMPTOM_QUERY")
    
    # 3. Disease Classification
    disease_res = predict_disease(en_message)
    disease_val = disease_res.get("diseaseCategory", "GENERAL_ILLNESS")
    
    # 4. Urgency Scoring
    urgency_res = predict_urgency(en_message)
    urgency_val = urgency_res.get("urgency", "LOW")
    score_val = urgency_res.get("score", 25)

    # 4b. Clinical Hepatic / Jaundice Safety Check
    is_jaundice_query = any(k in en_message.lower() for k in ["jaundice", "yellow eyes", "yellow skin", "icterus", "hepatitis", "dark urine"])
    if is_jaundice_query:
        disease_val = "JAUNDICE"
        if urgency_val not in ["HIGH", "CRITICAL"]:
            urgency_val = "HIGH"
            score_val = max(score_val, 74)
    
    # 5. Construct base response advice
    if is_jaundice_query:
        base_advice = (
            "Clinical evaluation indicates symptoms of Jaundice / acute hepatobiliary dysfunction. "
            "Please undergo urgent Liver Function Tests (LFT: Bilirubin, SGOT/AST, SGPT/ALT) at your nearest Primary Health Centre or Hospital. "
            "Maintain hydration with boiled water, consume an easily digestible low-fat diet, and strictly avoid self-medication, NSAIDs, and alcohol. "
            "Priority medical evaluation has been advised."
        )
    elif urgency_val in ["HIGH", "CRITICAL"]:
        base_advice = (
            f"High urgency condition ({disease_val}) detected. "
            "Your case has been escalated to the nearest ASHA Worker and Primary Health Center (PHC). "
            "Please seek immediate medical attention."
        )
    elif urgency_val == "MEDIUM":
        base_advice = (
            f"Symptoms suggest possible {disease_val}. "
            "We recommend visiting your nearest PHC within 24 hours for examination."
        )
    else:
        base_advice = (
            f"Symptoms are consistent with mild {disease_val}. "
            "Ensure adequate rest, hydration, and monitor your health."
        )
        
    # 6. Translate response back if non-English
    if user_lang != "en":
        trans_out = translate_text(base_advice, source_lang="en", target_lang=user_lang)
        final_response = trans_out.get("translatedText", base_advice)
    else:
        final_response = base_advice
        
    return ChatAnalysisResponse(
        intent=intent_val,
        disease=disease_val,
        urgency=urgency_val,
        score=score_val,
        response=final_response,
        originalMessage=request.message,
        detectedLanguage=user_lang
    )
