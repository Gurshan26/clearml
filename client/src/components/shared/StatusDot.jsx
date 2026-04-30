export default function StatusDot({ colour = "#94A3B8" }) {
  return (
    <span
      style={{
        display: "inline-block",
        width: 8,
        height: 8,
        borderRadius: 999,
        background: colour,
      }}
    />
  );
}
