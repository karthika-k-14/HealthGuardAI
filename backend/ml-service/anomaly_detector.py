import os
import joblib
import psycopg2
import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from typing import Dict, Any, List

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, 'models')
ANOMALY_MODEL_PATH = os.path.join(MODELS_DIR, 'anomaly_detector.pkl')

DB_PARAMS = {
    'host': 'localhost',
    'port': 5432,
    'user': 'postgres',
    'password': 'blue30@04',
    'dbname': 'healthguard_db'
}

def get_db_connection():
    return psycopg2.connect(**DB_PARAMS)

class AnomalyDetectionEngine:
    def __init__(self):
        self.model = None
        self._load_or_init_model()

    def _load_or_init_model(self):
        if os.path.exists(ANOMALY_MODEL_PATH):
            try:
                self.model = joblib.load(ANOMALY_MODEL_PATH)
            except Exception as e:
                print(f"Error loading anomaly model: {e}")
                self.model = None
        if self.model is None:
            self.model = IsolationForest(n_estimators=100, contamination=0.08, random_state=42)

    def fit_and_save(self, df: pd.DataFrame, feature_cols: List[str]):
        """
        Trains IsolationForest on historical consumption features.
        """
        X = df[feature_cols].copy().fillna(0)
        self.model = IsolationForest(n_estimators=100, contamination=0.08, random_state=42)
        self.model.fit(X)
        joblib.dump(self.model, ANOMALY_MODEL_PATH)
        print(f"IsolationForest trained and saved to {ANOMALY_MODEL_PATH}")

    def evaluate_sample(self, feature_row: pd.DataFrame, medicine_id: int, medicine_name: str, predicted_demand: int, stock: int) -> Dict[str, Any]:
        """
        Evaluates a live inference feature vector for anomalies:
        - Outlier prediction (-1 = anomaly, 1 = normal)
        - Anomaly score (lower is more anomalous)
        """
        if self.model is None:
            self._load_or_init_model()

        try:
            pred = self.model.predict(feature_row)[0]
            score = float(self.model.score_samples(feature_row)[0])
        except Exception:
            pred = 1
            score = 0.5

        is_anomaly = (pred == -1) or (score < -0.15) or (predicted_demand > stock * 3 and stock > 20)
        severity = 'NORMAL'
        description = None

        if is_anomaly:
            if score < -0.30 or predicted_demand > stock * 4:
                severity = 'CRITICAL'
                description = f"Severe demand spike detected for {medicine_name}: Predicted demand ({predicted_demand} units) outstrips current inventory ({stock} units) by 4x. Anomalous consumption velocity."
            elif score < -0.20 or predicted_demand > stock * 2.5:
                severity = 'HIGH'
                description = f"High demand anomaly for {medicine_name}: Unusual stock depletion rate relative to seasonal baseline."
            else:
                severity = 'MEDIUM'
                description = f"Moderate consumption deviation detected for {medicine_name}."

            # DB persistence handled by ForecastRefreshService in Spring Boot
            # self._log_alert_to_db(medicine_id, medicine_name, score, severity, description)

        return {
            'is_anomaly': bool(is_anomaly),
            'anomaly_score': float(round(score, 4)),
            'severity': str(severity),
            'description': str(description) if description else None
        }

    def _log_alert_to_db(self, med_id: int, med_name: str, score: float, severity: str, desc: str):
        conn = get_db_connection()
        try:
            cur = conn.cursor()
            # Avoid duplicate identical alerts on same day
            cur.execute("""
                SELECT id FROM demand_anomaly_alerts
                WHERE medicine_name = %s AND created_at >= NOW() - INTERVAL '12 hours'
                LIMIT 1
            """, (med_name,))
            if not cur.fetchone():
                cur.execute("""
                    INSERT INTO demand_anomaly_alerts (medicine_id, medicine_name, anomaly_score, severity, description, created_at)
                    VALUES (%s, %s, %s, %s, %s, NOW())
                """, (med_id, med_name, round(score, 4), severity, desc))
                conn.commit()
        except Exception as e:
            print(f"Error logging anomaly alert: {e}")
        finally:
            conn.close()

    def get_recent_alerts(self, limit: int = 15) -> List[Dict[str, Any]]:
        conn = get_db_connection()
        try:
            cur = conn.cursor()
            cur.execute("""
                SELECT id, medicine_id, medicine_name, anomaly_score, severity, description, created_at
                FROM demand_anomaly_alerts
                ORDER BY created_at DESC
                LIMIT %s
            """, (limit,))
            rows = cur.fetchall()
            alerts = []
            for r in rows:
                alerts.append({
                    'id': r[0],
                    'medicineId': r[1],
                    'medicineName': r[2],
                    'anomalyScore': r[3],
                    'severity': r[4],
                    'description': r[5],
                    'createdAt': r[6].isoformat() if r[6] else None
                })
            return alerts
        finally:
            conn.close()
