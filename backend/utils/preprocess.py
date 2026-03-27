from rdkit import Chem
from rdkit.Chem import AllChem
import numpy as np

def smiles_to_fingerprint(smiles: str):
    """
    Convert SMILES string to 2048-bit Morgan fingerprint.
    MUST match training: radius=2, nBits=2048
    """
    mol = Chem.MolFromSmiles(smiles)
    if mol is None:
        raise ValueError(f"Invalid SMILES string: '{smiles}'")
    
    fp = AllChem.GetMorganFingerprintAsBitVect(mol, radius=2, nBits=2048)
    return np.array(fp).reshape(1, -1)   # shape: (1, 2048)