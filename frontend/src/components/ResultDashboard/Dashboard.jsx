import { useLocation, useNavigate } from "react-router-dom";
import DangerBadge  from "./DangerBadge";
import ToxicityBar  from "./ToxicityBar";
import EcoCard      from "./EcoCard";
import Explaination from "./Explaination";
import ChatInterface from "./ChatInterface";
import "./Dashboard.css";

function getToxicityProps(summary) {
  // ✅ FIXED: Use summary.score from API instead of recalculating from mean_prob
  const score = summary?.score ?? Math.round((summary?.mean_prob || 0) * 100);
  const risk  = score <= 25 ? "Low" : score <= 50 ? "Moderate"
              : score <= 70 ? "High" : score <= 85 ? "Very High" : "Critical";
  return {
    score,
    label: `${summary?.toxic_count || 0} of ${summary?.total || 12} endpoints predicted toxic. Overall risk: ${risk}.`
  };
}

function getDangerLevel(summary) {
  const toxicCount = summary?.toxic_count || 0;
  const score      = summary?.score       || 0;

  if (toxicCount === 0 && score < 20) return "safe";
  if (score < 35)                     return "low";
  if (score < 50)                     return "moderate";
  if (score < 75)                     return "high";
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

  // ✅ FIXED: Filter by label "High Risk" or "Moderate", not just prediction === 1
  const riskyTargets = Object.entries(results)
    .filter(([, v]) => v.label === "High Risk" || v.label === "Moderate")
    .sort((a, b) => b[1].probability - a[1].probability);

  const highRiskTargets = riskyTargets.filter(([, v]) => v.label === "High Risk");

  const toxicCount = summary?.toxic_count    || 0;
  const safeCount  = summary?.safe_count     || 0;
  const score      = summary?.score          || 0;
  const worst      = summary?.worst_endpoint || riskyTargets[0]?.[0] || "N/A";
  const worstProb  = results[worst]?.probability || 0;

  const explanation = toxicCount === 0 && riskyTargets.length === 0
    ? `This compound appears safe across all 12 Tox21 biological endpoints. Mean toxicity probability is ${((summary?.mean_prob||0)*100).toFixed(1)}%, well below the 30% threshold for any endpoint.`
    : `This compound triggers ${toxicCount} High Risk endpoint(s) and ${riskyTargets.length - toxicCount} Moderate endpoint(s) out of 12 Tox21 assays. The highest risk is ${worst} at ${(worstProb * 100).toFixed(0)}% probability. Toxicity score: ${score}/100. It appears safe across ${safeCount} endpoints.`;

  const DESCRIPTIONS = {
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
  };

  const highlights = riskyTargets.length === 0
    ? [
        "All 12 toxicity endpoints below threshold",
        `Mean risk probability: ${((summary?.mean_prob||0)*100).toFixed(1)}%`,
        "No nuclear receptor or stress pathway activation detected",
      ]
    : riskyTargets.slice(0, 5).map(([target, v]) => {
        const desc = DESCRIPTIONS[target] || target;
        return `${desc} — ${(v.probability * 100).toFixed(0)}% probability [${v.label}]`;
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
  const dangerLevel      = getDangerLevel(summary);         // ✅ pass full summary
  const ecoProps         = getEcoProps(results);
  const explanationProps = getExplanationProps(smiles, results, summary);

  // ── Rich context for Gemini chatbot ────────────────────────────────────────
  const chatContext = {
    toxicity: results,
    summary: {
      toxic_count:    summary?.toxic_count    || 0,
      moderate_count: summary?.moderate_count || 0,
      safe_count:     summary?.safe_count     || 0,
      mean_prob:      summary?.mean_prob      || 0,
      max_prob:       summary?.max_prob       || 0,
      score:          summary?.score          || 0,
      worst_endpoint: summary?.worst_endpoint || "",
      total:          summary?.total          || 12,
      risk_level:     toxicityProps.label,
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