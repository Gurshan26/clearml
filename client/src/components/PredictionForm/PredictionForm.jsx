import { useState } from "react";
import { api } from "../../utils/api";
import styles from "./PredictionForm.module.css";

const DEFAULTS = {
  LIMIT_BAL: 100000,
  SEX: 2,
  EDUCATION: 2,
  MARRIAGE: 1,
  AGE: 32,
  PAY_0: 0,
  PAY_2: 0,
  PAY_3: 0,
  PAY_4: 0,
  PAY_5: 0,
  PAY_6: 0,
  BILL_AMT1: 30000,
  BILL_AMT2: 28000,
  BILL_AMT3: 26000,
  BILL_AMT4: 24000,
  BILL_AMT5: 22000,
  BILL_AMT6: 20000,
  PAY_AMT1: 5000,
  PAY_AMT2: 5000,
  PAY_AMT3: 5000,
  PAY_AMT4: 5000,
  PAY_AMT5: 5000,
  PAY_AMT6: 5000,
};

const HIGH_RISK = {
  LIMIT_BAL: 20000,
  SEX: 1,
  EDUCATION: 3,
  MARRIAGE: 0,
  AGE: 45,
  PAY_0: 3,
  PAY_2: 2,
  PAY_3: 2,
  PAY_4: 1,
  PAY_5: 0,
  PAY_6: 0,
  BILL_AMT1: 18000,
  BILL_AMT2: 17500,
  BILL_AMT3: 17000,
  BILL_AMT4: 16500,
  BILL_AMT5: 16000,
  BILL_AMT6: 15500,
  PAY_AMT1: 200,
  PAY_AMT2: 300,
  PAY_AMT3: 0,
  PAY_AMT4: 0,
  PAY_AMT5: 100,
  PAY_AMT6: 200,
};

const PROFILE = [
  { key: "LIMIT_BAL", label: "Credit Limit (NT$)", type: "number" },
  { key: "SEX", label: "Gender", type: "select", options: [{ v: 1, l: "Male" }, { v: 2, l: "Female" }] },
  {
    key: "EDUCATION",
    label: "Education",
    type: "select",
    options: [
      { v: 1, l: "Graduate school" },
      { v: 2, l: "University" },
      { v: 3, l: "High school" },
      { v: 4, l: "Other" },
    ],
  },
  {
    key: "MARRIAGE",
    label: "Marital Status",
    type: "select",
    options: [
      { v: 0, l: "Unknown" },
      { v: 1, l: "Married" },
      { v: 2, l: "Single" },
      { v: 3, l: "Other" },
    ],
  },
  { key: "AGE", label: "Age", type: "number" },
];

const PAYMENT_STATUS = ["PAY_0", "PAY_2", "PAY_3", "PAY_4", "PAY_5", "PAY_6"];
const BILL_AMTS = ["BILL_AMT1", "BILL_AMT2", "BILL_AMT3", "BILL_AMT4", "BILL_AMT5", "BILL_AMT6"];
const PAY_AMTS = ["PAY_AMT1", "PAY_AMT2", "PAY_AMT3", "PAY_AMT4", "PAY_AMT5", "PAY_AMT6"];

export default function PredictionForm({ onResult }) {
  const [values, setValues] = useState({ ...DEFAULTS });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function update(key, val) {
    setValues((v) => ({ ...v, [key]: Number(val) }));
  }

  async function predict() {
    setLoading(true);
    setError("");
    try {
      const result = await api("/api/predict", { method: "POST", body: values });
      if (onResult) onResult(result);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function renderField(field) {
    return (
      <label key={field.key} className={styles.field}>
        <span className={styles.fieldLabel}>{field.label}</span>
        {field.type === "select" ? (
          <select className={`${styles.input} data`} value={values[field.key]} onChange={(e) => update(field.key, e.target.value)}>
            {field.options.map((o) => (
              <option key={o.v} value={o.v}>
                {o.l}
              </option>
            ))}
          </select>
        ) : (
          <input
            type="number"
            className={`${styles.input} data`}
            value={values[field.key]}
            onChange={(e) => update(field.key, e.target.value)}
          />
        )}
      </label>
    );
  }

  return (
    <div className={styles.form}>
      <div className={styles.presets}>
        <span className={styles.presetsLabel}>Load preset:</span>
        <button className={styles.preset} onClick={() => setValues({ ...DEFAULTS })}>
          Low risk customer
        </button>
        <button className={`${styles.preset} ${styles.presetDanger}`} onClick={() => setValues({ ...HIGH_RISK })}>
          High risk customer
        </button>
      </div>

      <div className={styles.group}>
        <h4 className={styles.groupLabel}>Customer Profile</h4>
        <div className={styles.fields}>{PROFILE.map(renderField)}</div>
      </div>

      <div className={styles.group}>
        <h4 className={styles.groupLabel}>Payment History (months back)</h4>
        <div className={styles.fields}>
          {PAYMENT_STATUS.map((k) =>
            renderField({ key: k, label: k.replace("_", " "), type: "number" })
          )}
        </div>
      </div>

      <div className={styles.group}>
        <h4 className={styles.groupLabel}>Bill Amounts</h4>
        <div className={styles.fields}>{BILL_AMTS.map((k) => renderField({ key: k, label: k, type: "number" }))}</div>
      </div>

      <div className={styles.group}>
        <h4 className={styles.groupLabel}>Payment Amounts</h4>
        <div className={styles.fields}>{PAY_AMTS.map((k) => renderField({ key: k, label: k, type: "number" }))}</div>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      <button className={styles.predictBtn} onClick={predict} disabled={loading}>
        {loading ? "Predicting..." : "Run Prediction →"}
      </button>
    </div>
  );
}
