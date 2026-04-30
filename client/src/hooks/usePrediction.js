import { useState } from "react";
import { api } from "../utils/api";

export function usePrediction() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function predict(payload) {
    setLoading(true);
    setError("");
    try {
      const data = await api("/api/predict", { method: "POST", body: payload });
      setResult(data);
      return data;
    } catch (e) {
      setError(e.message);
      throw e;
    } finally {
      setLoading(false);
    }
  }

  return { result, loading, error, predict, setResult };
}
