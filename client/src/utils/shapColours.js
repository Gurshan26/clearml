export function shapDirectionColour(direction) {
  if (direction === "positive") return "#F97316";
  if (direction === "negative") return "#6366F1";
  return "#94A3B8";
}

export function shapDirectionBg(direction) {
  if (direction === "positive") return "#FFF7ED";
  if (direction === "negative") return "#EEF2FF";
  return "#F8FAFC";
}

export function shapValueToWidth(shapValue, maxAbs, maxWidth = 200) {
  if (maxAbs === 0) return 0;
  return Math.max(2, (Math.abs(shapValue) / maxAbs) * maxWidth);
}
