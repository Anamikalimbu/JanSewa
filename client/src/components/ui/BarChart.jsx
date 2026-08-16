/**
 * components/admin/BarChart.jsx
 * A small, dependency-free SVG bar chart, used for "Complaints Over Time"
 * on the Admin Dashboard.
 *
 * data: [{ month, count }]
 */
export default function BarChart({ data, height = 160 }) {
  const max = Math.max(...data.map((d) => d.count), 1);

  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 14, height, padding: "0 4px" }}>
      {data.map((d, i) => {
        const barHeight = Math.max((d.count / max) * (height - 28), 3);
        return (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-secondary)" }}>{d.count}</div>
            <div
              style={{
                width: "100%", maxWidth: 34, height: barHeight, borderRadius: "6px 6px 2px 2px",
                background: "linear-gradient(180deg, var(--secondary), var(--primary))",
              }}
            />
            <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{d.month}</div>
          </div>
        );
      })}
    </div>
  );
}
