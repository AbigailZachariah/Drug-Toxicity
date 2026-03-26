from flask import Flask, request, jsonify
from flask_cors import CORS
from utils.preprocess import smiles_to_fingerprint
from utils.chatbot import get_chatbot_response
import pickle, os, numpy as np
from dotenv import load_dotenv
load_dotenv()
import os

app = Flask(__name__)
CORS(app)

print("KEY LOADED:", os.getenv("GEMINI_API_KEY"))
# ── Load models once at startup ──────────────────────────────────────────────
BASE = os.path.dirname(__file__)
with open(f"{BASE}/model/rf_models.pkl",   "rb") as f: MODELS      = pickle.load(f)
with open(f"{BASE}/model/target_cols.pkl", "rb") as f: TARGET_COLS = pickle.load(f)

print(f"✅ Loaded {len(TARGET_COLS)} models: {TARGET_COLS}")

TARGET_DESCRIPTIONS = {
    "NR-AR":          "Androgen receptor — hormonal disruption",
    "NR-AR-LBD":      "Androgen receptor ligand binding domain",
    "NR-AhR":         "Aryl hydrocarbon receptor — dioxin-like toxicity",
    "NR-Aromatase":   "Aromatase enzyme inhibition",
    "NR-ER":          "Estrogen receptor — endocrine disruption",
    "NR-ER-LBD":      "Estrogen receptor ligand binding domain",
    "NR-PPAR-gamma":  "PPAR-gamma — metabolic disruption",
    "SR-ARE":         "Oxidative stress response",
    "SR-ATAD5":       "DNA damage / genotoxicity",
    "SR-HSE":         "Heat shock response",
    "SR-MMP":         "Mitochondrial membrane — cell death",
    "SR-p53":         "DNA damage pathway — tumour suppressor",
}


# ══════════════════════════════════════════════════════════════════════════════
#  ROUTES
# ══════════════════════════════════════════════════════════════════════════════

@app.route("/predict", methods=["POST"])
def predict():
    data   = request.get_json() or {}
    smiles = data.get("smiles", "").strip()

    if not smiles:
        return jsonify({"error": "SMILES string is required"}), 400

    try:
        features = smiles_to_fingerprint(smiles)   # → (1, 2048)
        results  = {}

        for target in TARGET_COLS:
            model = MODELS[target]
            pred  = int(model.predict(features)[0])
            prob  = round(float(model.predict_proba(features)[0][1]), 4)
            results[target] = {
                "prediction":  pred,
                "probability": prob,
                "label":       "Toxic" if pred == 1 else "Safe"
            }

        toxic_count = sum(1 for v in results.values() if v["prediction"] == 1)
        mean_prob   = round(float(np.mean([v["probability"] for v in results.values()])), 4)

        return jsonify({
            "smiles":  smiles,
            "results": results,
            "summary": {
                "toxic_count": toxic_count,
                "safe_count":  len(TARGET_COLS) - toxic_count,
                "mean_prob":   mean_prob,
                "total":       len(TARGET_COLS)
            }
        })

    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": f"Prediction failed: {str(e)}"}), 500


@app.route("/chat", methods=["POST"])
def chat():
    data    = request.get_json() or {}
    message = data.get("message", "").strip()
    context = data.get("context", {})

    if not message:
        return jsonify({"error": "Message is required"}), 400

    return jsonify({"response": get_chatbot_response(message, context)})


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "targets": TARGET_COLS, "count": len(TARGET_COLS)})


@app.route("/targets", methods=["GET"])
def targets():
    return jsonify({t: TARGET_DESCRIPTIONS.get(t, t) for t in TARGET_COLS})


# ══════════════════════════════════════════════════════════════════════════════
if __name__ == "__main__":
    app.run(debug=True, port=5000)