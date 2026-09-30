import os
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure Logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("health-ai-service")

# Initialize FastAPI App
app = FastAPI(
    title="HealthGuard AI - Health AI Microservice",
    description="Python FastAPI Microservice providing NLP Intent Detection, Disease Classification, Urgency Scoring, Multilingual Translation, Medicine Demand Forecasting, and Expiry Risk Alerting.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Downstream service behind Gateway (Gateway at :8080 handles CORS and credentials).
# CORSMiddleware is omitted to prevent duplicate 'Access-Control-Allow-Origin: http://localhost:5173, *' header.
# (Spring Cloud Gateway injects Access-Control-Allow-Origin: http://localhost:5173, so downstream must not emit *)

# Import Routes
from routes.intent_routes import router as intent_router
from routes.disease_routes import router as disease_router
from routes.urgency_routes import router as urgency_router
from routes.translation_routes import router as translation_router
from routes.forecasting_routes import router as forecasting_router
from routes.expiry_routes import router as expiry_router
from routes.chat_routes import router as chat_router
from routes.risk_routes import router as risk_router
from routes.nlp_routes import router as nlp_router

# Register API Routers under /api/ai/health and root prefixes
PREFIX = "/api/ai/health"

app.include_router(intent_router, prefix=PREFIX)
app.include_router(disease_router, prefix=PREFIX)
app.include_router(urgency_router, prefix=PREFIX)
app.include_router(translation_router, prefix=PREFIX)
app.include_router(forecasting_router, prefix=PREFIX)
app.include_router(expiry_router, prefix=PREFIX)
app.include_router(chat_router, prefix=PREFIX)
app.include_router(risk_router, prefix=PREFIX)
app.include_router(nlp_router, prefix=f"{PREFIX}/nlp")

# Expose under /api/nlp as required by architecture
app.include_router(nlp_router, prefix="/api/nlp")

# Also expose without prefix for direct service-to-service call flexibility
app.include_router(intent_router)
app.include_router(disease_router)
app.include_router(urgency_router)
app.include_router(translation_router)
app.include_router(forecasting_router)
app.include_router(expiry_router)
app.include_router(chat_router)
app.include_router(risk_router)
app.include_router(nlp_router)

# Mount Enterprise ML Demand Forecasting & Anomaly Engine from backend/ml-service
try:
    import sys
    import importlib.util
    app_dir = os.path.dirname(os.path.abspath(__file__))
    if app_dir not in sys.path:
        sys.path.insert(0, app_dir)
    ml_service_dir = os.path.abspath(os.path.join(app_dir, "..", "backend", "ml-service"))
    if ml_service_dir not in sys.path:
        sys.path.append(ml_service_dir)
    ml_app_file = os.path.join(ml_service_dir, "app.py")
    if os.path.exists(ml_app_file):
        spec = importlib.util.spec_from_file_location("enterprise_ml_app_module", ml_app_file)
        enterprise_ml_module = importlib.util.module_from_spec(spec)
        sys.modules["enterprise_ml_app_module"] = enterprise_ml_module
        spec.loader.exec_module(enterprise_ml_module)
        if hasattr(enterprise_ml_module, "app"):
            app.include_router(enterprise_ml_module.app.router)
            logger.info("Enterprise ML Demand Forecasting routes mounted successfully.")
except Exception as e:
    logger.error(f"Failed to mount enterprise ML routes: {e}")


@app.on_event("startup")
def startup_event():
    logger.info("Initializing Health AI Service models...")
    try:
        from training.train_intent import train_intent_model
        from training.train_disease import train_disease_model
        from training.train_urgency import train_urgency_model
        from training.train_expiry import train_expiry_model
        from training.train_forecasting import train_forecasting_model
        
        models_dir = os.path.join(os.path.dirname(__file__), "models")
        if not os.path.exists(os.path.join(models_dir, "intent_model.pkl")):
            train_intent_model()
        if not os.path.exists(os.path.join(models_dir, "disease_model.pkl")):
            train_disease_model()
        if not os.path.exists(os.path.join(models_dir, "urgency_model.pkl")):
            train_urgency_model()
        if not os.path.exists(os.path.join(models_dir, "expiry_model.pkl")):
            train_expiry_model()
        if not os.path.exists(os.path.join(models_dir, "forecasting_model.pkl")):
            train_forecasting_model()
            
        logger.info("All Health AI models loaded and ready.")
    except Exception as e:
        logger.error(f"Error during model initialization: {e}")


@app.get("/health", tags=["Health Check"])
@app.get("/actuator/health", tags=["Health Check"])
def health_check():
    return {
        "status": "UP",
        "service": "health-ai-service",
        "engine": "Python FastAPI"
    }


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    app_dir = os.path.dirname(os.path.abspath(__file__))
    if sys.path[0] != app_dir:
        sys.path.insert(0, app_dir)
    uvicorn.run("app:app", host=host, port=port, reload=False, app_dir=app_dir)
