export default function DangerBadge({ level }) {
  // level: "safe" | "low" | "moderate" | "high" | "critical"
  const config = {
    safe:     { label: "Safe",     color: "#00e5a0", bg: "rgba(0,229,160,0.12)",     icon: "✅" },
    low:      { label: "Low Risk", color: "#a8e063", bg: "rgba(168,224,99,0.12)",    icon: "🟡" },
    moderate: { label: "Moderate", color: "#f7b731", bg: "rgba(247,183,49,0.12)",    icon: "⚠️" },
    high:     { label: "High Risk",color: "#ff6b35", bg: "rgba(255,107,53,0.12)",    icon: "🔶" },
    critical: { label: "Toxic",    color: "#ff4d4d", bg: "rgba(255,77,77,0.12)",     icon: "🚨" },
  };

  const c = config[level] || config["moderate"];

  return (
    <span
      className="danger-badge"
      style={{
        background: c.bg,
        border: `1px solid ${c.color}`,
        color: c.color,
      }}
    >
      <span className="danger-badge-icon">{c.icon}</span>
      {c.label}
    </span>
  );
}