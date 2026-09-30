from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional
from services.urgency_service import predict_urgency

router = APIRouter(tags=["Urgency Scoring"])


class UrgencyRequest(BaseModel):
    symptoms: str = Field(..., example="chest pain + unconsciousness")


class UrgencyResponse(BaseModel):
    urgency: str = Field(..., example="CRITICAL")
    score: int = Field(..., example=98)
    reason: Optional[str] = Field(None, example="Critical symptom keyword detected")


@router.post("/predict-urgency", response_model=UrgencyResponse)
@router.post("/urgency", response_model=UrgencyResponse)
def handle_predict_urgency(request: UrgencyRequest):
    """
    Urgency Scoring endpoint using Rule Engine + Random Forest ML support.
    Urgency Levels: LOW, MEDIUM, HIGH, CRITICAL. Risk Score: 0 to 100.
    """
    if not request.symptoms or not request.symptoms.strip():
        raise HTTPException(status_code=400, detail="Symptoms input cannot be empty.")
        
    result = predict_urgency(request.symptoms)
    return UrgencyResponse(**result)
