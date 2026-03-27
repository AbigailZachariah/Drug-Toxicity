import re
import os
from google import genai

# ── Lazy Gemini initialization ────────────────────────────────────────────────
_client = None

def _get_client():
    global _client
    if _client is None:
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            return None
        _client = genai.Client(api_key=api_key)
        print("[ToxiScan] ✅ Gemini client initialized.")
    return _client


# ── Fallback rules ────────────────────────────────────────────────────────────
RULES = {
    "smiles":        "SMILES is a text notation for molecular structures. Example: CCO = ethanol.",
    "morgan":        "Morgan fingerprints encode circular substructures into 2048 binary bits.",
    "fingerprint":   "A fingerprint is a binary vector where each bit = presence of a chemical substructure.",
    "tox21":         "Tox21 covers 12 endpoints: NR-AR, NR-AR-LBD, NR-AhR, NR-Aromatase, NR-ER, NR-ER-LBD, NR-PPAR-gamma, SR-ARE, SR-ATAD5, SR-HSE, SR-MMP, SR-p53.",
    "nr-ar":         "NR-AR tests androgen receptor activation — linked to hormonal disruption.",
    "sr-mmp":        "SR-MMP tests mitochondrial membrane disruption — a sign of cell toxicity.",
    "sr-p53":        "SR-p53 tests DNA damage response pathway activation.",
    "nr-ahr":        "NR-AhR tests aryl hydrocarbon receptor — linked to dioxin-like toxicity.",
    "auc":           "Our model achieves mean AUC of 0.81. AUC of 1.0 is perfect; 0.5 is random guessing.",
    "random forest": "Random Forest trains 100 decision trees and takes a majority vote per prediction.",
    "toxic":         "A probability above 0.5 means the model predicts toxicity for that endpoint.",
    "eco":           "Eco-toxicity measures harm to aquatic organisms: algae, daphnia, and fish.",
    "predict":       "Enter any valid SMILES string to predict toxicity across 12 biological targets.",
    "hello":         "Hi! I'm your drug toxicity assistant. Paste a SMILES string to get predictions.",
    "hi":            "Hello! Ask me about toxicity endpoints, SMILES, or how to interpret your results.",
    "help":          "I can explain: SMILES, toxicity endpoints, AUC scores, Morgan fingerprints, or results.",
}


# ── Build rich context summary ────────────────────────────────────────────────
def _build_context_summary(context: dict) -> str:
    if not context:
        return "No prediction has been run yet."

    lines = []

    # ── Compound ──
    compound = context.get("compound", {})
    if compound:
        lines.append(f"Compound SMILES: {compound.get('smiles', 'unknown')}")
        lines.append(f"Overall danger level: {compound.get('danger_level', 'unknown')}")

    # ── Toxicity summary ──
    summary = context.get("summary", {})
    if summary:
        lines.append(f"\nToxicity Summary:")
        lines.append(f"  - {summary.get('toxic_count', 0)} of {summary.get('total', 12)} endpoints predicted toxic")
        lines.append(f"  - {summary.get('safe_count', 0)} endpoints predicted safe")
        lines.append(f"  - Mean toxicity probability: {summary.get('mean_prob', 0):.2%}")
        lines.append(f"  - Risk level: {summary.get('risk_level', 'unknown')}")

    # ── Endpoint detail ──
    toxicity = context.get("toxicity", {})
    if toxicity:
        toxic_targets = sorted(
            [(k, v) for k, v in toxicity.items() if v.get("prediction") == 1],
            key=lambda x: x[1].get("probability", 0), reverse=True
        )
        safe_targets = [(k, v) for k, v in toxicity.items() if v.get("prediction") == 0]

        if toxic_targets:
            lines.append(f"\nToxic endpoints ({len(toxic_targets)}):")
            for k, v in toxic_targets:
                lines.append(f"  - {k}: {v.get('probability', 0):.2%} probability")
        else:
            lines.append("\nToxic endpoints: None")

        if safe_targets:
            lines.append(f"\nSafe endpoints ({len(safe_targets)}):")
            lines.append(f"  - {', '.join(k for k, _ in safe_targets)}")

    # ── Eco impact ──
    eco = context.get("eco", {})
    if eco:
        biodeg = eco.get("biodegradable", False)
        soil   = eco.get("soil_impact", 0)
        water  = eco.get("water_impact", 0)
        air    = eco.get("air_impact", 0)

        def level(v):
            return "Low" if v <= 30 else "Moderate" if v <= 60 else "High"

        lines.append(f"\nEco Impact:")
        lines.append(f"  - Soil impact:  {soil}%  ({level(soil)})  — based on oxidative stress (SR-ARE)")
        lines.append(f"  - Water impact: {water}% ({level(water)}) — based on mitochondrial toxicity (SR-MMP)")
        lines.append(f"  - Air impact:   {air}%  ({level(air)})  — based on aryl hydrocarbon receptor (NR-AhR)")
        lines.append(f"  - Biodegradable: {'Yes' if biodeg else 'No'}")
        if not biodeg:
            lines.append("  - This compound is predicted NON-BIODEGRADABLE.")
            lines.append("  - It may persist in soil and water, potentially accumulating in the food chain.")
            lines.append("  - Environmental persistence is inferred from high oxidative stress and mitochondrial toxicity scores.")

    return "\n".join(lines)


# ── Gemini call ───────────────────────────────────────────────────────────────
def _ask_gemini(message: str, context: dict) -> str:
    client = _get_client()
    if not client:
        return None

    context_summary = _build_context_summary(context)

    prompt = f"""You are ToxiScan, an expert AI assistant for chemical and drug toxicity analysis.
You help scientists, researchers, and safety officers understand molecular toxicity predictions.

Current prediction data for this compound:
{context_summary}

Answer guidelines:
- Be concise and scientifically accurate (2-4 sentences).
- For biodegradability questions: use the eco impact section above to explain why it is or isn't biodegradable.
- For safety/handling questions: give practical advice based on the toxic endpoints.
- For water/soil/air questions: refer to the eco impact percentages above.
- For long-term effects: discuss the implications of the triggered endpoints.
- For "why" questions: explain the molecular reasoning behind the predictions.
- Do not recommend medical or clinical decisions.
- If no prediction context exists, ask the user to paste a SMILES string first.

User question: {message}"""

    response = client.models.generate_content(
        model="models/gemini-2.5-flash",
        contents=prompt
    )
    return response.text.strip()


# ── Fallback keyword matcher ──────────────────────────────────────────────────
def _keyword_response(msg: str) -> str | None:
    for keyword, reply in RULES.items():
        if re.search(rf"\b{re.escape(keyword)}\b", msg):
            return reply
    return None


# ── Main entry point ──────────────────────────────────────────────────────────
def get_chatbot_response(message: str, context: dict) -> str:
    msg = message.lower().strip()

    if not msg:
        return "Please type a question about the compound or toxicity endpoints."

    # Try Gemini first
    try:
        gemini_response = _ask_gemini(message, context)
        if gemini_response:
            return gemini_response
    except Exception as e:
        print(f"[Gemini error] {e} — falling back to keyword matching")

    # Fallback: context-aware response
    toxicity = context.get("toxicity", context)
    if toxicity and any(w in msg for w in [
        "result", "explain", "what", "mean", "score", "why", "show",
        "safe", "toxic", "risk", "dangerous", "harm", "compound",
        "biodeg", "water", "soil", "air", "eco", "safety", "handle",
        "effect", "long", "term", "environment", "persist"
    ]):
        toxic_targets = [k for k, v in toxicity.items() if isinstance(v, dict) and v.get("prediction") == 1]
        safe_targets  = [k for k, v in toxicity.items() if isinstance(v, dict) and v.get("prediction") == 0]

        if toxic_targets:
            highest = max(
                ((k, v) for k, v in toxicity.items() if isinstance(v, dict)),
                key=lambda x: x[1].get("probability", 0)
            )
            return (
                f"The compound shows predicted toxicity in {len(toxic_targets)} of 12 endpoints: "
                f"{', '.join(toxic_targets)}. "
                f"Highest risk: {highest[0]} at {highest[1]['probability']:.2f} probability. "
                f"Safe across: {', '.join(safe_targets[:3])}{'...' if len(safe_targets) > 3 else ''}."
            )
        return "The compound is predicted safe across all 12 toxicity endpoints."

    # Fallback: plain keyword match
    reply = _keyword_response(msg)
    if reply:
        return reply

    return ("I can explain toxicity endpoints, SMILES notation, Morgan fingerprints, or AUC scores. "
            "What would you like to know?")