import numpy as np

from api.src.drift import (
    add_to_window,
    calculate_psi,
    clear_window,
    combine_severity,
    get_window,
    ks_to_severity,
    psi_to_severity,
    set_window,
)
from api.src.schemas import DriftSeverity


class TestPSI:
    def test_identical_distributions_psi_near_zero(self):
        ref = np.random.normal(0, 1, 1000)
        curr = np.random.normal(0, 1, 1000)
        psi = calculate_psi(ref, curr)
        assert psi < 0.1, f"Identical dist PSI should be < 0.1, got {psi:.4f}"

    def test_shifted_distribution_high_psi(self):
        ref = np.random.normal(0, 1, 1000)
        curr = np.random.normal(5, 1, 1000)
        psi = calculate_psi(ref, curr)
        assert psi > 0.25, f"Severely shifted dist PSI should be > 0.25, got {psi:.4f}"

    def test_psi_is_non_negative(self):
        ref = np.random.normal(0, 1, 500)
        curr = np.random.normal(1, 1.5, 500)
        assert calculate_psi(ref, curr) >= 0

    def test_psi_with_different_bin_counts(self):
        ref = np.random.normal(0, 1, 500)
        curr = np.random.normal(0.2, 1.1, 500)
        psi_5 = calculate_psi(ref, curr, bins=5)
        psi_20 = calculate_psi(ref, curr, bins=20)
        assert psi_5 >= 0
        assert psi_20 >= 0

    def test_handles_single_valued_distribution(self):
        ref = np.array([1.0] * 100)
        curr = np.array([1.0] * 100)
        psi = calculate_psi(ref, curr)
        assert isinstance(psi, float)


class TestPSISeverity:
    def test_low_psi_is_none(self):
        assert psi_to_severity(0.02) == DriftSeverity.NONE

    def test_moderate_psi_is_low(self):
        assert psi_to_severity(0.08) == DriftSeverity.LOW

    def test_medium_psi_is_medium(self):
        assert psi_to_severity(0.15) == DriftSeverity.MEDIUM

    def test_high_psi_is_high(self):
        assert psi_to_severity(0.22) == DriftSeverity.HIGH

    def test_extreme_psi_is_critical(self):
        assert psi_to_severity(0.50) == DriftSeverity.CRITICAL

    def test_boundary_at_0_1_is_low(self):
        assert psi_to_severity(0.1) == DriftSeverity.LOW

    def test_boundary_at_0_25_is_critical(self):
        assert psi_to_severity(0.25) == DriftSeverity.CRITICAL


class TestKSSeverity:
    def test_high_p_value_is_none(self):
        assert ks_to_severity(0.5) == DriftSeverity.NONE

    def test_low_p_value_is_critical(self):
        assert ks_to_severity(0.0001) == DriftSeverity.CRITICAL

    def test_p_value_at_0_05_boundary(self):
        assert ks_to_severity(0.05) == DriftSeverity.MEDIUM


class TestCombineSeverity:
    def test_higher_severity_wins(self):
        assert combine_severity(DriftSeverity.HIGH, DriftSeverity.LOW) == DriftSeverity.HIGH
        assert combine_severity(DriftSeverity.NONE, DriftSeverity.CRITICAL) == DriftSeverity.CRITICAL

    def test_equal_severity_unchanged(self):
        assert combine_severity(DriftSeverity.MEDIUM, DriftSeverity.MEDIUM) == DriftSeverity.MEDIUM

    def test_none_and_low(self):
        assert combine_severity(DriftSeverity.NONE, DriftSeverity.LOW) == DriftSeverity.LOW


class TestMonitoringWindow:
    def setup_method(self):
        clear_window()

    def test_add_to_window(self):
        add_to_window({"LIMIT_BAL": 50000, "AGE": 30})
        assert len(get_window()) == 1

    def test_set_window_replaces_contents(self):
        add_to_window({"LIMIT_BAL": 50000})
        set_window([{"LIMIT_BAL": 100000}, {"LIMIT_BAL": 200000}])
        assert len(get_window()) == 2
        assert get_window()[0]["LIMIT_BAL"] == 100000

    def test_clear_window(self):
        add_to_window({"LIMIT_BAL": 50000})
        clear_window()
        assert len(get_window()) == 0

    def test_window_max_size_respected(self):
        set_window([{"LIMIT_BAL": i} for i in range(500)])
        for i in range(600):
            add_to_window({"LIMIT_BAL": i})
        assert len(get_window()) <= 1000
