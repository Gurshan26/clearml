"""Generate a synthetic UCI-style credit default dataset."""

import os

import numpy as np
import pandas as pd


def main():
    np.random.seed(42)
    n = 25000

    data = {
        "ID": range(1, n + 1),
        "LIMIT_BAL": np.random.choice(
            [10000, 20000, 30000, 50000, 80000, 100000, 150000, 200000, 300000],
            n,
        ),
        "SEX": np.random.choice([1, 2], n),
        "EDUCATION": np.random.choice([1, 2, 3, 4], n, p=[0.35, 0.47, 0.16, 0.02]),
        "MARRIAGE": np.random.choice([0, 1, 2, 3], n, p=[0.03, 0.45, 0.47, 0.05]),
        "AGE": np.random.randint(21, 75, n),
        "PAY_0": np.random.choice(
            [-2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8],
            n,
            p=[0.05, 0.15, 0.35, 0.2, 0.1, 0.06, 0.04, 0.02, 0.01, 0.01, 0.01],
        ),
        "PAY_2": np.random.choice(
            [-2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8],
            n,
            p=[0.05, 0.15, 0.37, 0.18, 0.1, 0.06, 0.04, 0.02, 0.01, 0.01, 0.01],
        ),
        "PAY_3": np.random.choice(
            [-2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8],
            n,
            p=[0.05, 0.15, 0.38, 0.17, 0.1, 0.06, 0.04, 0.02, 0.01, 0.01, 0.01],
        ),
        "PAY_4": np.random.choice(
            [-2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8],
            n,
            p=[0.05, 0.15, 0.39, 0.16, 0.1, 0.06, 0.04, 0.02, 0.01, 0.01, 0.01],
        ),
        "PAY_5": np.random.choice(
            [-2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8],
            n,
            p=[0.05, 0.15, 0.4, 0.15, 0.1, 0.06, 0.04, 0.02, 0.01, 0.01, 0.01],
        ),
        "PAY_6": np.random.choice(
            [-2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8],
            n,
            p=[0.05, 0.15, 0.41, 0.14, 0.1, 0.06, 0.04, 0.02, 0.01, 0.01, 0.01],
        ),
    }

    for i in range(1, 7):
        data[f"BILL_AMT{i}"] = np.random.exponential(scale=50000, size=n).astype(int)
        data[f"PAY_AMT{i}"] = np.random.exponential(scale=8000, size=n).astype(int)

    pay_late = (np.array(data["PAY_0"]) >= 2).astype(int) * 0.4
    high_limit = (np.array(data["LIMIT_BAL"]) < 30000).astype(int) * 0.2
    base_rate = 0.22
    prob_default = np.clip(base_rate + pay_late + high_limit, 0, 0.85)
    data["default.payment.next.month"] = np.random.binomial(1, prob_default)

    df = pd.DataFrame(data)

    data_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data"))
    os.makedirs(data_dir, exist_ok=True)
    output_path = os.path.join(data_dir, "credit_default.csv")
    df.to_csv(output_path, index=False)
    print(f"Generated {n} rows at {output_path}. Default rate: {df['default.payment.next.month'].mean():.1%}")


if __name__ == "__main__":
    main()
