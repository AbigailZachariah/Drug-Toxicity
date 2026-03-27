# 🧬 ToxiScan — AI-Powered Chemical Toxicity Analysis

> Predict the toxicity of any chemical compound across 12 biological pathways using machine learning trained on the Tox21 government dataset.

---

## 🚀 Live Demo

Enter any molecule as a SMILES string and get an instant toxicity report with risk scoring, eco-impact analysis, and an AI chatbot explanation.

---

## 🧪 What is ToxiScan?

ToxiScan is a full-stack toxicity screening tool that replicates what pharmaceutical companies use in early drug discovery. Given any chemical compound, it:

- Converts it to a **2048-bit Morgan Fingerprint** using RDKit
- Runs it through **12 trained Random Forest classifiers**
- Returns **probability scores** across 12 Tox21 biological targets
- Calculates a **weighted Toxicity Score (0–100)**
- Displays **eco-impact** (soil, water, air) and **biodegradability**
- Explains results via a **Gemini-powered AI chatbot**

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite |
| Backend | Flask (Python) |
| ML Models | Scikit-learn Random Forest |
| Cheminformatics | RDKit |
| AI Chatbot | Google Gemini API |
| Dataset | Tox21 (US Government, 7,831 molecules) |

---

## 📊 Model Performance

12 independent Random Forest models were trained — one per toxicity endpoint.

| Endpoint | Description | AUC |
|---|---|---|
| NR-AR | Androgen receptor | 0.7752 ✅ |
| NR-AR-LBD | Androgen receptor ligand binding | 0.8717 ✅✅ |
| NR-AhR | Aryl hydrocarbon receptor | 0.8721 ✅✅ |
| NR-Aromatase | Aromatase enzyme inhibition | 0.7471 ✅ |
| NR-ER | Estrogen receptor | 0.7442 ✅ |
| NR-ER-LBD | Estrogen receptor ligand binding | 0.8369 ✅✅ |
| NR-PPAR-gamma | PPAR-gamma metabolic disruption | 0.8444 ✅✅ |
| SR-ARE | Oxidative stress response | 0.7913 ✅ |
| SR-ATAD5 | DNA damage / genotoxicity | 0.7914 ✅ |
| SR-HSE | Heat shock response | 0.7713 ✅ |
| SR-MMP | Mitochondrial membrane | 0.8579 ✅✅ |
| SR-p53 | DNA damage / tumour suppressor | 0.8613 ✅✅ |
| **Mean AUC** | | **0.8137 ✅✅** |

> AUC of 0.5 = random guessing · AUC of 1.0 = perfect · Our mean of **0.81 is genuinely useful** for early-stage screening.

---

## 🔬 How the Model Works

```
Any Molecule (SMILES)
      ↓
  RDKit converts to 2048-bit Morgan Fingerprint
      ↓
  12 Random Forest Classifiers
      ↓
  12 Toxicity Probabilities (0.0 → 1.0)
      ↓
  Weighted Toxicity Score (0 → 100)
```

**Risk Thresholds:**

| Probability | Label |
|---|---|
| ≥ 0.30 | 🔴 High Risk |
| ≥ 0.15 | 🟡 Moderate |
| < 0.15 | 🟢 Low |

**Toxicity Score Formula:**
```
score = (0.6 × max_prob + 0.4 × mean_prob) × 100
      + (5 × high_risk_count) + (2 × moderate_count)

Minimum score of 40 if any High Risk endpoint is triggered.
```

**Danger Badge Levels:**

| Score | Badge |
|---|---|
| < 20, 0 endpoints | ✅ Safe |
| 20–34 | 🟡 Low Risk |
| 35–49 | ⚠️ Moderate |
| 50–74 | 🔶 High Risk |
| 75+ | 🚨 Toxic / Critical |

---

## ⚙️ Project Structure

```
toxiscan/
├── app.py                  # Flask API server
├── retrain.py              # Model training script
├── model/
│   ├── rf_models.pkl       # 12 trained Random Forest models
│   └── target_cols.pkl     # Target column names
├── utils/
│   ├── preprocess.py       # SMILES → fingerprint conversion
│   └── chatbot.py          # Gemini chatbot integration
├── frontend/               # React + Vite app
│   ├── src/
│   │   ├── Dashboard.jsx
│   │   ├── DangerBadge.jsx
│   │   ├── ToxicityBar.jsx
│   │   ├── EcoCard.jsx
│   │   ├── ChatInterface.jsx
│   │   └── Explaination.jsx
└── .env                    # API keys (not committed)
```

---

## 🛠️ Setup & Installation

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/toxiscan.git
cd toxiscan
```

### 2. Install Python dependencies
```bash
pip install flask flask-cors rdkit scikit-learn pandas numpy python-dotenv google-generativeai
```

### 3. Set up environment variables
Create a `.env` file in the root:
```
GEMINI_API_KEY=your_gemini_api_key_here
```

### 4. Train the models (first time only)
```bash
python retrain.py
```
This downloads the Tox21 dataset and trains 12 Random Forest models. Takes ~2–5 minutes.

### 5. Start the Flask backend
```bash
python app.py
```
Backend runs at `http://localhost:5000`

### 6. Start the React frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend runs at `http://localhost:5173`

---

## 🔌 API Reference

### `POST /predict`
Predict toxicity for a SMILES string.

**Request:**
```json
{ "smiles": "CCO" }
```

**Response:**
```json
{
  "smiles": "CCO",
  "results": {
    "NR-AhR": { "prediction": 0, "probability": 0.12, "label": "Low" },
    ...
  },
  "summary": {
    "toxic_count": 0,
    "moderate_count": 1,
    "safe_count": 11,
    "mean_prob": 0.08,
    "max_prob": 0.12,
    "score": 10.4,
    "worst_endpoint": "NR-AhR",
    "total": 12
  }
}
```

### `POST /chat`
Ask the AI chatbot about a compound's toxicity.

**Request:**
```json
{ "message": "Is this safe to handle?", "context": { ... } }
```

### `GET /health`
Check server status and loaded models.

### `GET /targets`
Get descriptions of all 12 toxicity endpoints.

---

## 🧫 Example Compounds to Test

| Compound | SMILES | Expected Risk |
|---|---|---|
| Ethanol | `CCO` | ✅ Safe |
| Aspirin | `CC(=O)Oc1ccccc1C(=O)O` | 🟡 Low |
| Coumestrol | `O=c1oc2ccc(O)cc2c2cc(O)ccc12` | ⚠️ Moderate |
| Beta-Naphthoflavone | `O=c1cc(-c2ccc3ccccc3c2)oc2ccccc12` | 🔶 High Risk |
| TCDD (Dioxin) | `Clc1cc2oc3cc(Cl)c(Cl)cc3oc2cc1Cl` | 🚨 Toxic |

---

## ⚠️ Disclaimer

ToxiScan is a **research and educational tool**. Predictions are based on a machine learning model trained on Tox21 data and should **not** be used as the sole basis for safety decisions. Always validate with experimental testing before any real-world use.

---

## 📄 License

MIT License — free to use, modify, and distribute.

---

*Built with RDKit, Scikit-learn, Flask, React, and the Tox21 dataset from the US National Toxicology Program.*