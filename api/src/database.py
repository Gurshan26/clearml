"""
SQLite persistence layer for ClearML.
Stores prediction history and alert records.
"""

import json
import os
import sqlite3
from datetime import datetime

from .train import MODELS_DIR

DB_PATH = os.path.join(MODELS_DIR, "clearml.db")


def get_conn():
    os.makedirs(MODELS_DIR, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_conn()
    conn.executescript(
        """
        CREATE TABLE IF NOT EXISTS predictions (
            id          TEXT PRIMARY KEY,
            timestamp   TEXT NOT NULL,
            input_json  TEXT NOT NULL,
            prediction  INTEGER NOT NULL,
            probability REAL NOT NULL,
            confidence  TEXT NOT NULL,
            shap_json   TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS alerts (
            id              TEXT PRIMARY KEY,
            timestamp       TEXT NOT NULL,
            severity        TEXT NOT NULL,
            message         TEXT NOT NULL,
            features_json   TEXT NOT NULL,
            drift_score     REAL NOT NULL,
            resolved        INTEGER DEFAULT 0
        );

        CREATE TABLE IF NOT EXISTS drift_snapshots (
            id          TEXT PRIMARY KEY,
            timestamp   TEXT NOT NULL,
            report_json TEXT NOT NULL,
            drift_score REAL NOT NULL,
            severity    TEXT NOT NULL
        );
    """
    )
    conn.commit()
    conn.close()


def save_prediction(prediction_id: str, input_data: dict, result: dict):
    conn = get_conn()
    conn.execute(
        """
        INSERT OR REPLACE INTO predictions (id, timestamp, input_json, prediction, probability, confidence, shap_json)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """,
        (
            prediction_id,
            datetime.utcnow().isoformat(),
            json.dumps(input_data),
            result["prediction"],
            result["probability_default"],
            result["confidence"],
            json.dumps([c.model_dump() for c in result["shap_contributions"]]),
        ),
    )
    conn.commit()
    conn.close()


def save_alert(alert_id: str, severity: str, message: str, features: list, drift_score: float):
    conn = get_conn()
    conn.execute(
        """
        INSERT INTO alerts (id, timestamp, severity, message, features_json, drift_score)
        VALUES (?, ?, ?, ?, ?, ?)
    """,
        (alert_id, datetime.utcnow().isoformat(), severity, message, json.dumps(features), drift_score),
    )
    conn.commit()
    conn.close()


def get_recent_predictions(limit: int = 20) -> list:
    conn = get_conn()
    rows = conn.execute(
        "SELECT * FROM predictions ORDER BY timestamp DESC LIMIT ?",
        (limit,),
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]


def get_alerts(limit: int = 50) -> list:
    conn = get_conn()
    rows = conn.execute(
        "SELECT * FROM alerts ORDER BY timestamp DESC LIMIT ?",
        (limit,),
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]


def resolve_alert(alert_id: str):
    conn = get_conn()
    conn.execute("UPDATE alerts SET resolved = 1 WHERE id = ?", (alert_id,))
    conn.commit()
    conn.close()


def save_drift_snapshot(snapshot_id: str, report_json: str, drift_score: float, severity: str):
    conn = get_conn()
    conn.execute(
        """
        INSERT INTO drift_snapshots (id, timestamp, report_json, drift_score, severity)
        VALUES (?, ?, ?, ?, ?)
    """,
        (snapshot_id, datetime.utcnow().isoformat(), report_json, drift_score, severity),
    )
    conn.commit()
    conn.close()


def get_drift_history(limit: int = 30) -> list:
    conn = get_conn()
    rows = conn.execute(
        "SELECT id, timestamp, drift_score, severity FROM drift_snapshots ORDER BY timestamp DESC LIMIT ?",
        (limit,),
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]
