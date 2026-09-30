from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from services.intent_service import predict_intent

router = APIRouter(tags=["Intent Detection"])


class IntentRequest(BaseModel):
    text: str = Field(..., example="I have fever and headache")


class IntentResponse(BaseModel):
    intent: str = Field(..., example="SYMPTOM_QUERY")
    confidence: float = Field(..., example=0.96)


@router.post("/predict-intent", response_model=IntentResponse)
@router.post("/intent", response_model=IntentResponse)
def handle_predict_intent(request: IntentRequest):
    """
    NLP Intent Detection endpoint using TF-IDF + Logistic Regression.
    """
    if not request.text or not request.text.strip():
        raise HTTPException(status_code=400, detail="Input text cannot be empty.")
    
    result = predict_intent(request.text)
    return IntentResponse(**result)
