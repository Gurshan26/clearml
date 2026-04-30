import numpy as np

from api.src.explainer import explain_prediction, get_global_importance
from api.src.train import FEATURE_COLS


class TestExplainPrediction:
    def test_returns_correct_number_of_contributions(self, trained_clf):
        clf, X_train = trained_clf
        sample = {col: float(X_train[col].mean()) for col in FEATURE_COLS}
        contributions, base_value = explain_prediction(clf, X_train, sample)
        assert len(contributions) == len(FEATURE_COLS)

    def test_all_contributions_have_required_fields(self, trained_clf):
        clf, X_train = trained_clf
        sample = {col: float(X_train[col].mean()) for col in FEATURE_COLS}
        contributions, _ = explain_prediction(clf, X_train, sample)
        for c in contributions:
            assert hasattr(c, "feature")
            assert hasattr(c, "shap_value")
            assert hasattr(c, "direction")
            assert hasattr(c, "abs_importance")
            assert c.direction in ("positive", "negative", "neutral")

    def test_sorted_by_abs_importance_descending(self, trained_clf):
        clf, X_train = trained_clf
        sample = {col: float(X_train[col].mean()) for col in FEATURE_COLS}
        contributions, _ = explain_prediction(clf, X_train, sample)
        importances = [c.abs_importance for c in contributions]
        assert importances == sorted(importances, reverse=True)

    def test_base_value_is_float(self, trained_clf):
        clf, X_train = trained_clf
        sample = {col: float(X_train[col].mean()) for col in FEATURE_COLS}
        _, base_value = explain_prediction(clf, X_train, sample)
        assert isinstance(base_value, float)

    def test_shap_values_are_finite(self, trained_clf):
        clf, X_train = trained_clf
        sample = {col: float(X_train[col].mean()) for col in FEATURE_COLS}
        contributions, _ = explain_prediction(clf, X_train, sample)
        for c in contributions:
            assert np.isfinite(c.shap_value), f"SHAP value for {c.feature} is not finite"

    def test_direction_matches_shap_sign(self, trained_clf):
        clf, X_train = trained_clf
        sample = {col: float(X_train[col].mean()) for col in FEATURE_COLS}
        contributions, _ = explain_prediction(clf, X_train, sample)
        for c in contributions:
            if c.shap_value > 0.005:
                assert c.direction == "positive"
            elif c.shap_value < -0.005:
                assert c.direction == "negative"


class TestGlobalImportance:
    def test_returns_dict_of_all_features(self, trained_clf):
        clf, X_train = trained_clf
        importance = get_global_importance(clf, X_train)
        assert len(importance) == len(FEATURE_COLS)
        for col in FEATURE_COLS:
            assert col in importance

    def test_all_importances_non_negative(self, trained_clf):
        clf, X_train = trained_clf
        importance = get_global_importance(clf, X_train)
        for feat, val in importance.items():
            assert val >= 0, f"Importance for {feat} is negative: {val}"

    def test_returns_sorted_descending(self, trained_clf):
        clf, X_train = trained_clf
        importance = get_global_importance(clf, X_train)
        values = list(importance.values())
        assert values == sorted(values, reverse=True)
