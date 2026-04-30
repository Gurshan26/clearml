"""
ClearML FastAPI Application.
Auto-trains the model on startup if artifacts don't exist.
"""

import uuid
from contextlib import asynccontextmanager

import pandas as pd
from fastapi import BackgroundTasks, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

try:
    from src.database import (
        get_alerts,
        get_drift_history,
        get_recent_predictions,
        init_db,
        resolve_alert,
        save_alert,
        save_drift_snapshot,
        save_prediction,
    )
    from src.drift import add_to_window, clear_window, get_window, run_drift_detection
    from src.explainer import explain_prediction, get_global_importance
    from src.schemas import DriftSeverity, DriftSimulationConfig, ModelMetrics, PredictionInput, PredictionResponse
    from src.simulator import SCENARIOS, simulate_drift
    from src.train import FEATURE_COLS, load_artifacts
except ModuleNotFoundError:
    from api.src.database import (
        get_alerts,
        get_drift_history,
        get_recent_predictions,
        init_db,
        resolve_alert,
        save_alert,
        save_drift_snapshot,
        save_prediction,
    )
    from api.src.drift import add_to_window, clear_window, get_window, run_drift_detection
    from api.src.explainer import explain_prediction, get_global_importance
    from api.src.schemas import DriftSeverity, DriftSimulationConfig, ModelMetrics, PredictionInput, PredictionResponse
    from api.src.simulator import SCENARIOS, simulate_drift
    from api.src.train import FEATURE_COLS, load_artifacts

clf = None
X_train = None
train_stats = None
metrics = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global clf, X_train, train_stats, metrics
    init_db()
    clf, X_train, train_stats, metrics = load_artifacts()
    print("ClearML ready.")
    yield


app = FastAPI(
    title="ClearML — Explainable Classifier + Model Monitor",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok", "model_loaded": clf is not None}


@app.get("/api/model/metrics", response_model=ModelMetrics)
def get_model_metrics():
    if metrics is None:
        raise HTTPException(503, "Model not loaded")
    return ModelMetrics(**metrics)


@app.get("/api/model/global-importance")
def get_global_shap_importance():
    importance = get_global_importance(clf, X_train)
    return {"feature_importances": importance}


@app.post("/api/predict", response_model=PredictionResponse)
def predict(input_data: PredictionInput, background_tasks: BackgroundTasks):
    if clf is None:
        raise HTTPException(503, "Model not loaded")

    input_dict = input_data.model_dump()
    row_df = pd.DataFrame([input_dict])[FEATURE_COLS]
    proba = clf.predict_proba(row_df)[0]
    pred = int(proba[1] >= 0.5)

    prob_default = float(proba[1])
    prob_no_default = float(proba[0])
    confidence = "high" if max(proba) >= 0.75 else "medium" if max(proba) >= 0.60 else "low"
    label = "Will Default" if pred == 1 else "Will Not Default"

    contributions, base_value = explain_prediction(clf, X_train, input_dict)
    positive_contribs = [c for c in contributions if c.direction == "positive"]
    negative_contribs = [c for c in contributions if c.direction == "negative"]
    top_factors_for = [c.feature for c in positive_contribs[:3]]
    top_factors_against = [c.feature for c in negative_contribs[:3]]

    prediction_id = str(uuid.uuid4())[:8]
    result = dict(
        prediction=pred,
        probability_default=prob_default,
        probability_no_default=prob_no_default,
        confidence=confidence,
        label=label,
        base_value=base_value,
        shap_contributions=contributions,
        top_factors_for=top_factors_for,
        top_factors_against=top_factors_against,
        prediction_id=prediction_id,
    )

    background_tasks.add_task(save_prediction, prediction_id, input_dict, result)
    background_tasks.add_task(add_to_window, input_dict)
    return PredictionResponse(**result)


@app.get("/api/drift/status")
def get_drift_status():
    report = run_drift_detection()

    if report.drift_score > 5:
        snapshot_id = str(uuid.uuid4())[:8]
        save_drift_snapshot(
            snapshot_id,
            report.model_dump_json(),
            report.drift_score,
            report.overall_severity.value,
        )

    if report.alert_triggered and report.alert_message:
        alert_id = str(uuid.uuid4())[:8]
        affected = [
            r.feature
            for r in report.feature_results
            if r.severity in (DriftSeverity.HIGH, DriftSeverity.CRITICAL)
        ]
        save_alert(
            alert_id,
            report.overall_severity.value,
            report.alert_message,
            affected,
            report.drift_score,
        )
    return report


@app.post("/api/drift/simulate")
def simulate(config: DriftSimulationConfig):
    result = simulate_drift(config.scenario)
    return {"success": True, **result}


@app.post("/api/drift/reset")
def reset_drift_window():
    clear_window()
    return {"success": True, "message": "Monitoring window cleared"}


@app.get("/api/drift/window-size")
def get_window_size():
    return {"size": len(get_window())}


@app.get("/api/drift/history")
def drift_history():
    return {"history": get_drift_history(30)}


@app.get("/api/predictions/recent")
def recent_predictions():
    return {"predictions": get_recent_predictions(20)}


@app.get("/api/alerts")
def get_all_alerts():
    return {"alerts": get_alerts(50)}


@app.patch("/api/alerts/{alert_id}/resolve")
def resolve_alert_endpoint(alert_id: str):
    resolve_alert(alert_id)
    return {"success": True}


@app.get("/api/scenarios")
def get_scenarios():
    return {
        "scenarios": [
            {
                "key": k,
                "description": v["description"],
                "n_features_affected": v["n_features_affected"],
            }
            for k, v in SCENARIOS.items()
        ]
    }
