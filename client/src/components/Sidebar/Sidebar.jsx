import { NavLink } from "react-router-dom";
import styles from "./Sidebar.module.css";

const LINKS = [
  { to: "/", label: "Overview" },
  { to: "/explain", label: "Explain" },
  { to: "/drift", label: "Drift" },
  { to: "/alerts", label: "Alerts" },
  { to: "/history", label: "History" },
];

export default function Sidebar({ quickStats = {} }) {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <h1>ClearML</h1>
        <p>Explainable Monitoring</p>
      </div>

      <nav className={styles.nav}>
        {LINKS.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === "/"}
            className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ""}`}
          >
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className={styles.quickStats}>
        <div className={styles.stat}>
          <span className={styles.statLabel}>AUC</span>
          <span className={`${styles.statValue} data`}>{quickStats.auc || "—"}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Drift Score</span>
          <span className={`${styles.statValue} data`}>{quickStats.driftScore || "—"}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Alerts</span>
          <span className={`${styles.statValue} data`}>{quickStats.alerts ?? "—"}</span>
        </div>
      </div>
    </aside>
  );
}
