import styles from "./DriftHealthBar.module.css";

const SEVERITY_CONFIG = {
  none: { colour: "#1A7F37", bg: "#DAFBE1", label: "No drift", width: 5 },
  low: { colour: "#9A6700", bg: "#FFF8C5", label: "Low drift", width: 30 },
  medium: { colour: "#BC4C00", bg: "#FFECE0", label: "Moderate", width: 60 },
  high: { colour: "#CF222E", bg: "#FFEBE9", label: "High drift", width: 80 },
  critical: { colour: "#82071E", bg: "#FF818266", label: "Critical", width: 100 },
};

export default function DriftHealthBar({ feature, ks_statistic, psi, severity, mean_shift_pct }) {
  const cfg = SEVERITY_CONFIG[severity] || SEVERITY_CONFIG.none;

  return (
    <div className={styles.row}>
      <div className={styles.featureLabel}>
        <span className={styles.featureName}>{feature}</span>
        {(severity === "high" || severity === "critical") && (
          <span className={styles.alertDot} aria-label="Alert" />
        )}
      </div>

      <div className={styles.barTrack}>
        <div
          className={styles.barFill}
          style={{ width: `${cfg.width}%`, background: cfg.colour }}
          role="progressbar"
          aria-valuenow={cfg.width}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${feature} drift: ${cfg.label}`}
        />
      </div>

      <div className={styles.stats}>
        <span className={`${styles.statVal} data`}>PSI: {psi.toFixed(3)}</span>
        <span className={`${styles.statVal} data`}>KS: {ks_statistic.toFixed(3)}</span>
        {mean_shift_pct !== 0 && (
          <span
            className={`${styles.shift} data`}
            style={{ color: Math.abs(mean_shift_pct) > 20 ? "var(--red)" : "var(--amber)" }}
          >
            {mean_shift_pct > 0 ? "↑" : "↓"}
            {Math.abs(mean_shift_pct).toFixed(1)}%
          </span>
        )}
        <span className={styles.badge} style={{ color: cfg.colour, background: cfg.bg }}>
          {cfg.label}
        </span>
      </div>
    </div>
  );
}
