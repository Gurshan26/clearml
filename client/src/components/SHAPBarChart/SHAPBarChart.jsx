import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import styles from "./SHAPBarChart.module.css";

export default function SHAPBarChart({ importance = {} }) {
  const entries = Object.entries(importance || {})
    .slice(0, 12)
    .map(([feature, value]) => ({ feature, value }));

  if (!entries.length) {
    return <div className={styles.empty}>No feature importance data yet.</div>;
  }

  return (
    <div className={styles.panel}>
      <h3>Global SHAP Feature Importance</h3>
      <div className={styles.chartWrap}>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={entries} layout="vertical" margin={{ top: 6, right: 16, left: 8, bottom: 6 }}>
            <XAxis type="number" tick={{ fontFamily: "IBM Plex Mono", fontSize: 11 }} />
            <YAxis type="category" dataKey="feature" width={88} tick={{ fontFamily: "IBM Plex Mono", fontSize: 11 }} />
            <Tooltip formatter={(v) => Number(v).toFixed(4)} />
            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
              {entries.map((_, idx) => (
                <Cell key={idx} fill={idx % 2 === 0 ? "#F97316" : "#6366F1"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
