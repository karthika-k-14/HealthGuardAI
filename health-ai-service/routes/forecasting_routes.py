from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Dict, Any, List, Optional
from services.forecasting_service import forecast_medicine_demand
from services.demand_forecaster import generate_medicine_demand_forecast, get_disease_intelligence_data

router = APIRouter(tags=["Medicine Demand Forecasting"])


class ForecastRequest(BaseModel):
    medicine: str = Field(..., example="Paracetamol 500mg")
    historicalUsage: int = Field(..., example=5000)
    monthOffset: int = Field(1, example=1)
    districtOutbreakRisk: int = Field(0, example=0)


class ForecastResponse(BaseModel):
    medicine: str = Field(..., example="Paracetamol 500mg")
    predictedDemand: int = Field(..., example=5400)
    forecastMonth: str = Field(..., example="Next Month")
    confidence: float = Field(0.92, example=0.92)


@router.post("/forecast-demand", response_model=ForecastResponse)
def handle_forecast_demand(request: ForecastRequest):
    """
    Medicine Demand Forecasting endpoint using Linear Regression / time-series model.
    """
    if not request.medicine or not request.medicine.strip():
        raise HTTPException(status_code=400, detail="Medicine name cannot be empty.")
    if request.historicalUsage < 0:
        raise HTTPException(status_code=400, detail="Historical usage cannot be negative.")
        
    result = forecast_medicine_demand(
        medicine_name=request.medicine,
        historical_usage=request.historicalUsage,
        month_offset=request.monthOffset,
        district_outbreak_risk=request.districtOutbreakRisk
    )
    return ForecastResponse(**result)


@router.get("/pharmacist/demand-forecast")
def handle_pharmacist_demand_forecast():
    """
    Production-grade AI/ML Medicine Demand Forecasting for Pharmacist Domain.
    Strictly uses validated approved disease surveillance reports, actual PostgreSQL consumption history,
    and current inventory state.
    """
    try:
        data = generate_medicine_demand_forecast()
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Forecasting engine error: {str(e)}")


@router.get("/pharmacist/forecasting-metadata")
def handle_forecasting_metadata():
    """
    Forecasting model metadata, versioning, audit trail, and performance parameters.
    """
    try:
        forecast = generate_medicine_demand_forecast()
        return {
            "metadata": forecast.get("metadata", {}),
            "forecastSourceSummary": forecast.get("forecastSourceSummary", {}),
            "insufficientData": forecast.get("insufficientData", False)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch metadata: {str(e)}")


@router.get("/officer/disease-intelligence")
def handle_disease_intelligence():
    """
    Disease Intelligence Analytics for Health Officer Domain.
    Calculates active validated cases, village distribution, Outbreak Risk Score, and referral rates.
    """
    try:
        data = get_disease_intelligence_data()
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Disease intelligence engine error: {str(e)}")
