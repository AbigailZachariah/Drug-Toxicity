# 🧬 ToxiScan — AI-Powered Chemical Toxicity Analysis

> Predict the toxicity of any chemical compound across 12 biological pathways using machine learning trained on the Tox21 dataset.

---

## 🚀 Live Demo

Enter any molecule as a **SMILES string** and instantly get:

* Toxicity predictions across 12 biological endpoints
* A unified **Toxicity Score (0–100)**
* Environmental impact analysis 🌱
* AI-generated explanation 🤖

---

## 🧪 What is ToxiScan?

**ToxiScan** is a full-stack AI tool that simulates early-stage toxicity screening used in drug discovery.

Given a chemical compound, it:

* Converts SMILES → **2048-bit Morgan Fingerprint (RDKit)**
* Runs through **12 trained Random Forest models**
* Outputs **toxicity probabilities per endpoint**
* Computes a **weighted Toxicity Score**
* Provides **eco-impact insights (air, water, soil)**
* Explains results via an **AI chatbot**

---

## 🏗️ Tech Stack

| Layer           | Technology                   |
| --------------- | ---------------------------- |
| Frontend        | React + Vite                 |
| Backend         | Flask (Python)               |
| ML Models       | Scikit-learn (Random Forest) |
| Cheminformatics | RDKit                        |
| AI Chatbot      | Gemini API                   |
| Dataset         | Tox21 (7,831 molecules)      |

---

## 📦 Model Access (IMPORTANT)

Due to GitHub’s file size limitations (>100MB), the trained models are hosted externally.

👉 **Download Models Here:**
https://drive.google.com/drive/folders/1QYF0cU5R-GkeNnUg4991_RulL6SXDkOG?usp=sharing

### 📥 Setup Instructions for Model

1. Download the files from the Drive link
2. Create a folder:

```
backend/model/
```

3. Place the files inside:

```
backend/model/rf_models.pkl
backend/model/target_cols.pkl
```

---

## 📊 Model Performance

| Endpoint      | Description               | AUC        |
| ------------- | ------------------------- | ---------- |
| NR-AR         | Androgen receptor         | 0.7752     |
| NR-AR-LBD     | Ligand binding            | 0.8717     |
| NR-AhR        | Aryl hydrocarbon receptor | 0.8721     |
| NR-Aromatase  | Enzyme inhibition         | 0.7471     |
| NR-ER         | Estrogen receptor         | 0.7442     |
| NR-ER-LBD     | Ligand binding            | 0.8369     |
| NR-PPAR-gamma | Metabolic disruption      | 0.8444     |
| SR-ARE        | Oxidative stress          | 0.7913     |
| SR-ATAD5      | DNA damage                | 0.7914     |
| SR-HSE        | Heat shock response       | 0.7713     |
| SR-MMP        | Mitochondrial membrane    | 0.8579     |
| SR-p53        | Tumor suppression         | 0.8613     |
| **Mean AUC**  |                           | **0.8137** |

---

## 🔬 How It Works

```
SMILES Input
    ↓
Morgan Fingerprint (2048-bit)
    ↓
12 Random Forest Models
    ↓
12 Probability Scores
    ↓
Toxicity Score (0–100)
```

---

## ⚖️ Risk Interpretation

### Probability → Risk

| Range  | Label        |
| ------ | ------------ |
| ≥ 0.30 | 🔴 High Risk |
| ≥ 0.15 | 🟡 Moderate  |
| < 0.15 | 🟢 Low       |

### Toxicity Score

```
score = (0.6 × max_prob + 0.4 × mean_prob) × 100
      + (5 × high_risk_count)
      + (2 × moderate_count)
```

---

## 🚨 Danger Levels

| Score | Label        |
| ----- | ------------ |
| < 20  | ✅ Safe       |
| 20–34 | 🟡 Low Risk  |
| 35–49 | ⚠️ Moderate  |
| 50–74 | 🔶 High Risk |
| 75+   | 🚨 Critical  |

---

## 📁 Project Structure

```
Drug-Toxicity/
├── backend/
│   ├── app.py
│   ├── retrain.py
│   ├── model/                # (downloaded separately)
│   └── utils/
│       ├── preprocess.py
│       └── chatbot.py
├── frontend/
│   ├── src/
│   └── public/
├── README.md
```

---

## 🛠️ Setup & Installation

### 1️⃣ Clone Repository

```bash
git clone https://github.com/AbigailZachariah/Drug-Toxicity.git
cd Drug_Toxicity
```

---

### 2️⃣ Backend Setup

```bash
cd backend
pip install -r requirements.txt
```

Create `.env` file:

```
GEMINI_API_KEY=your_api_key_here
```

Run backend:

```bash
python app.py
```

---

### 3️⃣ Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

## 🔌 API Endpoints

### POST `/predict`

Input:

```json
{ "smiles": "CCO" }
```

Output:

* Toxicity per endpoint
* Overall score
* Summary statistics

---

### POST `/chat`

AI explanation of toxicity results

---

### GET `/health`

Check server + model status

---

### GET `/targets`

List all toxicity endpoints

---

## 🧫 Sample Inputs

| Compound   | SMILES                | Expected |
| ---------- | --------------------- | -------- |
| Ethanol    | CCO                   | Safe     |
| Aspirin    | CC(=O)Oc1ccccc1C(=O)O | Low      |
| Coumestrol | complex               | Moderate |
| Dioxin     | complex               | Toxic    |

---

## ⚠️ Disclaimer

This is a **research/educational tool**.
Do NOT use for real-world safety decisions without experimental validation.

---

## 🏆 Hackathon Notes

* Model hosted externally due to size constraints
* Fully reproducible via `retrain.py`
* Clean modular full-stack architecture
* Ready for deployment

---

## 📄 License

MIT License

---

## 💡 Final Note

This project demonstrates:

* Applied Machine Learning
* Full-stack development
* Real-world scientific problem solving

---
