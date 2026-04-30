import DriftHealthBar from "../../components/DriftHealthBar/DriftHealthBar";
import DriftSimulator from "../../components/DriftSimulator/DriftSimulator";
import { useDrift } from "../../hooks/useDrift";
import styles from "./Drift.module.css";

export default function DriftPage() {
  const { status, windowSize, loading, error, refresh } = useDrift();

  return (
    <div className={styles.page}>
      <section className={styles.header}>
        <h1>Drift Monitor</h1>
        <p className="prose-italic">Distribution shifts are tracked feature by feature with PSI and KS diagnostics.</p>
      </section>

      <div className={styles.meta}>
        <span className="data">Window: {windowSize} samples</span>
        <span className="data">Severity: {status?.overall_severity || "none"}</span>
        <span className="data">Drift score: {Number(status?.drift_score || 0).toFixed(1)}</span>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <DriftSimulator onSimulated={refresh} />

      <section className={styles.panel}>
        <div className={styles.panelTop}>
          <h3>Feature Drift Health</h3>
          <button className={styles.refresh} onClick={refresh}>
            Refresh
          </button>
        </div>
        {!status?.feature_results?.length && (
          <p className={styles.empty}>
            {status?.alert_message || "No monitoring sample window yet. Run predictions or simulate drift."}
          </p>
        )}
        <div className={styles.rows}>
          {(status?.feature_results || []).map((r) => (
            <DriftHealthBar key={r.feature} {...r} />
          ))}
        </div>
      </section>

      {loading && <p className={styles.loading}>Calculating drift...</p>}
    </div>
  );
}
