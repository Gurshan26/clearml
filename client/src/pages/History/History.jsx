import { useEffect, useState } from "react";
import { api } from "../../utils/api";
import { formatDate, formatProbability, truncate } from "../../utils/formatters";
import styles from "./History.module.css";

export default function HistoryPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await api("/api/predictions/recent");
      setRows(res.predictions || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className={styles.page}>
      <section className={styles.header}>
        <h1>Prediction History</h1>
        <p className="prose-italic">Recent inferences with confidence and probability traceability.</p>
      </section>

      <div className={styles.controls}>
        <button className={styles.refresh} onClick={load}>
          Refresh
        </button>
        <span className="data">{rows.length} records</span>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Timestamp</th>
              <th>Prediction</th>
              <th>Probability</th>
              <th>Confidence</th>
              <th>Input Snapshot</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td className="data">{row.id}</td>
                <td>{formatDate(row.timestamp)}</td>
                <td className="data">{row.prediction === 1 ? "Default" : "No Default"}</td>
                <td className="data">{formatProbability(row.probability)}</td>
                <td className="data">{row.confidence}</td>
                <td className="data">{truncate(row.input_json, 42)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!rows.length && !loading && <div className={styles.empty}>No predictions recorded yet.</div>}
      {loading && <p className={styles.loading}>Loading history...</p>}
    </div>
  );
}
