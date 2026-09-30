import os
import joblib
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier
from sklearn.pipeline import Pipeline

DATASET_PATH = os.path.join(os.path.dirname(__file__), "../datasets/urgency_dataset.csv")
MODEL_DIR = os.path.join(os.path.dirname(__file__), "../models")
MODEL_PATH = os.path.join(MODEL_DIR, "urgency_model.pkl")


def train_urgency_model():
    print("Training Urgency Scoring Model (Random Forest Classifier)...")
    os.makedirs(MODEL_DIR, exist_ok=True)
    df = pd.read_csv(DATASET_PATH)
    
    pipeline = Pipeline([
        ('tfidf', TfidfVectorizer(ngram_range=(1, 2), max_features=1000, lowercase=True)),
        ('clf', RandomForestClassifier(n_estimators=100, random_state=42))
    ])
    
    pipeline.fit(df['symptoms'], df['urgency'])
    joblib.dump(pipeline, MODEL_PATH)
    print(f"Urgency model successfully saved to {MODEL_PATH}")


if __name__ == "__main__":
    train_urgency_model()
