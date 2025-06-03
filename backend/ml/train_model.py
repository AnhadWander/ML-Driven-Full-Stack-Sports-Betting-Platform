import pandas as pd
import numpy as np
import os
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    roc_auc_score, confusion_matrix, classification_report
)
import joblib

DATA_PATH = 'data/processed/cleaned_games.csv'
MODEL_PATH = 'backend/ml/model.pkl'

def load_data():
    df = pd.read_csv(DATA_PATH)

    # Features to use
    X = df.drop(columns=['GAME_ID', 'GAME_DATE_HOME', 'TEAM_NAME_HOME', 'TEAM_NAME_AWAY', 'HOME_WIN'])
    y = df['HOME_WIN']

    return train_test_split(X, y, test_size=0.2, random_state=42)

def train_model():
    X_train, X_test, y_train, y_test = load_data()

    model = RandomForestClassifier(n_estimators=200, max_depth=12, random_state=42)
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    y_proba = model.predict_proba(X_test)[:, 1]

    # Save model
    os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
    joblib.dump(model, MODEL_PATH)
    print(f"Model saved to {MODEL_PATH}")

    # Evaluation metrics
    print("\n📊 Model Evaluation Metrics:")
    print(f"Accuracy: {accuracy_score(y_test, y_pred):.4f}")
    print(f"Precision: {precision_score(y_test, y_pred):.4f}")
    print(f"Recall: {recall_score(y_test, y_pred):.4f}")
    print(f"F1 Score: {f1_score(y_test, y_pred):.4f}")
    print(f"ROC AUC: {roc_auc_score(y_test, y_proba):.4f}")

    print("\n🧾 Confusion Matrix:")
    print(confusion_matrix(y_test, y_pred))

    print("\n📝 Classification Report:")
    print(classification_report(y_test, y_pred))

if __name__ == "__main__":
    train_model()
