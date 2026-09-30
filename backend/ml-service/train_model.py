import sys
import numpy as np
import pandas as pd
from datetime import datetime
from sklearn.model_selection import TimeSeriesSplit
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score, mean_absolute_percentage_error
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor

from feature_pipeline import build_training_dataset, FEATURE_COLUMNS, TARGET_COLUMN
from model_manager import (
    get_current_champion_metrics,
    deploy_new_champion,
    log_candidate_evaluation
)
from anomaly_detector import AnomalyDetectionEngine
from outbreak_predictor import OutbreakPredictionEngine

# Conditional XGBoost check
XGBOOST_AVAILABLE = False
try:
    from xgboost import XGBRegressor
    XGBOOST_AVAILABLE = True
except ImportError:
    XGBOOST_AVAILABLE = False

MIN_SAMPLES_THRESHOLD = 300
MIN_DAYS_THRESHOLD = 90

def evaluate_model_cv(model, X: pd.DataFrame, y: pd.Series, tscv: TimeSeriesSplit):
    """
    Evaluates a regression model across chronological TimeSeriesSplit folds.
    Returns averaged test metrics across the temporal splits.
    """
    maes, rmses, mapes, r2s = [], [], [], []

    for train_idx, test_idx in tscv.split(X):
        X_train, X_test = X.iloc[train_idx], X.iloc[test_idx]
        y_train, y_test = y.iloc[train_idx], y.iloc[test_idx]

        model.fit(X_train, y_train)
        preds = model.predict(X_test)
        # Demand is strictly non-negative
        preds = np.clip(preds, a_min=0, a_max=None)

        maes.append(mean_absolute_error(y_test, preds))
        rmses.append(np.sqrt(mean_squared_error(y_test, preds)))
        # Guard against zero division in MAPE
        denom = np.where(y_test == 0, 1.0, y_test)
        mapes.append(np.mean(np.abs((y_test - preds) / denom)))
        r2s.append(r2_score(y_test, preds))

    # Fit finally on full training dataset
    model.fit(X, y)

    return {
        'mae': round(float(np.mean(maes)), 2),
        'rmse': round(float(np.mean(rmses)), 2),
        'mape': round(float(np.mean(mapes)), 4),
        'r2_score': round(float(np.mean(r2s)), 4)
    }

def run_training_pipeline() -> dict:
    print("=" * 70)
    print("HEALTHGUARD AI: ENTERPRISE ML MODEL TRAINING PIPELINE")
    print(f"Timestamp: {datetime.now().isoformat()}")
    print("=" * 70)

    # 1. Feature extraction
    print("\n[Step 1/5] Extracting 14 genuine features from PostgreSQL...")
    df = build_training_dataset()

    if df.empty:
        print("ERROR: Training dataset is completely empty. Aborting.")
        return {'status': 'FAILED', 'reason': 'EMPTY_DATASET'}

    samples = len(df)
    min_date = df['usage_date'].min()
    max_date = df['usage_date'].max()
    historical_days = (max_date - min_date).days

    print(f"Dataset generated: {samples} samples spanning {historical_days} days ({min_date.date()} to {max_date.date()}).")

    # 2. Data Safety Guardrail Check
    print("\n[Step 2/5] Validating Data Safety Guardrails (Samples >= 300 & Days >= 90)...")
    if samples < MIN_SAMPLES_THRESHOLD or historical_days < MIN_DAYS_THRESHOLD:
        msg = f"Guardrail check failed: Samples ({samples} < {MIN_SAMPLES_THRESHOLD}) or Days ({historical_days} < {MIN_DAYS_THRESHOLD}). Retaining current production model."
        print(f"WARNING: {msg}")
        return {
            'status': 'ABORTED_GUARDRAIL_FAILED',
            'samples': samples,
            'historical_days': historical_days,
            'message': msg
        }
    print("Guardrail check passed successfully.")

    # 3. TimeSeriesSplit Setup (Chronological, No Shuffling)
    print("\n[Step 3/5] Setting up TimeSeriesSplit(n_splits=5) chronological validation...")
    X = df[FEATURE_COLUMNS].copy()
    y = df[TARGET_COLUMN].copy()

    tscv = TimeSeriesSplit(n_splits=5)

    # 4. Multi-Model Tournament
    print("\n[Step 4/5] Executing Model Tournament...")
    candidates = {}

    # Candidate 1: RandomForestRegressor
    print("  -> Training Candidate 1: RandomForestRegressor...")
    rf = RandomForestRegressor(n_estimators=120, max_depth=10, min_samples_split=4, random_state=42)
    rf_metrics = evaluate_model_cv(rf, X, y, tscv)
    candidates['RandomForestRegressor'] = {'model': rf, 'metrics': rf_metrics}
    print(f"     RandomForest CV Results: R²={rf_metrics['r2_score']}, RMSE={rf_metrics['rmse']}, MAE={rf_metrics['mae']}, MAPE={rf_metrics['mape']}")

    # Candidate 2: GradientBoostingRegressor
    print("  -> Training Candidate 2: GradientBoostingRegressor...")
    gb = GradientBoostingRegressor(n_estimators=100, learning_rate=0.08, max_depth=5, min_samples_split=4, random_state=42)
    gb_metrics = evaluate_model_cv(gb, X, y, tscv)
    candidates['GradientBoostingRegressor'] = {'model': gb, 'metrics': gb_metrics}
    print(f"     GradientBoosting CV Results: R²={gb_metrics['r2_score']}, RMSE={gb_metrics['rmse']}, MAE={gb_metrics['mae']}, MAPE={gb_metrics['mape']}")

    # Candidate 3: XGBoost (if available)
    if XGBOOST_AVAILABLE:
        print("  -> Training Candidate 3: XGBoost (XGBRegressor)...")
        xgb = XGBRegressor(n_estimators=100, learning_rate=0.08, max_depth=5, random_state=42, objective='reg:squarederror')
        xgb_metrics = evaluate_model_cv(xgb, X, y, tscv)
        candidates['XGBRegressor'] = {'model': xgb, 'metrics': xgb_metrics}
        print(f"     XGBoost CV Results: R²={xgb_metrics['r2_score']}, RMSE={xgb_metrics['rmse']}, MAE={xgb_metrics['mae']}, MAPE={xgb_metrics['mape']}")
    else:
        print("  -> XGBoost not installed. Skipping gracefully per user rule.")

    # Select Best Candidate based on R² and RMSE
    best_candidate_name = max(candidates.keys(), key=lambda name: (candidates[name]['metrics']['r2_score'], -candidates[name]['metrics']['rmse']))
    best_candidate = candidates[best_candidate_name]
    candidate_metrics = best_candidate['metrics']

    print(f"\nTournament Winner: {best_candidate_name} (R²: {candidate_metrics['r2_score']}, RMSE: {candidate_metrics['rmse']})")

    # 5. Champion Promotion Logic
    print("\n[Step 5/5] Evaluating Champion Promotion Criteria...")
    current_champion = get_current_champion_metrics()
    timestamp_ver = datetime.now().strftime("%Y%m%d_%H%M%S")

    promoted = False
    if current_champion is None:
        print("No existing production champion found (Cold Start). Promoting tournament winner directly.")
        promoted = True
    else:
        curr_r2 = current_champion['r2_score']
        curr_rmse = current_champion['rmse']
        cand_r2 = candidate_metrics['r2_score']
        cand_rmse = candidate_metrics['rmse']

        print(f"Current Champion ({current_champion.get('champion_model_name')}): R²={curr_r2}, RMSE={curr_rmse}")
        print(f"Candidate ({best_candidate_name}): R²={cand_r2}, RMSE={cand_rmse}")

        if cand_r2 >= curr_r2 and cand_rmse <= curr_rmse:
            print("Promotion Criteria Met (candidate R² >= current R² AND candidate RMSE <= current RMSE). Promoting to Champion!")
            promoted = True
        else:
            print("Promotion Criteria NOT met. Retaining existing production champion to prevent regression.")

    if promoted:
        deploy_new_champion(
            model=best_candidate['model'],
            model_name=best_candidate_name,
            model_version=f"v_{timestamp_ver}",
            metrics=candidate_metrics,
            training_samples=samples,
            date_range_days=historical_days
        )
        # Log non-winning candidates
        for c_name, c_data in candidates.items():
            if c_name != best_candidate_name:
                log_candidate_evaluation(c_name, f"v_{timestamp_ver}", current_champion, c_data['metrics'], samples, historical_days, status='RUNNER_UP')
    else:
        # Log all candidates as rejected
        for c_name, c_data in candidates.items():
            log_candidate_evaluation(c_name, f"v_{timestamp_ver}", current_champion, c_data['metrics'], samples, historical_days, status='REJECTED_LOWER_PERFORMANCE')

    # 6. Train Auxiliary Models
    print("\nTraining auxiliary models: IsolationForest and Outbreak Predictor...")
    anomaly_engine = AnomalyDetectionEngine()
    anomaly_engine.fit_and_save(df, FEATURE_COLUMNS)

    outbreak_engine = OutbreakPredictionEngine()
    outbreak_engine.train_and_save()
    outbreak_engine.generate_and_store_predictions()

    print("\n" + "=" * 70)
    print("TRAINING PIPELINE COMPLETED SUCCESSFULLY.")
    print(f"Active Champion: {best_candidate_name if promoted else current_champion.get('champion_model_name')}")
    print("=" * 70)

    return {
        'status': 'SUCCESS',
        'promoted': promoted,
        'champion_model_name': best_candidate_name if promoted else current_champion.get('champion_model_name'),
        'champion_model_version': f"v_{timestamp_ver}" if promoted else current_champion.get('champion_model_version'),
        'metrics': candidate_metrics,
        'tournament_results': {name: c['metrics'] for name, c in candidates.items()}
    }

if __name__ == '__main__':
    run_training_pipeline()
