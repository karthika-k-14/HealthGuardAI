import os
import joblib
import logging
from typing import Dict, Any

logger = logging.getLogger("health-ai-service.urgency")

MODEL_PATH = os.path.join(os.path.dirname(__file__), "../models/urgency_model.pkl")
_model_pipeline = None


def load_model():
    global _model_pipeline
    if _model_pipeline is None:
        if not os.path.exists(MODEL_PATH):
            logger.info("Urgency model file not found. Running training script...")
            from training.train_urgency import train_urgency_model
            train_urgency_model()
        _model_pipeline = joblib.load(MODEL_PATH)
    return _model_pipeline


# Critical & High emergency rule keywords
CRITICAL_KEYWORDS = [
    "chest pain", "unconscious", "unresponsive", "blue lips",
    "stroke", "not breathing", "stopped breathing", "profuse bleeding",
    "head injury", "sudden collapse", "poison",
    "jaundice with confusion", "hepatic coma", "liver failure"
]

HIGH_KEYWORDS = [
    "breathing difficulty", "high fever", "coughing blood",
    "severe pain", "convulsion", "seizure", "dehydration",
    "continuous vomiting", "petecchiae", "fainting",
    "jaundice", "yellow eyes", "yellow skin", "yellowish eyes", "yellowish skin",
    "icterus", "dark urine", "hepatitis", "liver pain", "right upper quadrant pain"
]


def predict_urgency(symptoms_text: str) -> Dict[str, Any]:
    """
    Predicts urgency level (LOW, MEDIUM, HIGH, CRITICAL) and risk score (0-100)
    using Rule Engine + Random Forest ML support.
    """
    text_lower = (symptoms_text or "").lower()
    
    # 1. Rule Engine Priority Override for Emergency Safety
    for kw in CRITICAL_KEYWORDS:
        if kw in text_lower:
            return {
                "urgency": "CRITICAL",
                "score": 98,
                "reason": f"Critical symptom keyword detected: '{kw}'"
            }
            
    for kw in HIGH_KEYWORDS:
        if kw in text_lower:
            return {
                "urgency": "HIGH",
                "score": 85,
                "reason": f"High risk symptom keyword detected: '{kw}'"
            }
            
    # 2. ML Support Classifier
    try:
        model = load_model()
        probabilities = model.predict_proba([symptoms_text])[0]
        classes = model.classes_
        max_idx = probabilities.argmax()
        predicted_urgency = classes[max_idx]
        
        # Map urgency string to score range
        base_scores = {
            "LOW": 20,
            "MEDIUM": 50,
            "HIGH": 80,
            "CRITICAL": 95
        }
        
        confidence = float(probabilities[max_idx])
        base_score = base_scores.get(predicted_urgency, 30)
        score = int(min(100, max(0, base_score + (confidence - 0.5) * 20)))
        
        return {
            "urgency": predicted_urgency,
            "score": score,
            "reason": f"ML Model classification confidence {confidence:.2f}"
        }
    except Exception as e:
        logger.error(f"Error predicting urgency: {e}")
        return {"urgency": "LOW", "score": 25, "reason": "Default fallback score"}
