import logging
from typing import Dict, Any, List
from services.urgency_service import predict_urgency

logger = logging.getLogger("health-ai-service.risk")

# Symptom clinical weights
SYMPTOM_WEIGHTS = {
    "fever": 16.0,
    "fatigue": 8.0,
    "headache": 9.0,
    "cough": 12.0,
    "joint pain": 10.0,
}

LIFESTYLE_MODIFIERS = {
    "active": -14.0,
    "moderate": 0.0,
    "sedentary": 18.0,
}


def calculate_health_risk(age: int = 30, symptoms: List[str] = None, lifestyle: str = "moderate") -> Dict[str, Any]:
    """
    Calculates dynamic AI health risk score using clinical biometric weighting
    combined with the Random Forest / Rule Engine ML Urgency classifier.
    """
    if symptoms is None:
        symptoms = []

    # 1. Base Age Curve (Non-linear epidemiological risk curve)
    clamped_age = max(1, min(95, age))
    age_ratio = clamped_age / 90.0
    age_risk = 12.0 + (age_ratio ** 1.5) * 38.0

    # 2. Lifestyle Modifier (Cardiovascular and metabolic reserve)
    lifestyle_key = (lifestyle or "moderate").strip().lower()
    lifestyle_delta = LIFESTYLE_MODIFIERS.get(lifestyle_key, 0.0)

    # 3. Symptom Assessment & ML Urgency Model Integration
    symptom_risk = 0.0
    urgency_level = "NONE"
    ml_confidence_reason = "No acute symptoms"

    if symptoms:
        cleaned_symptoms = [s.strip().lower() for s in symptoms if s and s.strip()]
        
        # Base clinical symptom weights
        for s in cleaned_symptoms:
            weight = SYMPTOM_WEIGHTS.get(s, 10.0)
            symptom_risk += weight

        # Cluster synergy: Respiratory or viral clusters
        has_fever = "fever" in cleaned_symptoms
        has_cough = "cough" in cleaned_symptoms
        has_joint_pain = "joint pain" in cleaned_symptoms
        has_headache = "headache" in cleaned_symptoms

        if has_fever and has_cough:
            symptom_risk += 8.0  # Acute respiratory tract syndrome synergy
        if has_fever and has_headache and has_joint_pain:
            symptom_risk += 12.0  # Acute febrile / vector-borne syndrome synergy

        # Pass through ML Urgency classifier
        symptoms_text = ", ".join(cleaned_symptoms)
        try:
            urgency_prediction = predict_urgency(symptoms_text)
            urgency_level = urgency_prediction.get("urgency", "LOW")
            ml_confidence_reason = urgency_prediction.get("reason", "ML classification")
            
            # Boost based on ML urgency
            ml_boost = {
                "LOW": 2.0,
                "MEDIUM": 8.0,
                "HIGH": 18.0,
                "CRITICAL": 30.0
            }.get(urgency_level, 0.0)
            symptom_risk += ml_boost
        except Exception as e:
            logger.warning(f"Failed to run ML urgency prediction: {e}")

    # 4. Final Aggregated Score
    raw_score = age_risk + lifestyle_delta + symptom_risk
    final_score = int(round(max(5.0, min(98.0, raw_score))))

    # 5. Risk Band Allocation
    if final_score <= 34:
        band = "Low"
    elif final_score <= 65:
        band = "Moderate"
    else:
        band = "High"

    # 6. Detailed Factors
    age_impact = (
        f"Standard (Age {clamped_age})"
        if clamped_age < 40
        else f"Moderate (Age {clamped_age})"
        if clamped_age < 60
        else f"Elevated Risk (Age {clamped_age})"
    )

    symptom_impact = (
        "0 active symptoms"
        if not symptoms
        else f"{len(symptoms)} active ({urgency_level} ML Urgency)"
    )

    if lifestyle_key == "active":
        lifestyle_impact = "ACTIVE (Protective: -14 pts)"
    elif lifestyle_key == "sedentary":
        lifestyle_impact = "SEDENTARY (Elevated: +18 pts)"
    else:
        lifestyle_impact = "MODERATE (Standard Baseline)"

    return {
        "score": final_score,
        "band": band,
        "factors": [
            {"label": "Age Factor", "impact": age_impact},
            {"label": "Symptom Count", "impact": symptom_impact},
            {"label": "Lifestyle Score", "impact": lifestyle_impact},
        ],
        "ml_metadata": {
            "urgency_level": urgency_level,
            "engine": "RandomForest + Clinical Biometric Bio-Index",
            "lifestyle_delta": lifestyle_delta,
        }
    }
