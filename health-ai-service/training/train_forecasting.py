import os
import joblib
import pandas as pd
from sklearn.linear_model import LinearRegression

DATASET_PATH = os.path.join(os.path.dirname(__file__), "../datasets/medicine_demand_dataset.csv")
MODEL_DIR = os.path.join(os.path.dirname(__file__), "../models")
MODEL_PATH = os.path.join(MODEL_DIR, "forecasting_model.pkl")


def train_forecasting_model():
    print("Training Demand Forecasting Model (Linear Regression)...")
    os.makedirs(MODEL_DIR, exist_ok=True)
    df = pd.read_csv(DATASET_PATH)
    
    X = df[['month_offset', 'historical_usage', 'district_outbreak_risk']]
    y = df['predicted_demand']
    
    reg = LinearRegression()
    reg.fit(X, y)
    
    joblib.dump(reg, MODEL_PATH)
    print(f"Forecasting model successfully saved to {MODEL_PATH}")


if __name__ == "__main__":
    train_forecasting_model()
