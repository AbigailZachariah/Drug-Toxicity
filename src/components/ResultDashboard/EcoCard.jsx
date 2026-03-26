export default function EcoCard({ soil = 0, water = 0, air = 0, biodegradable = false }) {
  const metrics = [
    { icon: "🌱", label: "Soil Impact",  value: soil,  unit: "%" },
    { icon: "💧", label: "Water Impact", value: water, unit: "%" },
    { icon: "💨", label: "Air Quality",  value: air,   unit: "%" },
  ];

  const getBar = (val) => {
    if (val <= 30) return { color: "#00e5a0", label: "Low" };
    if (val <= 60) return { color: "#f7b731", label: "Moderate" };
    return { color: "#ff4d4d", label: "High" };
  };

  return (
    <div className="eco-wrap">
      <div className="eco-title">
        <span>🌍</span> Eco Impact Analysis
      </div>

      <div className="eco-metrics">
        {metrics.map((m) => {
          const { color, label } = getBar(m.value);
          return (
            <div className="eco-metric" key={m.label}>
              <div className="eco-metric-top">
                <span className="eco-metric-icon">{m.icon}</span>
                <span className="eco-metric-label">{m.label}</span>
                <span className="eco-metric-val" style={{ color }}>{m.value}{m.unit}</span>
              </div>
              <div className="eco-mini-bar-bg">
                <div
                  className="eco-mini-bar-fill"
                  style={{ width: `${m.value}%`, background: color }}
                />
              </div>
              <span className="eco-risk-tag" style={{ color }}>{label}</span>
            </div>
          );
        })}
      </div>

      <div className={`eco-biodeg ${biodegradable ? "eco-biodeg--yes" : "eco-biodeg--no"}`}>
        {biodegradable ? "♻️ Biodegradable" : "⚠️ Non-Biodegradable"}
      </div>
    </div>
  );
}