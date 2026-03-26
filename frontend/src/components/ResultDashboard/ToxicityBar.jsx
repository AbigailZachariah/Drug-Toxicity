import { useEffect, useState } from "react";

export default function ToxicityBar({ score = 0, label = "" }) {
  // score: 0–100
  const [animated, setAnimated] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(score), 200);
    return () => clearTimeout(timer);
  }, [score]);

  const getColor = (s) => {
    if (s <= 25) return "#00e5a0";
    if (s <= 50) return "#a8e063";
    if (s <= 70) return "#f7b731";
    if (s <= 85) return "#ff6b35";
    return "#ff4d4d";
  };

  const color = getColor(score);
  const risk =
    score <= 25 ? "Low"
    : score <= 50 ? "Moderate"
    : score <= 70 ? "High"
    : score <= 85 ? "Very High"
    : "Critical";

  return (
    <div className="tox-wrap">
      <div className="tox-header">
        <div className="tox-title">
          <span className="tox-icon">🔥</span>
          Toxicity Score
        </div>
        <div className="tox-score" style={{ color }}>
          {score}<span className="tox-unit">/100</span>
        </div>
      </div>

      <div className="tox-bar-bg">
        <div
          className="tox-bar-fill"
          style={{
            width: `${animated}%`,
            background: `linear-gradient(90deg, ${getColor(0)}, ${color})`,
          }}
        />
      </div>

      <div className="tox-labels">
        <span style={{ color: "#00e5a0" }}>Safe</span>
        <span style={{ color: "#f7b731" }}>Moderate</span>
        <span style={{ color: "#ff4d4d" }}>Critical</span>
      </div>

      <div className="tox-risk-pill" style={{ background: `${color}22`, border: `1px solid ${color}`, color }}>
        Risk Level: <strong>{risk}</strong>
      </div>

      {label && <p className="tox-sublabel">{label}</p>}
    </div>
  );
}