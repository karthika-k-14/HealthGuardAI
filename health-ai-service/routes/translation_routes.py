from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from services.translation_service import translate_text

router = APIRouter(tags=["Multilingual Translation"])


class TranslationRequest(BaseModel):
    text: str = Field(..., example="I have fever and headache")
    sourceLang: str = Field("en", example="en")
    targetLang: str = Field("hi", example="hi")


class TranslationResponse(BaseModel):
    translatedText: str = Field(..., example="मुझे बुखार और सिरदर्द है")
    sourceLang: str = Field(..., example="en")
    targetLang: str = Field(..., example="hi")
    status: str = Field(..., example="SUCCESS")


@router.post("/translate", response_model=TranslationResponse)
def handle_translation(request: TranslationRequest):
    """
    Multilingual Translation API supporting English, Hindi, Odia, and Tamil.
    """
    if not request.text or not request.text.strip():
        raise HTTPException(status_code=400, detail="Text for translation cannot be empty.")
        
    result = translate_text(request.text, request.sourceLang, request.targetLang)
    return TranslationResponse(**result)
