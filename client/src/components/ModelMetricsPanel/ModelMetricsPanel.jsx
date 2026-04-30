import { formatNumber, formatProbability } from "../../utils/formatters";
import styles from "./ModelMetricsPanel.module.css";

const FIELDS = [
  ["AUC-ROC", "auc_roc"],
  ["F1", "f1"],
  ["Accuracy", "accuracy"],
  ["Precision", "precision"],
  ["Recall", "recall"],
  ["Default Rate", "default_rate"],
];

export default function ModelMetricsPanel({ metrics }) {
  if (!metrics) return null;

  return (
    <div className={styles.panel}>
      <h3>Model Metrics</h3>
      <div className={styles.grid}>
        {FIELDS.map(([label, key]) => (
          <div key={key} className={styles.item}>
            <span className={styles.label}>{label}</span>
            <span className={`${styles.value} data`}>
              {key === "default_rate" ? formatProbability(metrics[key]) : Number(metrics[key]).toFixed(3)}
            </span>
          </div>
        ))}
      </div>
      <div className={styles.meta}>
        <span className="data">Train: {formatNumber(metrics.total_training_samples)}</span>
        <span className="data">Test: {formatNumber(metrics.test_samples)}</span>
      </div>
    </div>
  );
}
