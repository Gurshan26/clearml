export function formatProbability(p) {
  if (p === null || p === undefined) return "—";
  return `${(p * 100).toFixed(1)}%`;
}

export function formatNumber(n, decimals = 0) {
  if (n === null || n === undefined) return "—";
  return Number(n).toLocaleString("en-AU", { maximumFractionDigits: decimals });
}

export function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatSHAP(val) {
  if (val === null || val === undefined) return "—";
  const sign = val > 0 ? "+" : "";
  return `${sign}${val.toFixed(4)}`;
}

export function formatPSI(psi) {
  if (psi === null || psi === undefined) return "—";
  if (psi < 0.1) return `${psi.toFixed(3)} (stable)`;
  if (psi < 0.25) return `${psi.toFixed(3)} (caution)`;
  return `${psi.toFixed(3)} (alert)`;
}

export function truncate(str, len = 20) {
  if (!str) return "";
  return str.length > len ? `${str.slice(0, len)}…` : str;
}
