# intelligence_engine.py

class ToxAssistant:
    def __init__(self):
        # SARE 12 TOXICITY PARAMETERS (Full List)
        self.definitions = {
            "NR-AR": "Androgen Receptor (Male Hormone Interference risk)",
            "NR-AR-LBD": "Androgen Receptor Ligand Binding (Hormone signaling disruption)",
            "NR-AhR": "Aryl Hydrocarbon Receptor (Stress in toxin metabolism)",
            "NR-Aromatase": "Aromatase Enzyme (Interferes with estrogen balance)",
            "NR-ER": "Estrogen Receptor (Female Hormone Interference risk)",
            "NR-ER-LBD": "Estrogen Receptor Ligand Binding (Signaling disruption)",
            "NR-PPAR-gamma": "PPAR-gamma (Risk to metabolism and fat cell regulation)",
            "SR-ARE": "Antioxidant Response Element (Cellular oxidative stress)",
            "SR-ATAD5": "DNA Damage (CRITICAL: Genetic instability risk)",
            "SR-HSE": "Heat Shock Response (Cellular stress indicator)",
            "SR-MMP": "Mitochondrial Membrane Potential (Cell energy failure)",
            "SR-p53": "p53 Pathway (CRITICAL: Cancer-related stress pathway)"
        }

    def analyze_structure(self, smiles):
        """SMILES string ko scan karke environment risk batana"""
        warnings = []
        smiles_upper = smiles.upper()
        if "CL" in smiles_upper or "BR" in smiles_upper or "F" in smiles_upper:
            warnings.append("Halogens detected: High environmental persistence (Non-biodegradable).")
        if "N" in smiles_upper:
            warnings.append("Nitrogen groups: Potential for high biological reactivity.")
        
        return warnings if warnings else ["Structure appears stable."]

    def get_full_report(self, task_results, smiles):
        """Backend calls this: task_results is a dict of {Task: Score}"""
        alerts = []
        for task, score in task_results.items():
            if score > 0.7: # High risk threshold
                name = self.definitions.get(task, task)
                alerts.append(f"CRITICAL: {name}")
            elif score > 0.4: # Moderate risk
                name = self.definitions.get(task, task)
                alerts.append(f"MODERATE: {name}")
        
        eco_tips = self.analyze_structure(smiles)
        
        return {
            "alerts": alerts,
            "eco_impact": eco_tips,
            "overall_status": "High Risk" if any("CRITICAL" in a for a in alerts) else "Low/Moderate Risk"
        }

    def chat_bot(self, user_query):
        """AI Assistant functionality for common questions"""
        query = user_query.lower()
        if "safe" in query:
            return "Safety is measured by the danger score (0 to 1). Below 0.3 is generally safe."
        if "dna" in query or "cancer" in query:
            return "Check SR-ATAD5 for DNA damage and SR-p53 for cancer-related stress pathways."
        if "environment" in query or "eco" in query:
            return "Our system checks for Halogens (Cl, Br, F) to determine environmental impact."
        return "I can explain any of the 12 toxicity markers. Just ask about a specific code like NR-AR or SR-p53!"