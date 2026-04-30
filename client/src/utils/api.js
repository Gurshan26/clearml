const BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

export async function api(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method: options.method || "GET",
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try {
      const e = await res.json();
      msg = e.detail || e.error || msg;
    } catch {
      // no-op
    }
    throw new Error(msg);
  }
  return res.json();
}
