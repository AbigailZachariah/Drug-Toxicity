import re
import os
from google import genai

# ── Lazy Gemini initialization (reads key at call time, not import time) ──────
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


# ── Fallback rules (used when Gemini is unavailable) ─────────────────────────
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


# ── Build a rich context summary for Gemini ───────────────────────────────────
def _build_context_summary(context: dict) -> str:
    if not context:
        return "No prediction has been run yet."

    toxic_targets = [(k, v) for k, v in context.items() if v.get("prediction") == 1]
    safe_targets  = [(k, v) for k, v in context.items() if v.get("prediction") == 0]
    highest       = max(context.items(), key=lambda x: x[1].get("probability", 0))

    lines = [
        f"Total endpoints tested: {len(context)}",
        (f"Toxic endpoints ({len(toxic_targets)}): " +
            ", ".join(f"{k} ({v['probability']:.2f})" for k, v in toxic_targets))
            if toxic_targets else "Toxic endpoints: None",
        (f"Safe endpoints ({len(safe_targets)}): " +
            ", ".join(k for k, _ in safe_targets))
            if safe_targets else "Safe endpoints: None",
        f"Highest risk: {highest[0]} at {highest[1]['probability']:.2f} probability.",
    ]
    return "\n".join(lines)


# ── Gemini call ───────────────────────────────────────────────────────────────
def _ask_gemini(message: str, context: dict) -> str:
    client = _get_client()
    if not client:
        return None

    context_summary = _build_context_summary(context)

    prompt = f"""You are ToxiScan, an expert AI assistant for drug toxicity analysis.
You help scientists and researchers interpret molecular toxicity predictions.

Current prediction context:
{context_summary}

Guidelines:
- Be concise, clear, and scientifically accurate (2-4 sentences max).
- If the user asks about safety or risk, refer to the prediction context above.
- Explain toxicity endpoints in plain English when asked.
- Do not speculate beyond what the model results show.
- Never recommend medical or clinical decisions.
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
    if context and any(w in msg for w in [
        "result", "explain", "what", "mean", "score", "why", "show",
        "safe", "toxic", "risk", "dangerous", "harm", "compound"
    ]):
        toxic_targets = [k for k, v in context.items() if v.get("prediction") == 1]
        safe_targets  = [k for k, v in context.items() if v.get("prediction") == 0]
        highest       = max(context.items(), key=lambda x: x[1].get("probability", 0))

        if toxic_targets:
            return (
                f"The compound shows predicted toxicity in {len(toxic_targets)} of 12 endpoints: "
                f"{', '.join(toxic_targets)}. "
                f"Highest risk: {highest[0]} at {highest[1]['probability']:.2f} probability. "
                f"Safe across: {', '.join(safe_targets[:3])}{'...' if len(safe_targets) > 3 else ''}."
            )
        return "Great news! The compound is predicted safe across all 12 toxicity endpoints."

    # Fallback: plain keyword match
    reply = _keyword_response(msg)
    if reply:
        return reply

    return ("I can explain toxicity endpoints, SMILES notation, Morgan fingerprints, or AUC scores. "
            "What would you like to know?")