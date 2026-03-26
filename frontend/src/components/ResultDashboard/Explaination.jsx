export default function Explaination({ compound = "", explanation = "", highlights = [] }) {
  return (
    <div className="exp-wrap">
      <div className="exp-title">
        <span>🧠</span> AI Explanation
      </div>

      <p className="exp-compound-label">
        Analysis for: <strong>{compound}</strong>
      </p>

      <div className="exp-body">
        {explanation || "No explanation available for this compound."}
      </div>

      {highlights.length > 0 && (
        <div className="exp-highlights">
          <p className="exp-highlights-title">Key Findings</p>
          <ul className="exp-list">
            {highlights.map((h, i) => (
              <li key={i} className="exp-list-item">
                <span className="exp-bullet">→</span> {h}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}