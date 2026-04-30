import { formatProbability } from "../../utils/formatters";
import styles from "./ConfidenceBadge.module.css";

const LEVELS = {
  high: { fg: "#00897B", bg: "#E0F7FA", label: "HIGH" },
  medium: { fg: "#9A6700", bg: "#FFF8C5", label: "MEDIUM" },
  low: { fg: "#CF222E", bg: "#FFEBE9", label: "LOW" },
};

export default function ConfidenceBadge({ confidence, probability }) {
  const cfg = LEVELS[confidence] || LEVELS.low;
  return (
    <span className={styles.badge} style={{ color: cfg.fg, background: cfg.bg, borderColor: cfg.fg }}>
      <span className={styles.level}>{cfg.label}</span>
      <span className={`${styles.value} data`}>{formatProbability(probability)}</span>
    </span>
  );
}
