import styles from "./TopBar.module.css";

export default function TopBar({ modelName = "RandomForestClassifier", dataset = "UCI Credit Default", alertCount = 0 }) {
  return (
    <header className={styles.topbar}>
      <div className={styles.left}>
        <h2>{modelName}</h2>
        <span className={styles.dataset}>{dataset}</span>
      </div>
      <div className={styles.right}>
        <span className={`${styles.time} data`}>Updated {new Date().toLocaleTimeString("en-AU")}</span>
        <span className={`${styles.badge} data`}>{alertCount} alerts</span>
      </div>
    </header>
  );
}
