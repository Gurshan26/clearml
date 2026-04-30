import { useCallback, useEffect, useState } from "react";
import { api } from "../utils/api";

export function useDrift({ intervalMs = 0 } = {}) {
  const [status, setStatus] = useState(null);
  const [history, setHistory] = useState([]);
  const [windowSize, setWindowSize] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setError("");
    try {
      const [s, h, w] = await Promise.all([
        api("/api/drift/status"),
        api("/api/drift/history"),
        api("/api/drift/window-size"),
      ]);
      setStatus(s);
      setHistory(h.history || []);
      setWindowSize(w.size || 0);
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

  return { status, history, windowSize, loading, error, refresh };
}
