import styles from "./SHAPWaterfall.module.css";

const COLOURS = {
  positive: { bar: "#F97316", text: "#C2410C", bg: "#FFF7ED" },
  negative: { bar: "#6366F1", text: "#4338CA", bg: "#EEF2FF" },
  neutral: { bar: "#94A3B8", text: "#64748B", bg: "#F8FAFC" },
};

export default function SHAPWaterfall({ contributions, baseValue }) {
  if (!contributions || contributions.length === 0) return null;

  const TOP_N = 10;
  const shown = contributions.slice(0, TOP_N);

  const BAR_HEIGHT = 28;
  const LABEL_W = 140;
  const VALUE_W = 80;
  const BAR_MAX_W = 240;
  const ROW_GAP = 8;
  const SVG_W = LABEL_W + VALUE_W + BAR_MAX_W + 20;
  const SVG_H = shown.length * (BAR_HEIGHT + ROW_GAP) + 60;
  const maxAbs = Math.max(...shown.map((c) => Math.abs(c.shap_value)), 0.001);

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <span className={styles.title}>Why this prediction?</span>
        <span className={styles.legend}>
          <span style={{ color: COLOURS.positive.bar }}>█</span> Increases default risk
          <span style={{ color: COLOURS.negative.bar, marginLeft: 12 }}>█</span> Reduces default risk
        </span>
      </div>

      <svg
        width="100%"
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        className={styles.svg}
        role="img"
        aria-label="SHAP feature contribution waterfall chart"
      >
        {shown.map((contrib, i) => {
          const y = i * (BAR_HEIGHT + ROW_GAP) + 30;
          const cfg = COLOURS[contrib.direction] || COLOURS.neutral;
          const barW = (Math.abs(contrib.shap_value) / maxAbs) * BAR_MAX_W;
          const barX =
            contrib.direction === "negative"
              ? LABEL_W + VALUE_W + (BAR_MAX_W - barW)
              : LABEL_W + VALUE_W;
          const isPos = contrib.direction === "positive";
          const sigStr = contrib.shap_value > 0 ? "+" : "";

          return (
            <g key={contrib.feature} className={styles.row}>
              <text
                x={LABEL_W - 8}
                y={y + BAR_HEIGHT / 2 + 5}
                textAnchor="end"
                fontSize={11}
                fontFamily="IBM Plex Mono"
                fill="#57606A"
              >
                {contrib.feature}
              </text>

              <text
                x={LABEL_W + 4}
                y={y + BAR_HEIGHT / 2 + 5}
                textAnchor="start"
                fontSize={10}
                fontFamily="IBM Plex Mono"
                fill="#8C959F"
              >
                {typeof contrib.value === "number" ? contrib.value.toLocaleString() : contrib.value}
              </text>

              <rect x={LABEL_W + VALUE_W} y={y} width={BAR_MAX_W} height={BAR_HEIGHT} fill="#F6F8FA" rx={3} />

              <rect
                x={barX}
                y={y + 4}
                width={Math.max(barW, 2)}
                height={BAR_HEIGHT - 8}
                fill={cfg.bar}
                rx={3}
                opacity={0.85}
                className={styles.bar}
              />

              <text
                x={isPos ? barX + barW + 6 : barX - 6}
                y={y + BAR_HEIGHT / 2 + 4}
                textAnchor={isPos ? "start" : "end"}
                fontSize={10}
                fontFamily="IBM Plex Mono"
                fill={cfg.bar}
                fontWeight={500}
              >
                {sigStr}
                {contrib.shap_value.toFixed(3)}
              </text>
            </g>
          );
        })}

        <line
          x1={LABEL_W + VALUE_W}
          y1={20}
          x2={LABEL_W + VALUE_W}
          y2={SVG_H - 10}
          stroke="#D0D7DE"
          strokeWidth={1}
          strokeDasharray="4 3"
        />
        <text x={LABEL_W + VALUE_W + 4} y={15} fontSize={9} fill="#8C959F" fontFamily="IBM Plex Mono">
          base: {Number(baseValue || 0).toFixed(3)}
        </text>
      </svg>
    </div>
  );
}
