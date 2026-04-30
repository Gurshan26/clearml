"""
Model training pipeline for ClearML.
Trains a RandomForestClassifier on credit default data,
saves the model + training statistics for drift reference.
"""

import json
import os
from datetime import datetime
from typing import Dict, Sequence

import joblib
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, f1_score, precision_score, recall_score, roc_auc_score
from sklearn.model_selection import train_test_split

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
MODELS_DIR = os.path.join(BASE_DIR, "models")
DATA_PATH = os.path.join(BASE_DIR, "data", "credit_default.csv")

FEATURE_COLS = [
    "LIMIT_BAL",
    "SEX",
    "EDUCATION",
    "MARRIAGE",
    "AGE",
    "PAY_0",
    "PAY_2",
    "PAY_3",
    "PAY_4",
    "PAY_5",
    "PAY_6",
    "BILL_AMT1",
    "BILL_AMT2",
    "BILL_AMT3",
    "BILL_AMT4",
    "BILL_AMT5",
    "BILL_AMT6",
    "PAY_AMT1",
    "PAY_AMT2",
    "PAY_AMT3",
    "PAY_AMT4",
    "PAY_AMT5",
    "PAY_AMT6",
]
TARGET_COL = "default.payment.next.month"


def calculate_metrics_stub(y_true: Sequence[int], y_pred: Sequence[int]) -> Dict[str, float]:
    """Small helper kept for test imports."""
    return {
        "accuracy": float(accuracy_score(y_true, y_pred)),
        "precision": float(precision_score(y_true, y_pred, zero_division=0)),
        "recall": float(recall_score(y_true, y_pred, zero_division=0)),
        "f1": float(f1_score(y_true, y_pred, zero_division=0)),
    }


def load_data() -> pd.DataFrame:
    """Load and validate the dataset."""
    if not os.path.exists(DATA_PATH):
        raise FileNotFoundError(
            f"Dataset not found at {DATA_PATH}. "
            "Run: python api/src/generate_synthetic_data.py"
        )
    df = pd.read_csv(DATA_PATH)
    if "default payment next month" in df.columns:
        df = df.rename(columns={"default payment next month": TARGET_COL})
    df = df.dropna(subset=FEATURE_COLS + [TARGET_COL])
    df = df[FEATURE_COLS + [TARGET_COL]].copy()
    return df


def train_model() -> dict:
    """Train the classifier and save artifacts."""
    os.makedirs(MODELS_DIR, exist_ok=True)

    df = load_data()
    X = df[FEATURE_COLS]
    y = df[TARGET_COL]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    clf = RandomForestClassifier(
        n_estimators=100,
        max_depth=8,
        min_samples_leaf=20,
        class_weight="balanced",
        random_state=42,
        n_jobs=-1,
    )
    clf.fit(X_train, y_train)

    y_pred = clf.predict(X_test)
    y_proba = clf.predict_proba(X_test)[:, 1]

    metrics = {
        "accuracy": float(accuracy_score(y_test, y_pred)),
        "precision": float(precision_score(y_test, y_pred, zero_division=0)),
        "recall": float(recall_score(y_test, y_pred, zero_division=0)),
        "f1": float(f1_score(y_test, y_pred, zero_division=0)),
        "auc_roc": float(roc_auc_score(y_test, y_proba)),
        "total_training_samples": int(len(X_train)),
        "test_samples": int(len(X_test)),
        "default_rate": float(y.mean()),
        "feature_importances": {
            col: float(imp)
            for col, imp in zip(FEATURE_COLS, clf.feature_importances_)
        },
        "training_timestamp": datetime.utcnow().isoformat(),
    }

    joblib.dump(clf, os.path.join(MODELS_DIR, "classifier.pkl"))
    joblib.dump(X_train, os.path.join(MODELS_DIR, "X_train.pkl"))

    train_stats = {}
    for col in FEATURE_COLS:
        col_data = X_train[col].dropna()
        train_stats[col] = {
            "mean": float(col_data.mean()),
            "std": float(col_data.std()),
            "min": float(col_data.min()),
            "max": float(col_data.max()),
            "p25": float(col_data.quantile(0.25)),
            "median": float(col_data.median()),
            "p75": float(col_data.quantile(0.75)),
            "values": col_data.tolist()[:5000],
        }

    with open(os.path.join(MODELS_DIR, "train_stats.json"), "w", encoding="utf-8") as f:
        json.dump(train_stats, f)
    with open(os.path.join(MODELS_DIR, "metrics.json"), "w", encoding="utf-8") as f:
        json.dump(metrics, f)

    print(f"Model trained. AUC-ROC: {metrics['auc_roc']:.3f}, F1: {metrics['f1']:.3f}")
    return metrics


def load_artifacts():
    """Load trained model and training stats. Train if not found."""
    clf_path = os.path.join(MODELS_DIR, "classifier.pkl")
    x_train_path = os.path.join(MODELS_DIR, "X_train.pkl")
    stats_path = os.path.join(MODELS_DIR, "train_stats.json")
    metrics_path = os.path.join(MODELS_DIR, "metrics.json")

    if not all(os.path.exists(p) for p in [clf_path, x_train_path, stats_path, metrics_path]):
        print("Model artifacts not found. Training now...")
        train_model()

    clf = joblib.load(clf_path)
    X_train = joblib.load(x_train_path)
    with open(stats_path, encoding="utf-8") as f:
        train_stats = json.load(f)
    with open(metrics_path, encoding="utf-8") as f:
        metrics = json.load(f)
    return clf, X_train, train_stats, metrics


if __name__ == "__main__":
    train_model()
