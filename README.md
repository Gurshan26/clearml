# ClearML

See inside your model. Know when it breaks.

ClearML is a full stack ML dashboard for credit default prediction. The goal is simple:
do more than just train a model, and actually monitor it like it is in production.

## What this project does

ClearML handles the 3 things most model demos skip:

1. **Prediction explainability (SHAP)**  
   Every prediction comes with feature level contribution scores, so you can see what pushed risk up or down.

2. **Data drift monitoring (PSI + KS)**  
   Incoming data is compared against the training baseline to catch distribution shift early.

3. **Real alerts + history**  
   High and critical drift events are saved, shown in the dashboard, and can be resolved.

There is also a built in **drift simulator** so you can inject mild, moderate, severe, or extreme shift and instantly see the monitoring pipeline react.

## Why it matters

A model can look good at training time and still get worse in real use.  
This project shows the part that matters in industry: reliability after deployment.

It is built to demonstrate practical MLOps maturity:

- not just model training
- but explainability
- monitoring
- alerting
- and operational visibility

## How users use it

Think of it like an operations console for an ML model.

Typical user flow:

1. **Overview**  
   Check model metrics and drift trend.

2. **Explain**  
   Run a single prediction and inspect SHAP factors.

3. **Drift**  
   Monitor feature health and overall severity.

4. **Alerts**  
   Review high/critical alerts and resolve them.

5. **History**  
   Audit recent predictions and confidence values.

For demos, users hit **Simulate Drift** to trigger controlled failures and validate the full monitoring loop.

## Local setup

From the repo root:

```bash
# 1) Backend dependencies
python3 -m pip install -r api/requirements.txt

# 2) Generate dataset + train model artifacts
python3 api/src/generate_synthetic_data.py
python3 api/src/train.py

# 3) Run backend (terminal A)
cd api
python3 -m uvicorn main:app --reload --port 8000
```

In a second terminal:

```bash
cd client
npm install
npm run dev
```

Open:

- Frontend: `http://127.0.0.1:5173`
- Backend health: `http://127.0.0.1:8000/health`

## Quick API checks

```bash
curl http://127.0.0.1:8000/health
curl http://127.0.0.1:8000/api/model/metrics
curl http://127.0.0.1:8000/api/drift/status
curl http://127.0.0.1:8000/api/alerts
```

## Run tests

```bash
# Backend
python3 -m pytest

# Frontend
cd client
npm test
```

## Stack

- **Backend:** FastAPI, scikit-learn, SHAP, pandas, numpy, scipy
- **Frontend:** React (Vite), Recharts, CSS Modules
- **Persistence:** SQLite
- **Model:** RandomForestClassifier for default prediction
- **Monitoring:** PSI + KS test

## Dataset

The project uses the UCI Credit Card Default style schema at:

`api/data/credit_default.csv`

No runtime download is needed.  
If needed, synthetic data can be regenerated with:

```bash
python3 api/src/generate_synthetic_data.py
```

## Deploy

`render.yaml` is included for a free tier setup:

- Python web service for API
- Static site for React client

Push to GitHub, connect on Render, and deploy both services.
