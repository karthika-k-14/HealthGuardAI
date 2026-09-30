import os
import joblib
import logging
from typing import Dict, Any

logger = logging.getLogger("health-ai-service.disease")

MODEL_PATH = os.path.join(os.path.dirname(__file__), "../models/disease_model.pkl")
_model_pipeline = None


def load_model():
    global _model_pipeline
    if _model_pipeline is None:
        if not os.path.exists(MODEL_PATH):
            logger.info("Disease model file not found. Running training script...")
            from training.train_disease import train_disease_model
            train_disease_model()
        _model_pipeline = joblib.load(MODEL_PATH)
    return _model_pipeline


def predict_disease(symptoms_text: str) -> Dict[str, Any]:
    """
    Predicts disease category using Random Forest classification model.
    """
    if not symptoms_text or not symptoms_text.strip():
        return {"diseaseCategory": "GENERAL_ILLNESS", "confidence": 0.50}
    
    try:
        model = load_model()
        probabilities = model.predict_proba([symptoms_text])[0]
        max_idx = probabilities.argmax()
        classes = model.classes_
        
        disease = classes[max_idx]
        confidence = round(float(probabilities[max_idx]), 4)
        
        return {
            "diseaseCategory": disease,
            "confidence": confidence
        }
    except Exception as e:
        logger.error(f"Error predicting disease: {e}")
        return {"diseaseCategory": "GENERAL_ILLNESS", "confidence": 0.50}
