import { useState } from "react";
import { api } from "../../utils/api";
import styles from "./DriftSimulator.module.css";

const SCENARIOS = [
  { key: "mild", label: "Mild", description: "Slight shifts in a few features", colour: "#9A6700" },
  { key: "moderate", label: "Moderate", description: "Noticeable shift in 8 features", colour: "#BC4C00" },
  { key: "severe", label: "Severe", description: "Large shifts across most features", colour: "#CF222E" },
  { key: "extreme", label: "Extreme", description: "Complete distributional breakdown", colour: "#82071E" },
];

export default function DriftSimulator({ onSimulated }) {
  const [selected, setSelected] = useState("moderate");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  async function runSimulation() {
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const data = await api("/api/drift/simulate", { method: "POST", body: { scenario: selected } });
      setResult(data);
      if (onSimulated) onSimulated();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function resetDrift() {
    await api("/api/drift/reset", { method: "POST" });
    setResult(null);
    if (onSimulated) onSimulated();
  }

  const scenario = SCENARIOS.find((s) => s.key === selected);

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <h3>Drift Simulator</h3>
        <p className={styles.subtitle}>Inject synthetic drifted data to see alerts fire in real-time.</p>
      </div>

      <div className={styles.scenarioGrid}>
        {SCENARIOS.map((s) => (
          <button
            key={s.key}
            className={`${styles.scenario} ${selected === s.key ? styles.scenarioActive : ""}`}
            onClick={() => setSelected(s.key)}
            style={selected === s.key ? { borderColor: s.colour, color: s.colour } : {}}
          >
            <span className={styles.scenarioLabel}>{s.label}</span>
            <span className={styles.scenarioDesc}>{s.description}</span>
          </button>
        ))}
      </div>

      <div className={styles.actions}>
        <button
          className={`${styles.simulateBtn} ${loading ? styles.loading : ""}`}
          onClick={runSimulation}
          disabled={loading}
          style={{ "--accent": scenario?.colour || "var(--red)" }}
        >
          {loading ? (
            <span>Simulating...</span>
          ) : (
            <>
              <span className={styles.btnIcon}>⚡</span>
              Simulate {scenario?.label} Drift
            </>
          )}
        </button>
        <button className={styles.resetBtn} onClick={resetDrift}>
          Reset to baseline
        </button>
      </div>

      {result && (
        <div className={`${styles.result} animate-in`}>
          <span className={styles.resultIcon}>✓</span>
          <div>
            <strong>{result.samples_injected} samples injected</strong>
            <p>{result.n_features_affected} features affected</p>
            <p className={styles.resultNote}>Check the Drift Monitor to see the alerts.</p>
          </div>
        </div>
      )}

      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
}
