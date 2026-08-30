/**
 * components/admin/DonutChart.jsx
 * A small, dependency-free SVG donut chart with a legend, used for the
 * "Complaint Analytics" (category breakdown) card on the Admin Dashboard.
 *
 * data: [{ label, value, percentage, color }]
 */
const SIZE = 140;
const STROKE = 22;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function DonutChart({ data }) {
  let offset = 0;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} style={{ flexShrink: 0 }}>
        <circle cx={SIZE / 2} cy={SIZE / 2} r={RADIUS} fill="none" stroke="var(--border)" strokeWidth={STROKE} />
        {data.map((d, i) => {
          const dash = (d.percentage / 100) * CIRCUMFERENCE;
          const circle = (
            <circle
              key={i}
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              fill="none"
              stroke={d.color}
              strokeWidth={STROKE}
              strokeDasharray={`${dash} ${CIRCUMFERENCE - dash}`}
              strokeDashoffset={-offset}
              transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
            />
          );
          offset += dash;
          return circle;
        })}
      </svg>

      <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1, minWidth: 140 }}>
        {data.map((d, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5 }}>
            <span style={{ width: 10, height: 10, borderRadius: 3, background: d.color, flexShrink: 0 }} />
            <span style={{ flex: 1, color: "var(--text-primary)", fontWeight: 500 }}>{d.label}</span>
            <span style={{ color: "var(--text-secondary)", fontWeight: 700 }}>{d.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
