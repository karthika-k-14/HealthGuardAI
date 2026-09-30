from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional
from services.expiry_service import predict_expiry_risk

router = APIRouter(tags=["Expiry Risk Alerting"])


class ExpiryRiskRequest(BaseModel):
    batchNumber: str = Field(..., example="BATCH-2026-09A")
    daysRemaining: int = Field(..., example=45)
    currentStock: int = Field(..., example=2000)
    consumptionRate: int = Field(..., example=100)


class ExpiryRiskResponse(BaseModel):
    batchNumber: str = Field(..., example="BATCH-2026-09A")
    risk: str = Field(..., example="HIGH")
    daysRemaining: int = Field(..., example=45)
    reason: Optional[str] = Field(None, example="Expiry less than 60 days")


@router.post("/predict-expiry-risk", response_model=ExpiryRiskResponse)
def handle_predict_expiry_risk(request: ExpiryRiskRequest):
    """
    Expiry Risk Assessment endpoint using Decision Tree + Expiry Rule Engine (<60 days or low consumption).
    """
    if not request.batchNumber or not request.batchNumber.strip():
        raise HTTPException(status_code=400, detail="Batch number cannot be empty.")
        
    result = predict_expiry_risk(
        batch_number=request.batchNumber,
        days_remaining=request.daysRemaining,
        current_stock=request.currentStock,
        monthly_consumption_rate=request.consumptionRate
    )
    return ExpiryRiskResponse(**result)
