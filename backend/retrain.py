import pandas as pd
import numpy as np
import pickle
from rdkit import Chem
from rdkit.Chem import AllChem
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import roc_auc_score

URL = "https://deepchemdata.s3-us-west-1.amazonaws.com/datasets/tox21.csv.gz"

TARGET_COLS = [
    "NR-AR", "NR-AR-LBD", "NR-AhR", "NR-Aromatase", "NR-ER",
    "NR-ER-LBD", "NR-PPAR-gamma", "SR-ARE", "SR-ATAD5",
    "SR-HSE", "SR-MMP", "SR-p53"
]

# ── Step 1: Download ──────────────────────────────────────────────────────────
print("Downloading Tox21 dataset...")
df = pd.read_csv(URL)
print(f"Loaded {len(df)} rows")

# ── Step 2: Clean ─────────────────────────────────────────────────────────────
df = df.dropna(subset=["smiles"]).copy()
df = df.dropna(subset=TARGET_COLS, how="all")
print(f"After cleaning: {len(df)} rows")

# ── Step 3: Morgan Fingerprints (2048-bit, radius 2) ─────────────────────────
def to_fp(smi):
    mol = Chem.MolFromSmiles(smi)
    if mol is None:
        return None
    fp = AllChem.GetMorganFingerprintAsBitVect(mol, radius=2, nBits=2048)
    return np.array(fp)

print("Generating Morgan fingerprints...")
fps  = df["smiles"].apply(to_fp)
mask = fps.notna()
df   = df[mask].reset_index(drop=True)
X    = np.stack(fps[mask].values)
y    = df[TARGET_COLS].fillna(-1).values
print(f"Feature matrix: {X.shape}")

# ── Step 4: Train/Test Split ──────────────────────────────────────────────────
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# ── Step 5: Train 12 Random Forest Models ────────────────────────────────────
models = {}
aucs   = {}

for i, target in enumerate(TARGET_COLS):
    col_tr = y_train[:, i]
    col_te = y_test[:, i]

    keep_tr = col_tr != -1
    keep_te = col_te != -1

    print(f"  [{i+1:02d}/12] Training {target:<16} ({keep_tr.sum()} train samples)...", end=" ")

    clf = RandomForestClassifier(
        n_estimators=100,
        random_state=42,
        n_jobs=-1
    )
    clf.fit(X_train[keep_tr], col_tr[keep_tr])
    models[target] = clf

    # AUC on test set
    if keep_te.sum() > 0:
        probs = clf.predict_proba(X_test[keep_te])[:, 1]
        auc   = roc_auc_score(col_te[keep_te], probs)
        aucs[target] = auc
        print(f"AUC = {auc:.4f}")
    else:
        print("no test samples")

# ── Step 6: Summary ───────────────────────────────────────────────────────────
print("\n── AUC Summary ──────────────────────────────")
for t, a in aucs.items():
    bar  = "✅✅" if a >= 0.82 else "✅"
    print(f"  {t:<16} {a:.4f}  {bar}")
print(f"\n  Mean AUC: {np.mean(list(aucs.values())):.4f}")

# ── Step 7: Save ─────────────────────────────────────────────────────────────
with open("model/rf_models.pkl",   "wb") as f:
    pickle.dump(models, f)
with open("model/target_cols.pkl", "wb") as f:
    pickle.dump(TARGET_COLS, f)

print("\n✅ Models saved to model/rf_models.pkl and model/target_cols.pkl")
print("   Run: python app.py")