import { useCallback, useEffect, useState } from "react";
import { api } from "../utils/api";

export function useModel() {
  const [metrics, setMetrics] = useState(null);
  const [importance, setImportance] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [m, i] = await Promise.all([
        api("/api/model/metrics"),
        api("/api/model/global-importance"),
      ]);
      setMetrics(m);
      setImportance(i.feature_importances || {});
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { metrics, importance, loading, error, refresh };
}
