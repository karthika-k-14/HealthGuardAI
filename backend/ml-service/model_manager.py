import os
import shutil
import joblib
import psycopg2
from datetime import datetime
from typing import Dict, Any, Optional

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, 'models')
ARCHIVE_DIR = os.path.join(MODELS_DIR, 'archive')

os.makedirs(MODELS_DIR, exist_ok=True)
os.makedirs(ARCHIVE_DIR, exist_ok=True)

CHAMPION_MODEL_PATH = os.path.join(MODELS_DIR, 'medicine_demand_model.pkl')
METRICS_METADATA_PATH = os.path.join(MODELS_DIR, 'current_metrics.joblib')

DB_PARAMS = {
    'host': 'localhost',
    'port': 5432,
    'user': 'postgres',
    'password': 'blue30@04',
    'dbname': 'healthguard_db'
}

def get_db_connection():
    return psycopg2.connect(**DB_PARAMS)

def get_current_champion_metrics() -> Optional[Dict[str, Any]]:
    """
    Returns the metrics and version of the currently deployed champion model.
    """
    if os.path.exists(METRICS_METADATA_PATH):
        try:
            return joblib.load(METRICS_METADATA_PATH)
        except Exception:
            pass

    conn = get_db_connection()
    try:
        cur = conn.cursor()
        cur.execute("""
            SELECT model_name, model_version, mae, rmse, mape, r2_score, champion_model_name, champion_model_version
            FROM ml_model_metrics
            WHERE is_champion = TRUE
            ORDER BY trained_at DESC
            LIMIT 1
        """)
        row = cur.fetchone()
        if row:
            return {
                'model_name': row[0],
                'model_version': row[1],
                'mae': row[2],
                'rmse': row[3],
                'mape': row[4],
                'r2_score': row[5],
                'champion_model_name': row[6] or row[0],
                'champion_model_version': row[7] or row[1]
            }
        return None
    finally:
        conn.close()

def archive_current_champion(current_metrics: Optional[Dict[str, Any]]) -> Optional[str]:
    """
    Archives the current production model file before it gets replaced.
    """
    if not os.path.exists(CHAMPION_MODEL_PATH):
        return None

    ver = current_metrics.get('model_version', datetime.now().strftime('%Y%m%d_%H%M%S')) if current_metrics else datetime.now().strftime('%Y%m%d_%H%M%S')
    archive_filename = f"model_{ver}.pkl"
    dest_path = os.path.join(ARCHIVE_DIR, archive_filename)
    shutil.copy2(CHAMPION_MODEL_PATH, dest_path)
    print(f"Archived previous champion to: {dest_path}")
    return archive_filename

def deploy_new_champion(model: Any, model_name: str, model_version: str, metrics: Dict[str, float], training_samples: int, date_range_days: int) -> bool:
    """
    Deploys a new model to production:
    1. Archives existing champion
    2. Saves new model to medicine_demand_model.pkl
    3. Writes new champion metadata into ml_model_metrics table
    """
    current = get_current_champion_metrics()
    archive_file = archive_current_champion(current)

    # Save to production path
    joblib.dump(model, CHAMPION_MODEL_PATH)

    # Update metadata cache
    champ_meta = {
        'model_name': model_name,
        'model_version': model_version,
        'champion_model_name': model_name,
        'champion_model_version': model_version,
        'mae': metrics['mae'],
        'rmse': metrics['rmse'],
        'mape': metrics['mape'],
        'r2_score': metrics['r2_score'],
        'training_samples': training_samples,
        'date_range_days': date_range_days,
        'deployed_at': datetime.now().isoformat()
    }
    joblib.dump(champ_meta, METRICS_METADATA_PATH)

    # Log to PostgreSQL
    conn = get_db_connection()
    try:
        cur = conn.cursor()
        # Mark previous champions as superseded
        cur.execute("UPDATE ml_model_metrics SET is_champion = FALSE, status = 'SUPERSEDED' WHERE is_champion = TRUE")
        
        cur.execute("""
            INSERT INTO ml_model_metrics (
                model_name, model_version, champion_model_name, champion_model_version,
                mae, rmse, mape, r2_score, is_champion, training_samples, date_range_days, status, trained_at
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, TRUE, %s, %s, 'ACTIVE', NOW())
        """, (
            model_name, model_version, model_name, model_version,
            metrics['mae'], metrics['rmse'], metrics['mape'], metrics['r2_score'],
            training_samples, date_range_days
        ))
        conn.commit()
        print(f"Successfully promoted and deployed new champion model: {model_name} (version {model_version})")
        return True
    finally:
        conn.close()

def log_candidate_evaluation(model_name: str, model_version: str, current_champion: Optional[Dict[str, Any]], metrics: Dict[str, float], samples: int, days: int, status: str = 'REJECTED'):
    """
    Logs non-champion candidate evaluations to ml_model_metrics.
    """
    champ_name = current_champion.get('champion_model_name', 'None') if current_champion else model_name
    champ_ver = current_champion.get('champion_model_version', 'None') if current_champion else model_version
    conn = get_db_connection()
    try:
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO ml_model_metrics (
                model_name, model_version, champion_model_name, champion_model_version,
                mae, rmse, mape, r2_score, is_champion, training_samples, date_range_days, status, trained_at
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, FALSE, %s, %s, %s, NOW())
        """, (
            model_name, model_version, champ_name, champ_ver,
            metrics['mae'], metrics['rmse'], metrics['mape'], metrics['r2_score'],
            samples, days, status
        ))
        conn.commit()
    finally:
        conn.close()

def load_champion_model():
    """
    Loads the deployed production champion model.
    """
    if not os.path.exists(CHAMPION_MODEL_PATH):
        raise FileNotFoundError(f"Champion model not found at {CHAMPION_MODEL_PATH}. Please train the model first.")
    return joblib.load(CHAMPION_MODEL_PATH)

def list_archived_models():
    """
    Lists all archived models with timestamps and sizes.
    """
    if not os.path.exists(ARCHIVE_DIR):
        return []
    archives = []
    for f in sorted(os.listdir(ARCHIVE_DIR), reverse=True):
        if f.endswith('.pkl'):
            f_path = os.path.join(ARCHIVE_DIR, f)
            archives.append({
                'filename': f,
                'version': f.replace('model_', '').replace('.pkl', ''),
                'size_bytes': os.path.getsize(f_path),
                'modified': datetime.fromtimestamp(os.path.getmtime(f_path)).isoformat()
            })
    return archives

def rollback_to_version(target_version: str) -> bool:
    """
    Restores an archived model version as the active champion model.
    """
    archive_file = f"model_{target_version}.pkl" if not target_version.startswith("model_") else f"{target_version}.pkl"
    source_path = os.path.join(ARCHIVE_DIR, archive_file)
    if not os.path.exists(source_path):
        raise FileNotFoundError(f"Target archive model version not found: {source_path}")

    # Archive current before rollback
    current = get_current_champion_metrics()
    archive_current_champion(current)

    # Restore target
    shutil.copy2(source_path, CHAMPION_MODEL_PATH)

    # Update database metrics
    conn = get_db_connection()
    try:
        cur = conn.cursor()
        cur.execute("UPDATE ml_model_metrics SET is_champion = FALSE, status = 'SUPERSEDED' WHERE is_champion = TRUE")
        cur.execute("""
            INSERT INTO ml_model_metrics (
                model_name, model_version, champion_model_name, champion_model_version,
                mae, rmse, mape, r2_score, is_champion, training_samples, date_range_days, status, trained_at
            ) VALUES (%s, %s, %s, %s, 0.0, 0.0, 0.0, 0.0, TRUE, 0, 0, 'RESTORED_FROM_ROLLBACK', NOW())
        """, (f"Restored ({target_version})", target_version, f"Restored ({target_version})", target_version))
        conn.commit()

        if os.path.exists(METRICS_METADATA_PATH):
            try:
                meta = joblib.load(METRICS_METADATA_PATH)
                meta['champion_model_version'] = target_version
                meta['model_version'] = target_version
                joblib.dump(meta, METRICS_METADATA_PATH)
            except Exception:
                pass

        print(f"Successfully rolled back champion model to version: {target_version}")
        return True
    finally:
        conn.close()
