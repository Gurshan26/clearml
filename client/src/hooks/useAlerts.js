import { useCallback, useEffect, useState } from "react";
import { api } from "../utils/api";

export function useAlerts({ intervalMs = 0 } = {}) {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setError("");
    try {
      const res = await api("/api/alerts");
      setAlerts(res.alerts || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (!intervalMs) return undefined;
    const id = setInterval(refresh, intervalMs);
    return () => clearInterval(id);
  }, [intervalMs, refresh]);

  const markResolvedLocal = useCallback((id) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  }, []);

  return { alerts, loading, error, refresh, markResolvedLocal };
}
