"""
Drift detection engine for ClearML.
Uses PSI + KS test.
"""

import json
import os
from typing import List

import numpy as np
from scipy import stats

from .schemas import DriftFeatureResult, DriftReport, DriftSeverity
from .train import FEATURE_COLS, MODELS_DIR


def calculate_psi(reference: np.ndarray, current: np.ndarray, bins: int = 10) -> float:
    """Calculate PSI score comparing two distributions."""
    reference = np.asarray(reference, dtype=float)
    current = np.asarray(current, dtype=float)
    if reference.size == 0 or current.size == 0:
        return 0.0

    epsilon = 1e-6
    _, bin_edges = np.histogram(reference, bins=bins)
    bin_edges[0] = -np.inf
    bin_edges[-1] = np.inf

    ref_counts, _ = np.histogram(reference, bins=bin_edges)
    cur_counts, _ = np.histogram(current, bins=bin_edges)

    ref_pct = ref_counts / max(len(reference), 1) + epsilon
    cur_pct = cur_counts / max(len(current), 1) + epsilon
    ref_pct = ref_pct / ref_pct.sum()
    cur_pct = cur_pct / cur_pct.sum()

    psi = np.sum((cur_pct - ref_pct) * np.log(cur_pct / ref_pct))
    return float(max(0.0, psi))


def psi_to_severity(psi: float) -> DriftSeverity:
    if psi < 0.05:
        return DriftSeverity.NONE
    if psi <= 0.1:
        return DriftSeverity.LOW
    if psi < 0.2:
        return DriftSeverity.MEDIUM
    if psi < 0.25:
        return DriftSeverity.HIGH
    return DriftSeverity.CRITICAL


def ks_to_severity(p_value: float) -> DriftSeverity:
    if p_value > 0.1:
        return DriftSeverity.NONE
    if p_value > 0.05:
        return DriftSeverity.LOW
    if p_value > 0.01:
        return DriftSeverity.MEDIUM
    if p_value > 0.001:
        return DriftSeverity.HIGH
    return DriftSeverity.CRITICAL


SEVERITY_ORDER = {
    DriftSeverity.NONE: 0,
    DriftSeverity.LOW: 1,
    DriftSeverity.MEDIUM: 2,
    DriftSeverity.HIGH: 3,
    DriftSeverity.CRITICAL: 4,
}


def combine_severity(s1: DriftSeverity, s2: DriftSeverity) -> DriftSeverity:
    return s1 if SEVERITY_ORDER[s1] >= SEVERITY_ORDER[s2] else s2


_current_window: List[dict] = []
_max_window_size = 1000


def add_to_window(row: dict):
    global _current_window
    _current_window.append(row)
    if len(_current_window) > _max_window_size:
        _current_window = _current_window[-_max_window_size:]


def get_window() -> List[dict]:
    return _current_window.copy()


def clear_window():
    global _current_window
    _current_window = []


def set_window(rows: List[dict]):
    global _current_window
    _current_window = rows[:_max_window_size]


def run_drift_detection(min_samples: int = 50) -> DriftReport:
    from datetime import datetime
    import pandas as pd

    window = get_window()
    if len(window) < min_samples:
        return DriftReport(
            timestamp=datetime.utcnow().isoformat(),
            overall_severity=DriftSeverity.NONE,
            features_drifted=0,
            total_features=len(FEATURE_COLS),
            drift_score=0.0,
            feature_results=[],
            alert_triggered=False,
            alert_message=f"Insufficient samples ({len(window)} / {min_samples} required)",
        )

    stats_path = os.path.join(MODELS_DIR, "train_stats.json")
    with open(stats_path, encoding="utf-8") as f:
        train_stats = json.load(f)

    current_df = pd.DataFrame(window)
    current_df = current_df.reindex(columns=FEATURE_COLS)

    feature_results = []
    overall_severity = DriftSeverity.NONE

    for col in FEATURE_COLS:
        ref_values = np.array(train_stats[col]["values"])
        curr_values = current_df[col].dropna().values
        if len(curr_values) < 10:
            continue

        ks_stat, ks_p = stats.ks_2samp(ref_values, curr_values)
        ks_severity = ks_to_severity(float(ks_p))

        psi = calculate_psi(ref_values, curr_values)
        psi_severity = psi_to_severity(psi)

        feature_severity = combine_severity(ks_severity, psi_severity)
        overall_severity = combine_severity(overall_severity, feature_severity)

        ref_mean = float(train_stats[col]["mean"])
        curr_mean = float(np.mean(curr_values))
        shift_pct = ((curr_mean - ref_mean) / (abs(ref_mean) + 1e-6)) * 100

        feature_results.append(
            DriftFeatureResult(
                feature=col,
                ks_statistic=float(ks_stat),
                ks_p_value=float(ks_p),
                psi=float(psi),
                severity=feature_severity,
                reference_mean=ref_mean,
                current_mean=curr_mean,
                mean_shift_pct=float(shift_pct),
            )
        )

    feature_results.sort(key=lambda x: (SEVERITY_ORDER[x.severity], x.psi), reverse=True)
    drifted = sum(1 for r in feature_results if r.severity != DriftSeverity.NONE)
    severity_scores = [SEVERITY_ORDER[r.severity] * 25 for r in feature_results]
    drift_score = min(100.0, float(np.mean(severity_scores)) if severity_scores else 0.0)

    alert_triggered = overall_severity in (DriftSeverity.HIGH, DriftSeverity.CRITICAL)
    alert_message = None
    if alert_triggered:
        affected = [
            r.feature
            for r in feature_results
            if r.severity in (DriftSeverity.HIGH, DriftSeverity.CRITICAL)
        ]
        alert_message = (
            f"{'CRITICAL' if overall_severity == DriftSeverity.CRITICAL else 'HIGH'} drift "
            f"detected in {len(affected)} feature(s): {', '.join(affected[:3])}"
            + ("..." if len(affected) > 3 else "")
        )

    return DriftReport(
        timestamp=datetime.utcnow().isoformat(),
        overall_severity=overall_severity,
        features_drifted=drifted,
        total_features=len(feature_results),
        drift_score=drift_score,
        feature_results=feature_results,
        alert_triggered=alert_triggered,
        alert_message=alert_message,
    )
