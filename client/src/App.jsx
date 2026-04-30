import { Navigate, Route, Routes } from "react-router-dom";
import Sidebar from "./components/Sidebar/Sidebar";
import TopBar from "./components/TopBar/TopBar";
import { useAlerts } from "./hooks/useAlerts";
import { useModel } from "./hooks/useModel";
import AlertsPage from "./pages/Alerts/Alerts";
import DriftPage from "./pages/Drift/Drift";
import ExplainPage from "./pages/Explain/Explain";
import HistoryPage from "./pages/History/History";
import OverviewPage from "./pages/Overview/Overview";
import styles from "./App.module.css";

export default function App() {
  const { metrics } = useModel();
  const { alerts } = useAlerts({ intervalMs: 8000 });
  const unresolvedAlerts = alerts.filter((a) => !a.resolved).length;

  return (
    <div className={styles.app}>
      <Sidebar
        quickStats={{
          auc: metrics ? Number(metrics.auc_roc).toFixed(3) : "—",
          driftScore: "—",
          alerts: unresolvedAlerts,
        }}
      />
      <div className={styles.mainWrap}>
        <TopBar alertCount={unresolvedAlerts} />
        <main className={styles.main}>
          <Routes>
            <Route path="/" element={<OverviewPage />} />
            <Route path="/explain" element={<ExplainPage />} />
            <Route path="/drift" element={<DriftPage />} />
            <Route path="/alerts" element={<AlertsPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
