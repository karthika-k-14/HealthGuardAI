import os
import joblib
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline

DATASET_PATH = os.path.join(os.path.dirname(__file__), "../datasets/intent_dataset.csv")
MODEL_DIR = os.path.join(os.path.dirname(__file__), "../models")
MODEL_PATH = os.path.join(MODEL_DIR, "intent_model.pkl")


def train_intent_model():
    print("Training Intent Detection Model (TF-IDF + Logistic Regression)...")
    os.makedirs(MODEL_DIR, exist_ok=True)
    df = pd.read_csv(DATASET_PATH)
    
    pipeline = Pipeline([
        ('tfidf', TfidfVectorizer(ngram_range=(1, 2), max_features=1000, lowercase=True)),
        ('clf', LogisticRegression(C=1.0, max_iter=500, class_weight='balanced'))
    ])
    
    pipeline.fit(df['text'], df['intent'])
    joblib.dump(pipeline, MODEL_PATH)
    print(f"Intent model successfully saved to {MODEL_PATH}")


if __name__ == "__main__":
    train_intent_model()
