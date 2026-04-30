export default function Skeleton({ height = 16, width = "100%" }) {
  return (
    <div
      style={{
        width,
        height,
        background: "linear-gradient(90deg, #f0f2f5 0%, #e5e8ed 50%, #f0f2f5 100%)",
        backgroundSize: "200% 100%",
        borderRadius: "4px",
        animation: "fadeIn 0.2s ease",
      }}
    />
  );
}
