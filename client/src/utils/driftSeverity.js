export const SEVERITY_ORDER = { none: 0, low: 1, medium: 2, high: 3, critical: 4 };

export function severityToColour(severity) {
  const map = {
    none: "#1A7F37",
    low: "#9A6700",
    medium: "#BC4C00",
    high: "#CF222E",
    critical: "#82071E",
  };
  return map[severity] || "#94A3B8";
}

export function severityToBg(severity) {
  const map = {
    none: "#DAFBE1",
    low: "#FFF8C5",
    medium: "#FFECE0",
    high: "#FFEBE9",
    critical: "#FF818266",
  };
  return map[severity] || "#F6F8FA";
}

export function severityToLabel(severity) {
  const map = {
    none: "No Drift",
    low: "Low",
    medium: "Moderate",
    high: "High",
    critical: "Critical",
  };
  return map[severity] || severity;
}

export function isAlertLevel(severity) {
  return severity === "high" || severity === "critical";
}
