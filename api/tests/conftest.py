import numpy as np
import pandas as pd
import pytest
from sklearn.ensemble import RandomForestClassifier


@pytest.fixture(scope="session")
def small_dataset():
    np.random.seed(42)
    n = 500
    X = pd.DataFrame(
        {
            "LIMIT_BAL": np.random.normal(100000, 50000, n),
            "SEX": np.random.choice([1, 2], n),
            "EDUCATION": np.random.choice([1, 2, 3, 4], n),
            "MARRIAGE": np.random.choice([0, 1, 2, 3], n),
            "AGE": np.random.randint(21, 75, n),
            "PAY_0": np.random.choice(range(-2, 9), n),
            "PAY_2": np.random.choice(range(-2, 9), n),
            "PAY_3": np.random.choice(range(-2, 9), n),
            "PAY_4": np.random.choice(range(-2, 9), n),
            "PAY_5": np.random.choice(range(-2, 9), n),
            "PAY_6": np.random.choice(range(-2, 9), n),
            "BILL_AMT1": np.random.exponential(50000, n),
            "BILL_AMT2": np.random.exponential(50000, n),
            "BILL_AMT3": np.random.exponential(50000, n),
            "BILL_AMT4": np.random.exponential(50000, n),
            "BILL_AMT5": np.random.exponential(50000, n),
            "BILL_AMT6": np.random.exponential(50000, n),
            "PAY_AMT1": np.random.exponential(8000, n),
            "PAY_AMT2": np.random.exponential(8000, n),
            "PAY_AMT3": np.random.exponential(8000, n),
            "PAY_AMT4": np.random.exponential(8000, n),
            "PAY_AMT5": np.random.exponential(8000, n),
            "PAY_AMT6": np.random.exponential(8000, n),
        }
    )
    y = np.random.binomial(1, 0.22, n)
    return X, y


@pytest.fixture(scope="session")
def trained_clf(small_dataset):
    X, y = small_dataset
    clf = RandomForestClassifier(n_estimators=10, max_depth=4, random_state=42)
    clf.fit(X, y)
    return clf, X
