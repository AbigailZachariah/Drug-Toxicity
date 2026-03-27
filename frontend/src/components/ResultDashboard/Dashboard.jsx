import { useLocation, useNavigate } from "react-router-dom";
import DangerBadge  from "./DangerBadge";
import ToxicityBar  from "./ToxicityBar";
import EcoCard      from "./EcoCard";
import Explaination from "./Explaination";
import ChatInterface from "./ChatInterface";
import "./Dashboard.css";

function getToxicityProps(summary) {
  const score = Math.round((summary?.mean_prob || 0) * 100);
  const risk  = score <= 25 ? "Low" : score <= 50 ? "Moderate"
              : score <= 70 ? "High" : score <= 85 ? "Very High" : "Critical";
  return {
    score,
    label: `${summary?.toxic_count || 0} of ${summary?.total || 12} endpoints predicted toxic. Overall risk: ${risk}.`
  };
}

function getDangerLevel(toxicCount) {
  if (toxicCount === 0)  return "safe";
  if (toxicCount <= 2)   return "low";
  if (toxicCount <= 5)   return "moderate";
  if (toxicCount <= 9)   return "high";
  return "critical";
}

function getEcoProps(results) {
  if (!results) return { soil: 0, water: 0, air: 0, biodegradable: false };
  const pct = (key) => Math.round((results[key]?.probability || 0) * 100);
  const soil  = pct("SR-ARE");
  const water = pct("SR-MMP");
  const air   = pct("NR-AhR");
  const biodegradable = (soil + water + air) / 3 < 40;
  return { soil, water, air, biodegradable };
}

function getExplanationProps(smiles, results, summary) {
  if (!results) return { compound: smiles, explanation: "", highlights: [] };

  const toxicTargets = Object.entries(results)
    .filter(([, v]) => v.prediction === 1)
    .sort((a, b) => b[1].probability - a[1].probability);

  const safeCount  = summary?.safe_count  || 0;
  const toxicCount = summary?.toxic_count || 0;

  const explanation = toxicCount === 0
    ? `This compound appears safe across all 12 Tox21 biological endpoints. Mean toxicity probability is ${((summary?.mean_prob||0)*100).toFixed(1)}%, well below the 50% threshold for any endpoint.`
    : `This compound triggers ${toxicCount} of 12 Tox21 toxicity endpoints. The highest risk is ${toxicTargets[0]?.[0]} at ${((toxicTargets[0]?.[1]?.probability||0)*100).toFixed(0)}% probability. It appears safe across ${safeCount} endpoints.`;

  const highlights = toxicCount === 0
    ? [
        "All 12 toxicity endpoints below threshold",
        `Mean risk probability: ${((summary?.mean_prob||0)*100).toFixed(1)}%`,
        "No nuclear receptor or stress pathway activation detected",
      ]
    : toxicTargets.slice(0, 5).map(([target, v]) => {
        const desc = {
          "NR-AR":         "Androgen receptor — hormonal disruption",
          "NR-AR-LBD":     "Androgen receptor ligand binding",
          "NR-AhR":        "Aryl hydrocarbon — dioxin-like toxicity",
          "NR-Aromatase":  "Aromatase enzyme inhibition",
          "NR-ER":         "Estrogen receptor — endocrine disruption",
          "NR-ER-LBD":     "Estrogen receptor ligand binding",
          "NR-PPAR-gamma": "PPAR-gamma — metabolic disruption",
          "SR-ARE":        "Oxidative stress response",
          "SR-ATAD5":      "DNA damage / genotoxicity",
          "SR-HSE":        "Heat shock response",
          "SR-MMP":        "Mitochondrial membrane — cell death",
          "SR-p53":        "DNA damage — tumour suppressor",
        }[target] || target;
        return `${desc} — ${(v.probability * 100).toFixed(0)}% probability`;
      });

  return { compound: smiles, explanation, highlights };
}


export default function Dashboard() {
  const location = useLocation();
  const navigate = useNavigate();

  const smiles  = location.state?.compound || "";
  const apiData = location.state?.data     || null;
  const results = apiData?.results         || null;
  const summary = apiData?.summary         || null;

  if (!apiData) {
    navigate("/");
    return null;
  }

  const toxicityProps    = getToxicityProps(summary);
  const dangerLevel      = getDangerLevel(summary?.toxic_count || 0);
  const ecoProps         = getEcoProps(results);
  const explanationProps = getExplanationProps(smiles, results, summary);

  // ── Rich context for Gemini chatbot ────────────────────────────────────────
  const chatContext = {
    toxicity: results,
    summary: {
      toxic_count: summary?.toxic_count || 0,
      safe_count:  summary?.safe_count  || 0,
      mean_prob:   summary?.mean_prob   || 0,
      total:       summary?.total       || 12,
      risk_level:  toxicityProps.label,
    },
    eco: {
      soil_impact:   ecoProps.soil,
      water_impact:  ecoProps.water,
      air_impact:    ecoProps.air,
      biodegradable: ecoProps.biodegradable,
      soil_source:   "SR-ARE (oxidative stress proxy)",
      water_source:  "SR-MMP (mitochondrial toxicity proxy)",
      air_source:    "NR-AhR (aryl hydrocarbon receptor proxy)",
    },
    compound: {
      smiles,
      danger_level: dangerLevel,
    },
  };

  return (
    <div className="db-root">
      <header className="db-header">
        <div className="db-header-left">
          <span className="db-compound-name">{smiles}</span>
          <span className="db-compound-sub">Chemical Analysis Report</span>
        </div>
        <div className="db-header-right">
          <DangerBadge level={dangerLevel} />
        </div>
      </header>

      <main className="db-main">
        <div className="db-left">
          <div className="db-glass-card">
            <ToxicityBar score={toxicityProps.score} label={toxicityProps.label} />
          </div>
          <div className="db-glass-card">
            <EcoCard
              soil={ecoProps.soil}
              water={ecoProps.water}
              air={ecoProps.air}
              biodegradable={ecoProps.biodegradable}
            />
          </div>
          <div className="db-glass-card db-glass-card--large">
            <Explaination
              compound={explanationProps.compound}
              explanation={explanationProps.explanation}
              highlights={explanationProps.highlights}
            />
          </div>
        </div>

        <div className="db-right">
          {/* ✅ passing full chatContext including eco + biodegradability */}
          <ChatInterface compound={smiles} context={chatContext} />
        </div>
      </main>

      <footer className="db-footer">
        <button className="db-new-search" onClick={() => navigate("/")}>
          ← New Search
        </button>
        <span className="db-footer-note">
          © {new Date().getFullYear()} ToxiScan · AI-powered toxicity analysis
        </span>
      </footer>
    </div>
  );
}