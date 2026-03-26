import { useLocation, useNavigate } from "react-router-dom";
import DangerBadge from "./DangerBadge";
import ToxicityBar from "./ToxicityBar";
import EcoCard from "./EcoCard";
import Explaination from "./Explaination";
import ChatInterface from "./ChatInterface";
import "./Dashboard.css";
 
// Mock data — replace with real API response from your team
const getMockData = (compound) => ({
  compound: compound || "Benzene",
  dangerLevel: "high",
  toxicityScore: 78,
  toxicityLabel: "This compound exhibits significant cytotoxic behavior.",
  eco: { soil: 65, water: 80, air: 45, biodegradable: false },
  explanation:
    "Benzene is a known human carcinogen classified under Group 1 by IARC. It disrupts normal blood cell production in bone marrow and causes chromosomal damage. Chronic exposure leads to leukemia and other blood disorders. It is volatile, highly flammable, and poorly biodegradable, persisting in soil and groundwater.",
  highlights: [
    "IARC Group 1 — confirmed human carcinogen",
    "Disrupts bone marrow and blood cell production",
    "Highly volatile — significant inhalation risk",
    "Persists in groundwater for extended periods",
    "Flammable — store away from ignition sources",
  ],
});
 
export default function Dashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const compound = location.state?.compound || "Benzene";
  const data = getMockData(compound);
 
  return (
    <div className="db-root">
      {/* ── HEADER ── */}
      <header className="db-header">
        <div className="db-header-left">
          <span className="db-compound-name">{data.compound}</span>
          <span className="db-compound-sub">Chemical Analysis Report</span>
        </div>
        <div className="db-header-right">
          <DangerBadge level={data.dangerLevel} />
        </div>
      </header>
 
      {/* ── MAIN ── */}
      <main className="db-main">
        {/* Left Column — 70% */}
        <div className="db-left">
          <div className="db-glass-card">
            <ToxicityBar score={data.toxicityScore} label={data.toxicityLabel} />
          </div>
          <div className="db-glass-card">
            <EcoCard
              soil={data.eco.soil}
              water={data.eco.water}
              air={data.eco.air}
              biodegradable={data.eco.biodegradable}
            />
          </div>
          <div className="db-glass-card db-glass-card--large">
            <Explaination
              compound={data.compound}
              explanation={data.explanation}
              highlights={data.highlights}
            />
          </div>
        </div>
 
        {/* Right Column — 30% */}
        <div className="db-right">
          <ChatInterface compound={data.compound} />
        </div>
      </main>
 
      {/* ── FOOTER ── */}
      <footer className="db-footer">
        <button className="db-new-search" onClick={() => navigate("/")}>
          ← New Search
        </button>
        <span className="db-footer-note">© {new Date().getFullYear()} ToxiScan · AI-powered toxicity analysis</span>
      </footer>
    </div>
  );
}