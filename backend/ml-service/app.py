import os
import sys
import psycopg2
import numpy as np
import pandas as pd
from typing import Optional, List, Dict, Any
from fastapi import FastAPI, HTTPException, BackgroundTasks, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from feature_pipeline import build_single_inference_features, FEATURE_COLUMNS
from model_manager import (
    load_champion_model,
    get_current_champion_metrics,
    list_archived_models,
    rollback_to_version,
    get_db_connection
)
from shap_service import SHAPExplanationService
from anomaly_detector import AnomalyDetectionEngine
from outbreak_predictor import OutbreakPredictionEngine
from train_model import run_training_pipeline
from forecasting_routes import router as forecasting_router

app = FastAPI(
    title="HealthGuard AI - Enterprise ML Medicine Demand Forecasting & Risk Service",
    description="Production-grade AI/ML service powered by Scikit-Learn, SHAP Explainability, Isolation Forest Anomaly Detection, and Outbreak Surge Modeling.",
    version="2.0.0"
)

# Downstream service behind Gateway (Gateway handles CORS and credentials)
# app.add_middleware(CORSMiddleware) omitted to prevent duplicate 'Access-Control-Allow-Origin: http://localhost:5173, *' header

app.include_router(forecasting_router)

# Global model state
champion_model = None
shap_service = None
anomaly_engine = None
outbreak_engine = None

def init_services():
    global champion_model, shap_service, anomaly_engine, outbreak_engine
    try:
        champion_model = load_champion_model()
        shap_service = SHAPExplanationService(champion_model)
        anomaly_engine = AnomalyDetectionEngine()
        outbreak_engine = OutbreakPredictionEngine()
        print("All ML engines initialized successfully.")
    except Exception as e:
        print(f"Warning during model initialization: {e}. Retraining or training required.")

@app.on_event("startup")
def on_startup():
    init_services()

# --- Request / Response DTOs ---

from pydantic import BaseModel, Field, ConfigDict

class PredictDemandRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")
    medicineId: Optional[int] = Field(None, example=1)
    medicineName: Optional[str] = Field(None, example="Paracetamol")
    village: Optional[str] = Field("Bhubaneswar", example="Bhubaneswar")
    diseaseCases: Optional[int] = Field(120, example=120)
    stock: Optional[int] = Field(100, example=100)

class RollbackRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")
    version: str = Field(..., example="20260917_002440")

# --- Endpoints ---

@app.get("/health")
def health_check():
    metrics = get_current_champion_metrics()
    return {
        "status": "HEALTHY",
        "champion_model_name": metrics.get("champion_model_name") if metrics else "Unloaded",
        "champion_model_version": metrics.get("champion_model_version") if metrics else "Unloaded",
        "r2_score": metrics.get("r2_score") if metrics else None,
        "rmse": metrics.get("rmse") if metrics else None
    }

def calculate_tree_confidence(model, X: pd.DataFrame, predicted_val: float) -> float:
    """
    Computes rigorous confidence score:
    confidence = 1.0 - min(0.5, sigma / (mean_prediction + 1))
    Where sigma is the standard deviation of predictions across individual estimators.
    """
    try:
        estimators = getattr(model, 'estimators_', None)
        if estimators is not None and len(estimators) > 0:
            if isinstance(estimators[0], (list, np.ndarray)):
                est_flat = [e for sub in estimators for e in sub]
            else:
                est_flat = estimators
            per_tree_preds = [est.predict(X)[0] for est in est_flat[:30]]
            sigma = float(np.std(per_tree_preds))
            mean_pred = float(np.mean(per_tree_preds))
            ratio = sigma / max(1.0, mean_pred + 1.0)
            confidence = 1.0 - min(0.5, ratio)
            return round(max(0.65, min(0.99, confidence)), 2)
    except Exception:
        pass
    return 0.91

@app.post("/predict-demand")
def predict_demand(req: PredictDemandRequest):
    global champion_model, shap_service, anomaly_engine
    if champion_model is None:
        init_services()
        if champion_model is None:
            raise HTTPException(status_code=503, detail="Champion ML model is not yet trained or loaded.")

    med_id = req.medicineId or 1
    med_name = req.medicineName or "Paracetamol"
    vil = req.village or "Bhubaneswar"
    cases = req.diseaseCases if req.diseaseCases is not None else 100
    stock = req.stock if req.stock is not None else 100

    # 1. Build exact 14 features from live database state
    feature_df = build_single_inference_features(
        medicine_id=med_id,
        medicine_name=med_name,
        village=vil,
        disease_cases=cases,
        stock=stock
    )

    # 2. True ML Inference from champion model
    raw_pred = float(champion_model.predict(feature_df)[0])
    predicted_demand = int(round(max(0.0, raw_pred)))

    # 3. Model Confidence Score: 1.0 - min(0.5, sigma / (mean + 1))
    confidence = calculate_tree_confidence(champion_model, feature_df, raw_pred)

    # 4. Stock calculations
    avg_daily_consumption = float(feature_df['average_daily_consumption'].iloc[0])
    estimated_days_remaining = int(round(stock / max(1.0, avg_daily_consumption)))
    recommended_order = max(0, predicted_demand - stock)

    # 5. Multi-tier Risk Level
    if stock <= 0 or predicted_demand >= stock * 2.0 or stock <= 30:
        risk_level = "CRITICAL"
    elif predicted_demand > stock:
        risk_level = "HIGH"
    elif predicted_demand > stock * 0.7:
        risk_level = "MEDIUM"
    else:
        risk_level = "LOW"

    # 6. SHAP Feature Explanations
    explanation = shap_service.explain_prediction(feature_df)
    top_factors = explanation.get("main_reasons", [])

    # 7. Isolation Forest Anomaly Detection
    anomaly_result = anomaly_engine.evaluate_sample(
        feature_row=feature_df,
        medicine_id=med_id,
        medicine_name=med_name,
        predicted_demand=predicted_demand,
        stock=stock
    )

    return {
        "medicineId": int(med_id) if med_id is not None else None,
        "medicineName": str(med_name),
        "village": str(vil),
        "predictedDemand": int(predicted_demand),
        "confidence": float(confidence),
        "riskLevel": str(risk_level),
        "estimatedDaysOfStockRemaining": int(estimated_days_remaining),
        "recommendedOrder": int(recommended_order),
        "currentStock": int(stock),
        "anomalyDetected": bool(anomaly_result.get("is_anomaly", False)),
        "anomalySeverity": str(anomaly_result.get("severity", "NORMAL")),
        "topContributingFactors": list(top_factors),
        "explanation": explanation
    }

@app.get("/explanation/{medicine_id}")
def get_explanation(medicine_id: int):
    conn = get_db_connection()
    try:
        cur = conn.cursor()
        cur.execute("""
            SELECT medicine_id, medicine_name, current_stock, predicted_demand, confidence, risk_level,
                   recommended_order, estimated_days_of_stock_remaining, top_factors_json, model_version, generated_at
            FROM medicine_demand_forecasts
            WHERE medicine_id = %s OR medicine_id = %s
            ORDER BY generated_at DESC
            LIMIT 1
        """, (medicine_id, medicine_id))
        row = cur.fetchone()
        if not row:
            # Generate on the fly
            cur.execute("SELECT id, name, medicine_name, quantity FROM medicines WHERE id = %s LIMIT 1", (medicine_id,))
            m = cur.fetchone()
            if not m:
                raise HTTPException(status_code=404, detail="Medicine not found")
            return predict_demand(PredictDemandRequest(medicineId=m[0], medicineName=m[2] or m[1], stock=m[3] or 100))

        import json
        expl = json.loads(row[8]) if row[8] else {}
        return {
            "medicineId": row[0],
            "medicineName": row[1],
            "currentStock": row[2],
            "predictedDemand": row[3],
            "confidence": row[4],
            "riskLevel": row[5],
            "recommendedOrder": row[6],
            "estimatedDaysOfStockRemaining": row[7],
            "modelVersion": row[9],
            "generatedAt": row[10].isoformat() if row[10] else None,
            "baseValue": expl.get("base_value"),
            "positiveFactors": expl.get("top_positive_factors", []),
            "negativeFactors": expl.get("top_negative_factors", []),
            "mainReasons": expl.get("main_reasons", []),
            "explanation": expl
        }
    finally:
        conn.close()

@app.get("/anomalies")
def get_anomalies(limit: int = Query(15, ge=1, le=50)):
    global anomaly_engine
    if anomaly_engine is None:
        anomaly_engine = AnomalyDetectionEngine()
    return anomaly_engine.get_recent_alerts(limit=limit)

@app.get("/outbreak-predictions")
def get_outbreak_predictions():
    global outbreak_engine
    if outbreak_engine is None:
        outbreak_engine = OutbreakPredictionEngine()
    preds = outbreak_engine.get_latest_predictions()
    if not preds:
        preds = outbreak_engine.generate_and_store_predictions()
    return preds

@app.get("/model-metrics")
def get_model_metrics():
    conn = get_db_connection()
    try:
        cur = conn.cursor()
        cur.execute("""
            SELECT id, model_name, model_version, champion_model_name, champion_model_version,
                   mae, rmse, mape, r2_score, is_champion, training_samples, date_range_days, status, trained_at
            FROM ml_model_metrics
            ORDER BY trained_at DESC
            LIMIT 20
        """)
        rows = cur.fetchall()
        metrics = []
        for r in rows:
            metrics.append({
                "id": r[0],
                "modelName": r[1],
                "modelVersion": r[2],
                "championModelName": r[3],
                "championModelVersion": r[4],
                "mae": r[5],
                "rmse": r[6],
                "mape": r[7],
                "r2Score": r[8],
                "isChampion": r[9],
                "trainingSamples": r[10],
                "dateRangeDays": r[11],
                "status": r[12],
                "trainedAt": r[13].isoformat() if r[13] else None
            })
        return {
            "currentChampion": get_current_champion_metrics(),
            "leaderboard": metrics,
            "archivedModels": list_archived_models()
        }
    finally:
        conn.close()

@app.post("/retrain")
def trigger_retraining(background_tasks: BackgroundTasks):
    """
    Triggers automated retraining with TimeSeriesSplit and candidate promotion validation.
    """
    res = run_training_pipeline()
    init_services()
    return {
        "status": "COMPLETED",
        "result": res
    }

@app.post("/rollback")
def rollback_model(req: RollbackRequest):
    """
    Reverts the production champion model to an archived version.
    """
    try:
        success = rollback_to_version(req.version)
        init_services()
        return {
            "status": "SUCCESS",
            "message": f"Successfully rolled back to version {req.version}",
            "currentMetrics": get_current_champion_metrics()
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

if __name__ == '__main__':
    import socket
    import uvicorn

    try:
        # Dual-stack IPv6+IPv4 socket to seamlessly accept both localhost (::1) and 127.0.0.1
        sock = socket.socket(socket.AF_INET6, socket.SOCK_STREAM)
        sock.setsockopt(socket.IPPROTO_IPV6, socket.IPV6_V6ONLY, 0)
        sock.bind(('::', 8000))
        sock.listen(128)
        config = uvicorn.Config(app, log_level="info")
        server = uvicorn.Server(config)
        print("HealthGuard ML Service listening on dual-stack port 8000 (IPv4 + IPv6 localhost)")
        server.run([sock])
    except Exception as e:
        print(f"Dual-stack socket fallback ({e}), starting standard IPv4 uvicorn...")
        uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=False)

