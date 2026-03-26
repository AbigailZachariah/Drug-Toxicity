import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LandingPage.css";

const FEATURES = [
  {
    icon: "☣️",
    title: "Toxicity Prediction",
    desc: "Analyze chemical compounds for toxicity levels using advanced ML models. Get instant hazard scores and safety classifications.",
  },
  {
    icon: "🌍",
    title: "Ecological Impact",
    desc: "Evaluate environmental footprint and biodegradability. Understand how a substance affects ecosystems and soil health.",
  },
  {
    icon: "⚠️",
    title: "Hazard Classification",
    desc: "Receive color-coded danger badges. Instantly know if a compound is flammable, corrosive, or carcinogenic.",
  },
];

export default function LandingPage() {
  const [compound, setCompound] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAnalyze = () => {
    if (!compound.trim()) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate("/results", { state: { compound } });
    }, 3000);
  };

  return (
    <div className="lp-root">
      {/* Background */}
      <div className="lp-bg" />

      {/* Navbar */}
      <nav className="lp-nav">
        <div className="lp-nav-brand">
          <span className="lp-nav-icon">🧬</span>
          <span className="lp-nav-name">ToxiScan</span>
        </div>
      </nav>

      {/* Hero */}
      <section className="lp-hero">
        <div className="lp-hero-content">
          <div className="lp-badge">AI-Powered Chemical Intelligence</div>
          <h1 className="lp-title">
            Decoding<br />
            <span className="lp-title-accent">Chemical Safety</span>
          </h1>
          <p className="lp-subtitle">
            Harness AI to predict compound toxicity and environmental impact in seconds.
          </p>

          {/* Input */}
          <div className="lp-input-wrap">
            <input
              className="lp-input"
              type="text"
              placeholder="Enter compound name or formula… e.g. Benzene, H₂SO₄"
              value={compound}
              onChange={(e) => setCompound(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
            />
            <button
              className={`lp-btn ${loading ? "lp-btn--loading" : ""}`}
              onClick={handleAnalyze}
              disabled={loading}
            >
              {loading ? (
                <span className="lp-btn-spinner" />
              ) : (
                <>
                  <span>Analyze</span>
                  <span className="lp-btn-arrow">→</span>
                </>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* Skeleton Dashboard Preview */}
      {loading && (
        <section className="lp-skeleton-section">
          <p className="lp-skeleton-label">Analyzing <strong>{compound}</strong>…</p>
          <div className="lp-skeleton-grid">
            <div className="lp-skeleton-card tall">
              <div className="sk-line w60" />
              <div className="sk-bar" />
              <div className="sk-line w40" />
              <div className="sk-line w80" />
            </div>
            <div className="lp-skeleton-card">
              <div className="sk-line w50" />
              <div className="sk-circle" />
              <div className="sk-line w70" />
            </div>
            <div className="lp-skeleton-card">
              <div className="sk-line w60" />
              <div className="sk-line w90" />
              <div className="sk-line w50" />
              <div className="sk-badge" />
            </div>
            <div className="lp-skeleton-card wide">
              <div className="sk-line w30" />
              <div className="sk-line w100" />
              <div className="sk-line w80" />
              <div className="sk-line w60" />
            </div>
          </div>
        </section>
      )}

      {/* Feature Cards */}
      {!loading && (
        <section className="lp-features">
          {FEATURES.map((f, i) => (
            <div className="lp-card" key={i} style={{ "--delay": `${i * 0.1}s` }}>
              <div className="lp-card-icon">{f.icon}</div>
              <h3 className="lp-card-title">{f.title}</h3>
              <p className="lp-card-desc">{f.desc}</p>
            </div>
          ))}
        </section>
      )}

      {/* Footer */}
      <footer className="lp-footer">
        Copyright &copy; www.ToxiScan.com. All rights reserved.
      </footer>
    </div>
  );
}