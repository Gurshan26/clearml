import pytest

from api.src.train import FEATURE_COLS, load_data


class TestDataLoading:
    def test_data_loads_with_correct_columns(self):
        try:
            df = load_data()
            for col in FEATURE_COLS:
                assert col in df.columns, f"Missing column: {col}"
        except FileNotFoundError:
            pytest.skip("Dataset not available in test environment")

    def test_no_nulls_in_features_after_load(self):
        try:
            df = load_data()
            assert df[FEATURE_COLS].isnull().sum().sum() == 0
        except FileNotFoundError:
            pytest.skip("Dataset not available")

    def test_target_is_binary(self):
        try:
            df = load_data()
            target_values = df["default.payment.next.month"].unique()
            assert set(target_values).issubset({0, 1}), f"Target has non-binary values: {target_values}"
        except FileNotFoundError:
            pytest.skip("Dataset not available")
