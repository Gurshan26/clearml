"""
Drift simulation engine for ClearML.
"""

import json
import os
from typing import Dict

import numpy as np

from .drift import set_window
from .train import FEATURE_COLS, MODELS_DIR

SCENARIOS = {
    "mild": {
        "description": "Slight distributional shifts — typical month-over-month variation",
        "mean_shift": 0.1,
        "std_multiplier": 1.05,
        "n_features_affected": 4,
    },
    "moderate": {
        "description": "Noticeable shifts in key features — customer segment change",
        "mean_shift": 0.30,
        "std_multiplier": 1.25,
        "n_features_affected": 8,
    },
    "severe": {
        "description": "Severe distributional shift — economic shock or major policy change",
        "mean_shift": 0.60,
        "std_multiplier": 1.60,
        "n_features_affected": 15,
    },
    "extreme": {
        "description": "Catastrophic drift — complete distribution inversion and feature corruption",
        "mean_shift": 1.50,
        "std_multiplier": 2.5,
        "n_features_affected": len(FEATURE_COLS),
    },
}


def simulate_drift(scenario: str = "moderate", n_samples: int = 500) -> Dict:
    if scenario not in SCENARIOS:
        raise ValueError(f"Unknown scenario: {scenario}. Choose from: {list(SCENARIOS.keys())}")

    stats_path = os.path.join(MODELS_DIR, "train_stats.json")
    with open(stats_path, encoding="utf-8") as f:
        train_stats = json.load(f)

    config = SCENARIOS[scenario]
    np.random.seed(None)

    n_affected = config["n_features_affected"]
    affected_features = (
        FEATURE_COLS
        if scenario == "extreme"
        else np.random.choice(FEATURE_COLS, n_affected, replace=False).tolist()
    )

    rows = []
    for _ in range(n_samples):
        row = {}
        for col in FEATURE_COLS:
            stats = train_stats[col]
            ref_mean = stats["mean"]
            ref_std = stats["std"]

            if col in affected_features:
                direction = np.random.choice([-1, 1])
                new_mean = ref_mean * (1 + direction * config["mean_shift"])
                new_std = ref_std * config["std_multiplier"]
                value = np.random.normal(new_mean, max(new_std, 0.1))
            else:
                value = np.random.normal(ref_mean, max(ref_std, 0.1))

            if col in ("SEX", "EDUCATION", "MARRIAGE"):
                value = int(np.clip(round(value), stats["min"], stats["max"]))
            elif col in ("PAY_0", "PAY_2", "PAY_3", "PAY_4", "PAY_5", "PAY_6"):
                value = int(np.clip(round(value), -2, 8))
            else:
                value = max(0.0, float(value))

            row[col] = value
        rows.append(row)

    set_window(rows)
    return {
        "scenario": scenario,
        "description": config["description"],
        "samples_injected": n_samples,
        "features_affected": affected_features,
        "n_features_affected": len(affected_features),
    }
