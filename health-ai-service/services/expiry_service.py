import os
import joblib
import logging
from typing import Dict, Any, Optional

logger = logging.getLogger("health-ai-service.expiry")

MODEL_PATH = os.path.join(os.path.dirname(__file__), "../models/expiry_model.pkl")
_model = None


def load_model():
    global _model
    if _model is None:
        if not os.path.exists(MODEL_PATH):
            logger.info("Expiry model file not found. Running training script...")
            from training.train_expiry import train_expiry_model
            train_expiry_model()
        _model = joblib.load(MODEL_PATH)
    return _model


def predict_expiry_risk(
    batch_number: str,
    days_remaining: int,
    current_stock: int,
    monthly_consumption_rate: int
) -> Dict[str, Any]:
    """
    Evaluates expiry risk level (HIGH, MEDIUM, LOW) for a medicine batch based on
    days to expiry and consumption rate.
    
    Rules:
    - Expiry < 60 days -> HIGH RISK
    - Monthly consumption rate too low to deplete stock before expiry -> HIGH RISK
    """
    # 1. Mandatory Rule Checks
    daily_consumption = max(0.1, monthly_consumption_rate / 30.0)
    days_to_deplete = current_stock / daily_consumption if daily_consumption > 0 else 9999
    
    is_expiry_near = days_remaining < 60
    is_slow_moving = days_to_deplete > days_remaining
    
    if is_expiry_near or is_slow_moving:
        return {
            "batchNumber": batch_number,
            "risk": "HIGH",
            "daysRemaining": days_remaining,
            "reason": "Expiry less than 60 days" if is_expiry_near else "Stock consumption rate too low to clear before expiry"
        }
        
    # 2. Decision Tree ML Support
    try:
        model = load_model()
        prediction = model.predict([[days_remaining, current_stock, monthly_consumption_rate]])[0]
        return {
            "batchNumber": batch_number,
            "risk": str(prediction),
            "daysRemaining": days_remaining,
            "reason": "ML Decision Tree risk assessment"
        }
    except Exception as e:
        logger.error(f"Error predicting expiry risk: {e}")
        return {
            "batchNumber": batch_number,
            "risk": "LOW",
            "daysRemaining": days_remaining,
            "reason": "Stock levels normal"
        }
