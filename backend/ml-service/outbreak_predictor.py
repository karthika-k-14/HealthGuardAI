import os
import joblib
import psycopg2
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from sklearn.ensemble import GradientBoostingClassifier
from typing import Dict, Any, List

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, 'models')
OUTBREAK_MODEL_PATH = os.path.join(MODELS_DIR, 'outbreak_model.pkl')

DB_PARAMS = {
    'host': 'localhost',
    'port': 5432,
    'user': 'postgres',
    'password': 'blue30@04',
    'dbname': 'healthguard_db'
}

TARGET_DISEASES = ['Malaria', 'Dengue', 'Diarrhea', 'Viral Fever']
VILLAGES = ['Bhubaneswar', 'Nayapalli', 'Patia', 'Khandagiri', 'Rasulgarh', 'Chandrasekharpur']

def get_db_connection():
    return psycopg2.connect(**DB_PARAMS)

class OutbreakPredictionEngine:
    def __init__(self):
        self.model = None
        self._load_model()

    def _load_model(self):
        if os.path.exists(OUTBREAK_MODEL_PATH):
            try:
                self.model = joblib.load(OUTBREAK_MODEL_PATH)
            except Exception as e:
                print(f"Error loading outbreak model: {e}")
                self.model = None

    def train_and_save(self):
        """
        Trains outbreak classification model based on disease velocity in surveillance reports.
        """
        conn = get_db_connection()
        try:
            surv_df = pd.read_sql("""
                SELECT report_id, report_date, disease, severity, village
                FROM disease_surveillance_reports
                WHERE UPPER(status) = 'VERIFIED' AND disease IN ('Malaria', 'Dengue', 'Diarrhea', 'Viral Fever')
                ORDER BY report_date ASC
            """, conn)
        finally:
            conn.close()

        if surv_df.empty or len(surv_df) < 20:
            print("Insufficient surveillance reports for outbreak model training. Using rule-weighted baseline.")
            return

        surv_df['report_date'] = pd.to_datetime(surv_df['report_date'])
        
        # Build village-disease time series
        samples = []
        for dis in TARGET_DISEASES:
            for vil in VILLAGES:
                sub = surv_df[(surv_df['disease'] == dis) & (surv_df['village'] == vil)]
                if sub.empty:
                    continue
                # Compute 7-day vs 30-day velocity
                dt_max = sub['report_date'].max()
                for d in range(15, 120, 7):
                    ref_dt = dt_max - timedelta(days=d)
                    c_7d = len(sub[(sub['report_date'] >= ref_dt - timedelta(days=7)) & (sub['report_date'] <= ref_dt)])
                    c_30d = len(sub[(sub['report_date'] >= ref_dt - timedelta(days=30)) & (sub['report_date'] <= ref_dt)])
                    growth = (c_7d * 4.28) / max(1.0, float(c_30d))
                    
                    # Target: actual cases in next 14 days
                    next_14d = len(sub[(sub['report_date'] > ref_dt) & (sub['report_date'] <= ref_dt + timedelta(days=14))])
                    
                    risk_class = 0 # Low
                    if next_14d >= 8:
                        risk_class = 3 # Critical
                    elif next_14d >= 5:
                        risk_class = 2 # High
                    elif next_14d >= 2:
                        risk_class = 1 # Medium

                    samples.append({
                        'c_7d': c_7d,
                        'c_30d': c_30d,
                        'growth': growth,
                        'month': ref_dt.month,
                        'risk_class': risk_class,
                        'next_14d': next_14d
                    })

        if len(samples) >= 15:
            train_df = pd.DataFrame(samples)
            X = train_df[['c_7d', 'c_30d', 'growth', 'month']]
            y = train_df['risk_class']

            model = GradientBoostingClassifier(n_estimators=60, max_depth=3, random_state=42)
            model.fit(X, y)
            self.model = model
            joblib.dump(model, OUTBREAK_MODEL_PATH)
            print(f"Outbreak prediction model trained and saved to {OUTBREAK_MODEL_PATH}")

    def generate_and_store_predictions(self) -> List[Dict[str, Any]]:
        """
        Evaluates current epidemiological situation and generates outbreak risk scores per village/disease.
        Stores results into outbreak_predictions table.
        """
        conn = get_db_connection()
        predictions = []
        try:
            cur = conn.cursor()
            today = datetime.now().date()
            dt_7d = today - timedelta(days=7)
            dt_30d = today - timedelta(days=30)

            # Clear outdated predictions for today
            cur.execute("DELETE FROM outbreak_predictions WHERE prediction_date = %s", (today,))

            risk_labels = {0: 'LOW', 1: 'MEDIUM', 2: 'HIGH', 3: 'CRITICAL'}

            for dis in TARGET_DISEASES:
                for vil in VILLAGES:
                    cur.execute("""
                        SELECT 
                            COUNT(CASE WHEN report_date >= %s THEN 1 END) AS c_7d,
                            COUNT(CASE WHEN report_date >= %s THEN 1 END) AS c_30d,
                            COUNT(CASE WHEN severity = 'Critical' AND report_date >= %s THEN 1 END) AS crit_cnt
                        FROM disease_surveillance_reports
                        WHERE UPPER(status) = 'VERIFIED' AND disease = %s AND village = %s
                    """, (dt_7d, dt_30d, dt_30d, dis, vil))
                    row = cur.fetchone()
                    c_7d = row[0] if row else 0
                    c_30d = row[1] if row else 0
                    crit_cnt = row[2] if row else 0

                    growth = (c_7d * 4.28) / max(1.0, float(c_30d))
                    
                    # Outbreak risk inference
                    if self.model is not None:
                        feat = pd.DataFrame([{'c_7d': c_7d, 'c_30d': c_30d, 'growth': growth, 'month': today.month}])
                        pred_class = int(self.model.predict(feat)[0])
                        probs = self.model.predict_proba(feat)[0]
                        conf = round(float(np.max(probs)), 2)
                    else:
                        # Fallback heuristic if cold-start
                        if c_7d >= 4 or crit_cnt >= 2:
                            pred_class = 3
                        elif c_7d >= 2 or growth > 1.3:
                            pred_class = 2
                        elif c_30d >= 3:
                            pred_class = 1
                        else:
                            pred_class = 0
                        conf = 0.88

                    risk_level = risk_labels.get(pred_class, 'LOW')
                    risk_score = round(min(0.98, max(0.12, (pred_class + 1) * 0.24 + (growth * 0.05))), 2)
                    predicted_cases = int(max(c_7d, int(c_7d * 1.8 + crit_cnt * 2)))

                    cur.execute("""
                        INSERT INTO outbreak_predictions (disease, village, risk_score, risk_level, cases_predicted, confidence, prediction_date)
                        VALUES (%s, %s, %s, %s, %s, %s, %s)
                    """, (dis, vil, risk_score, risk_level, predicted_cases, conf, today))

                    predictions.append({
                        'disease': dis,
                        'village': vil,
                        'riskScore': risk_score,
                        'riskLevel': risk_level,
                        'casesPredicted': predicted_cases,
                        'confidence': conf,
                        'predictionDate': str(today)
                    })

            conn.commit()
            print(f"Generated and saved {len(predictions)} outbreak predictions to outbreak_predictions.")
            return predictions
        finally:
            conn.close()

    def get_latest_predictions(self) -> List[Dict[str, Any]]:
        conn = get_db_connection()
        try:
            cur = conn.cursor()
            cur.execute("""
                SELECT id, disease, village, risk_score, risk_level, cases_predicted, confidence, prediction_date
                FROM outbreak_predictions
                ORDER BY risk_score DESC, cases_predicted DESC
                LIMIT 20
            """)
            rows = cur.fetchall()
            preds = []
            for r in rows:
                preds.append({
                    'id': r[0],
                    'disease': r[1],
                    'village': r[2],
                    'riskScore': r[3],
                    'riskLevel': r[4],
                    'casesPredicted': r[5],
                    'confidence': r[6],
                    'predictionDate': str(r[7]) if r[7] else None
                })
            return preds
        finally:
            conn.close()
