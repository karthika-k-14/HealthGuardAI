import os
import joblib
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier
from sklearn.pipeline import Pipeline

DATASET_PATH = os.path.join(os.path.dirname(__file__), "../datasets/disease_dataset.csv")
MODEL_DIR = os.path.join(os.path.dirname(__file__), "../models")
MODEL_PATH = os.path.join(MODEL_DIR, "disease_model.pkl")


def train_disease_model():
    print("Training Disease Classification Model (Random Forest)...")
    os.makedirs(MODEL_DIR, exist_ok=True)
    df = pd.read_csv(DATASET_PATH)
    
    pipeline = Pipeline([
        ('tfidf', TfidfVectorizer(ngram_range=(1, 2), max_features=1500, lowercase=True)),
        ('clf', RandomForestClassifier(n_estimators=100, random_state=42))
    ])
    
    pipeline.fit(df['symptoms'], df['diseaseCategory'])
    joblib.dump(pipeline, MODEL_PATH)
    print(f"Disease model successfully saved to {MODEL_PATH}")


if __name__ == "__main__":
    train_disease_model()
