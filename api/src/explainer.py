"""
SHAP explanation engine for ClearML.
Uses TreeExplainer (fast, exact for RandomForest).
"""

from typing import Dict, List, Tuple

import numpy as np
import pandas as pd
import shap

from .schemas import SHAPFeatureContribution
from .train import FEATURE_COLS

_explainer = None
_explainer_key = None


def get_explainer(clf, X_train):
    """Lazy-initialize SHAP TreeExplainer and rebuild when model object changes."""
    global _explainer, _explainer_key
    key = id(clf)
    if _explainer is None or _explainer_key != key:
        background_sample = shap.sample(X_train, 100, random_state=42)
        _explainer = shap.TreeExplainer(clf, background_sample)
        _explainer_key = key
    return _explainer


def explain_prediction(clf, X_train, input_data: dict) -> Tuple[List[SHAPFeatureContribution], float]:
    """Compute SHAP values for a single prediction."""
    explainer = get_explainer(clf, X_train)
    row = pd.DataFrame([{col: input_data[col] for col in FEATURE_COLS}])
    shap_values = explainer.shap_values(row)

    if isinstance(shap_values, list):
        sv = shap_values[1][0]
        base_val = explainer.expected_value[1]
    else:
        arr = np.asarray(shap_values)
        if arr.ndim == 3:
            sv = arr[0, :, 1]
            base_val = np.asarray(explainer.expected_value)[1]
        else:
            sv = arr[0]
            base_val = explainer.expected_value

    base_val = float(np.asarray(base_val).item())
    contributions: List[SHAPFeatureContribution] = []
    for i, col in enumerate(FEATURE_COLS):
        shap_val = float(sv[i])
        feat_val = float(row[col].iloc[0])
        direction = (
            "positive"
            if shap_val > 0.005
            else "negative"
            if shap_val < -0.005
            else "neutral"
        )
        contributions.append(
            SHAPFeatureContribution(
                feature=col,
                value=feat_val,
                shap_value=shap_val,
                direction=direction,
                abs_importance=abs(shap_val),
            )
        )

    contributions.sort(key=lambda x: x.abs_importance, reverse=True)
    return contributions, base_val


def get_global_importance(clf, X_train) -> Dict[str, float]:
    """Compute global mean absolute SHAP values across training samples."""
    explainer = get_explainer(clf, X_train)
    sample = shap.sample(X_train, 200, random_state=42)
    sv = explainer.shap_values(sample)

    if isinstance(sv, list):
        sv_positive = np.asarray(sv[1])
    else:
        arr = np.asarray(sv)
        sv_positive = arr[:, :, 1] if arr.ndim == 3 else arr

    mean_abs = np.abs(sv_positive).mean(axis=0)
    result = {col: float(v) for col, v in zip(FEATURE_COLS, mean_abs)}
    return dict(sorted(result.items(), key=lambda x: x[1], reverse=True))
