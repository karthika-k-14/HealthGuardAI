import os
import joblib
import pandas as pd
from sklearn.tree import DecisionTreeClassifier

DATASET_PATH = os.path.join(os.path.dirname(__file__), "../datasets/expiry_dataset.csv")
MODEL_DIR = os.path.join(os.path.dirname(__file__), "../models")
MODEL_PATH = os.path.join(MODEL_DIR, "expiry_model.pkl")


def train_expiry_model():
    print("Training Expiry Risk Model (Decision Tree)...")
    os.makedirs(MODEL_DIR, exist_ok=True)
    df = pd.read_csv(DATASET_PATH)
    
    X = df[['days_to_expiry', 'current_stock', 'monthly_consumption_rate']]
    y = df['risk_level']
    
    clf = DecisionTreeClassifier(max_depth=5, random_state=42)
    clf.fit(X, y)
    
    joblib.dump(clf, MODEL_PATH)
    print(f"Expiry model successfully saved to {MODEL_PATH}")


if __name__ == "__main__":
    train_expiry_model()
