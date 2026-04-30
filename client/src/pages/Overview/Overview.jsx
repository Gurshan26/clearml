import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import DriftSimulator from "../../components/DriftSimulator/DriftSimulator";
import ModelMetricsPanel from "../../components/ModelMetricsPanel/ModelMetricsPanel";
import SHAPBarChart from "../../components/SHAPBarChart/SHAPBarChart";
import { useDrift } from "../../hooks/useDrift";
import { useModel } from "../../hooks/useModel";
import styles from "./Overview.module.css";

export default function OverviewPage() {
  const { metrics, importance, loading: modelLoading, error: modelError, refresh: refreshModel } = useModel();
  const { status, history, loading: driftLoading, error: driftError, refresh: refreshDrift } = useDrift();

  const chartData = (history || [])
    .slice()
    .reverse()
    .map((h) => ({
      timestamp: new Date(h.timestamp).toLocaleTimeString("en-AU"),
      drift_score: Number(h.drift_score || 0),
    }));

  return (
    <div className={styles.page}>
      <section className={styles.header}>
        <h1>Model Health Overview</h1>
        <p className="prose-italic">A precise view of model quality, explanation stability, and live drift pressure.</p>
      </section>

      {(modelError || driftError) && (
        <div className={styles.error}>
          {[modelError, driftError].filter(Boolean).join(" · ")}
        </div>
      )}

      <div className={styles.grid}>
        <div className={styles.leftCol}>
          <ModelMetricsPanel metrics={metrics} />
          <SHAPBarChart importance={importance} />
        </div>

        <div className={styles.rightCol}>
          <div className={styles.panel}>
            <div className={styles.panelTop}>
              <h3>Drift Timeline</h3>
              <button className={styles.refresh} onClick={() => { refreshModel(); refreshDrift(); }}>
                Refresh
              </button>
            </div>
            <div className={styles.chartWrap}>
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={chartData}>
                  <XAxis dataKey="timestamp" tick={{ fontFamily: "IBM Plex Mono", fontSize: 10 }} />
                  <YAxis domain={[0, 100]} tick={{ fontFamily: "IBM Plex Mono", fontSize: 10 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="drift_score" stroke="#00BFA5" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className={styles.statusRow}>
              <span>Current severity</span>
              <span className={`${styles.statusBadge} data`}>{status?.overall_severity || "none"}</span>
              <span className={`${styles.score} data`}>score {Number(status?.drift_score || 0).toFixed(1)}</span>
            </div>
          </div>

          <DriftSimulator onSimulated={refreshDrift} />
        </div>
      </div>

      {(modelLoading || driftLoading) && <p className={styles.loading}>Loading dashboard...</p>}
    </div>
  );
}
