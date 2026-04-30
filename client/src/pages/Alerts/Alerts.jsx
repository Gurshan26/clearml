import AlertBanner from "../../components/AlertBanner/AlertBanner";
import { useAlerts } from "../../hooks/useAlerts";
import styles from "./Alerts.module.css";

export default function AlertsPage() {
  const { alerts, loading, error, refresh, markResolvedLocal } = useAlerts();

  return (
    <div className={styles.page}>
      <section className={styles.header}>
        <h1>Alert History</h1>
        <p className="prose-italic">Severity-first incident stream for model drift and reliability thresholds.</p>
      </section>

      <div className={styles.controls}>
        <button className={styles.refresh} onClick={refresh}>
          Refresh
        </button>
        <span className="data">{alerts.length} total alerts</span>
      </div>

      {error && <div className={styles.error}>{error}</div>}
      {!alerts.length && !loading && <div className={styles.empty}>No alerts yet.</div>}

      <div className={styles.list}>
        {alerts.map((alert) => (
          <AlertBanner key={alert.id} alert={{ ...alert, resolved: Boolean(alert.resolved) }} onResolved={markResolvedLocal} />
        ))}
      </div>

      {loading && <p className={styles.loading}>Loading alerts...</p>}
    </div>
  );
}
