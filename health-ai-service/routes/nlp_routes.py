from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional
from services.nlp_service import (
    process_clinical_nlp,
    extract_symptoms_nlp,
    classify_disease_nlp
)

router = APIRouter(tags=["Clinical NLP Intelligence"])


class NlpAnalyzeRequest(BaseModel):
    text: str = Field(..., example="I have high fever and vomiting for 2 days")
    language: Optional[str] = Field("en", example="en")
    citizenId: Optional[int] = Field(None, example=1)


class NlpAnalyzeResponse(BaseModel):
    symptoms: List[str] = Field(..., example=["Fever", "Vomiting"])
    diseaseCategory: str = Field(..., example="GASTRO")
    confidence: float = Field(..., example=0.89)
    riskScore: int = Field(..., example=76)
    urgencyLevel: str = Field(..., example="HIGH")
    reasoning: str = Field(..., example="Acute gastroenteritis symptoms detected...")
    recommendations: List[str] = Field(default_factory=list)
    safetyOverride: bool = Field(default=False)


class SymptomExtractRequest(BaseModel):
    text: str = Field(..., example="I have high fever and vomiting")


class SymptomExtractResponse(BaseModel):
    symptoms: List[str] = Field(..., example=["High Fever", "Vomiting"])


class DiseaseClassifyRequest(BaseModel):
    text: str = Field(..., example="I have fever, chills and mosquito bites")


class DiseaseClassifyResponse(BaseModel):
    category: str = Field(..., example="VECTOR_BORNE")
    confidence: float = Field(..., example=0.91)
    reasoning: Optional[str] = None


@router.post("/analyze", response_model=NlpAnalyzeResponse)
@router.post("/clinical-nlp", response_model=NlpAnalyzeResponse)
def handle_clinical_nlp_analyze(request: NlpAnalyzeRequest):
    """
    Main Clinical NLP Pipeline Endpoint:
    1. Extracts symptoms using clinical entity NLP matching
    2. Classifies disease category with confidence score (0.00-1.00)
    3. Evaluates clinical safety override rules (Critical, High, Medium, Low)
    4. Produces context-tailored recommendations and bounded 0-100 risk score
    """
    if not request.text or not request.text.strip():
        raise HTTPException(status_code=400, detail="Text field cannot be empty.")

    result = process_clinical_nlp(request.text, language=request.language or "en")
    return NlpAnalyzeResponse(**result)


@router.post("/extract-symptoms", response_model=SymptomExtractResponse)
def handle_extract_symptoms(request: SymptomExtractRequest):
    """Extracts clinical symptoms from unstructured free text."""
    if not request.text or not request.text.strip():
        raise HTTPException(status_code=400, detail="Text field cannot be empty.")

    symptoms = extract_symptoms_nlp(request.text)
    return SymptomExtractResponse(symptoms=symptoms)


@router.post("/classify", response_model=DiseaseClassifyResponse)
def handle_classify_disease(request: DiseaseClassifyRequest):
    """Classifies query into one of 8 canonical disease categories with confidence."""
    if not request.text or not request.text.strip():
        raise HTTPException(status_code=400, detail="Text field cannot be empty.")

    res = classify_disease_nlp(request.text)
    return DiseaseClassifyResponse(**res)
