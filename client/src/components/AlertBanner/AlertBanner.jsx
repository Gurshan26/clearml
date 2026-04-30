import { useState } from "react";
import { api } from "../../utils/api";
import styles from "./AlertBanner.module.css";

const SEVERITY_CONFIG = {
  critical: { colour: "#CF222E", bg: "#FFEBE9", icon: "🚨", label: "CRITICAL" },
  high: { colour: "#BC4C00", bg: "#FFECE0", icon: "⚠️", label: "HIGH" },
  medium: { colour: "#9A6700", bg: "#FFF8C5", icon: "⚑", label: "MODERATE" },
  low: { colour: "#1A7F37", bg: "#DAFBE1", icon: "ℹ", label: "LOW" },
};

export default function AlertBanner({ alert, onResolved }) {
  const [resolving, setResolving] = useState(false);
  const cfg = SEVERITY_CONFIG[alert.severity] || SEVERITY_CONFIG.low;

  async function resolve() {
    setResolving(true);
    try {
      await api(`/api/alerts/${alert.id}/resolve`, { method: "PATCH" });
      if (onResolved) onResolved(alert.id);
    } finally {
      setResolving(false);
    }
  }

  return (
    <div
      className={`${styles.banner} alert-slide`}
      style={{ borderLeftColor: cfg.colour, background: cfg.bg }}
      role="alert"
    >
      <span className={styles.icon}>{cfg.icon}</span>
      <div className={styles.content}>
        <div className={styles.topRow}>
          <span className={styles.severityLabel} style={{ color: cfg.colour }}>
            {cfg.label}
          </span>
          <span className={`${styles.timestamp} data`}>
            {new Date(alert.timestamp).toLocaleTimeString("en-AU")}
          </span>
        </div>
        <p className={styles.message}>{alert.message}</p>
        <p className={`${styles.driftScore} data`}>Drift score: {alert.drift_score?.toFixed(1)}</p>
      </div>
      {!alert.resolved && (
        <button className={styles.resolveBtn} onClick={resolve} disabled={resolving}>
          {resolving ? "..." : "Resolve"}
        </button>
      )}
    </div>
  );
}
