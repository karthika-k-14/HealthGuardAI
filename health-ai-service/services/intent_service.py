import os
import joblib
import logging
from typing import Dict, Any

logger = logging.getLogger("health-ai-service.intent")

MODEL_PATH = os.path.join(os.path.dirname(__file__), "../models/intent_model.pkl")
_model_pipeline = None


def load_model():
    global _model_pipeline
    if _model_pipeline is None:
        if not os.path.exists(MODEL_PATH):
            logger.info("Intent model file not found. Running training script...")
            from training.train_intent import train_intent_model
            train_intent_model()
        _model_pipeline = joblib.load(MODEL_PATH)
    return _model_pipeline


def predict_intent(text: str) -> Dict[str, Any]:
    """
    Predicts intent using TF-IDF + Logistic Regression pipeline.
    Supported Intents:
    SYMPTOM_QUERY, DISEASE_INFORMATION, PREVENTION_ADVICE, MEDICINE_INFORMATION,
    VACCINATION_QUERY, HOSPITAL_SEARCH, EMERGENCY_HELP, GENERAL_HEALTH_QUERY
    """
    if not text or not text.strip():
        return {"intent": "GENERAL_HEALTH_QUERY", "confidence": 0.50}
    
    try:
        model = load_model()
        probabilities = model.predict_proba([text])[0]
        max_idx = probabilities.argmax()
        classes = model.classes_
        
        intent = classes[max_idx]
        confidence = round(float(probabilities[max_idx]), 4)
        
        return {
            "intent": intent,
            "confidence": confidence
        }
    except Exception as e:
        logger.error(f"Error predicting intent: {e}")
        return {"intent": "GENERAL_HEALTH_QUERY", "confidence": 0.50}
