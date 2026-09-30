from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from services.disease_service import predict_disease

router = APIRouter(tags=["Disease Classification"])


class DiseaseRequest(BaseModel):
    symptoms: str = Field(..., example="fever body pain joint pain")


class DiseaseResponse(BaseModel):
    diseaseCategory: str = Field(..., example="DENGUE")
    confidence: float = Field(..., example=0.91)


@router.post("/predict-disease", response_model=DiseaseResponse)
@router.post("/disease", response_model=DiseaseResponse)
def handle_predict_disease(request: DiseaseRequest):
    """
    Disease Category Classification endpoint using Random Forest.
    """
    if not request.symptoms or not request.symptoms.strip():
        raise HTTPException(status_code=400, detail="Symptoms text cannot be empty.")
        
    result = predict_disease(request.symptoms)
    return DiseaseResponse(**result)
