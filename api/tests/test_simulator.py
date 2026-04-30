import pytest

from api.src.drift import clear_window, get_window
from api.src.simulator import SCENARIOS, simulate_drift
from api.src.train import FEATURE_COLS


class TestSimulator:
    def setup_method(self):
        clear_window()

    def test_all_scenarios_produce_data(self):
        for scenario in SCENARIOS.keys():
            clear_window()
            result = simulate_drift(scenario, n_samples=50)
            window = get_window()
            assert len(window) == 50, f"Scenario {scenario} should produce 50 samples"
            assert result["scenario"] == scenario

    def test_invalid_scenario_raises(self):
        with pytest.raises(ValueError):
            simulate_drift("nonexistent_scenario")

    def test_result_contains_expected_keys(self):
        result = simulate_drift("mild", n_samples=20)
        assert "scenario" in result
        assert "features_affected" in result
        assert "samples_injected" in result
        assert result["samples_injected"] == 20

    def test_extreme_affects_all_features(self):
        result = simulate_drift("extreme", n_samples=20)
        assert result["n_features_affected"] == len(FEATURE_COLS)

    def test_mild_affects_fewer_features_than_severe(self):
        mild = SCENARIOS["mild"]["n_features_affected"]
        severe = SCENARIOS["severe"]["n_features_affected"]
        assert mild < severe

    def test_simulated_data_has_all_feature_columns(self):
        simulate_drift("moderate", n_samples=30)
        window = get_window()
        assert len(window) > 0
        for col in FEATURE_COLS:
            assert col in window[0], f"Missing feature {col} in simulated data"

    def test_all_values_are_numeric(self):
        simulate_drift("moderate", n_samples=10)
        window = get_window()
        for row in window:
            for col in FEATURE_COLS:
                assert isinstance(row[col], (int, float)), f"Value for {col} is not numeric: {type(row[col])}"
