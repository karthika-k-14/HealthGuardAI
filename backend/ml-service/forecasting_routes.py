from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Dict, Any, List, Optional
try:
    from demand_forecaster import generate_medicine_demand_forecast, get_disease_intelligence_data, get_health_map_data
except ImportError:
    from services.demand_forecaster import generate_medicine_demand_forecast, get_disease_intelligence_data, get_health_map_data

router = APIRouter(tags=["Medicine Demand & Disease Intelligence Forecasting"])


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


@router.get("/pharmacist/demand-forecast")
@router.get("/api/ai/health/pharmacist/demand-forecast")
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
@router.get("/api/ai/health/pharmacist/forecasting-metadata")
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
@router.get("/api/ai/health/officer/disease-intelligence")
def handle_disease_intelligence():
    """
    Disease Intelligence Analytics for Health Officer Domain.
    Calculates active validated cases, village distribution, and Outbreak Risk Score.
    """
    try:
        data = get_disease_intelligence_data()
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Disease intelligence engine error: {str(e)}")


@router.get("/officer/health-map")
@router.get("/api/ai/health/officer/health-map")
def handle_health_map():
    """
    Outbreak Predictions & Health Map Analytics for Health Officer Domain.
    Calculates village risk scores strictly based on real PostgreSQL surveillance data.
    """
    try:
        data = get_health_map_data()
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Health map engine error: {str(e)}")

