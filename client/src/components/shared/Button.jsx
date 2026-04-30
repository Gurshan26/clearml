export default function Button({ children, style, ...props }) {
  return (
    <button
      {...props}
      style={{
        border: "1px solid var(--border-2)",
        borderRadius: "8px",
        background: "var(--surface)",
        color: "var(--ink-2)",
        height: "36px",
        padding: "0 12px",
        cursor: "pointer",
        ...style,
      }}
    >
      {children}
    </button>
  );
}
