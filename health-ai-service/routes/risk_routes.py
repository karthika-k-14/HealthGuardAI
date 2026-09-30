from fastapi import APIRouter
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from services.risk_service import calculate_health_risk

router = APIRouter(tags=["AI Health Risk Assessment"])


class RiskFactor(BaseModel):
    label: str
    impact: str


class RiskAssessmentRequest(BaseModel):
    age: int = Field(30, ge=1, le=120, example=30)
    symptoms: List[str] = Field(default=[], example=["Fever", "Cough"])
    lifestyle: str = Field("moderate", example="active")


class RiskAssessmentResponse(BaseModel):
    score: int = Field(..., example=31)
    band: str = Field(..., example="Low")
    factors: List[RiskFactor]
    ml_metadata: Optional[Dict[str, Any]] = None


@router.post("/risk-assessment", response_model=RiskAssessmentResponse)
@router.post("/predict-risk", response_model=RiskAssessmentResponse)
def handle_risk_assessment(request: RiskAssessmentRequest):
    """
    AI/ML-Powered Health Risk Assessment endpoint combining:
    - Biometric age curves
    - Random Forest ML Urgency Classification on symptoms
    - Lifestyle metabolic & cardiovascular risk coefficients (Active, Moderate, Sedentary)
    """
    result = calculate_health_risk(
        age=request.age,
        symptoms=request.symptoms,
        lifestyle=request.lifestyle
    )
    return RiskAssessmentResponse(**result)
