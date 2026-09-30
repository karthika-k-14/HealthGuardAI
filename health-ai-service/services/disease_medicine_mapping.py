"""
Disease to Medicine Clinical Mapping Engine
Maps validated infectious and chronic disease entities to essential clinical pharmaceuticals.
"""

DISEASE_TO_MEDICINES = {
    "Dengue": [
        {"name": "ORS Sachet", "category": "Hydration / Electrolytes", "weight": 2.5},
        {"name": "Paracetamol", "category": "Antipyretic / Analgesic", "weight": 3.0},
        {"name": "Dolo 650mg", "category": "Antipyretic", "weight": 2.5},
        {"name": "IV Fluids", "category": "Critical Care", "weight": 1.0}
    ],
    "Malaria": [
        {"name": "Antimalarial Tablets", "category": "Antimalarial", "weight": 2.0},
        {"name": "ORS Sachet", "category": "Hydration", "weight": 1.5},
        {"name": "Paracetamol", "category": "Antipyretic", "weight": 2.0},
        {"name": "Dolo 650mg", "category": "Antipyretic", "weight": 1.5}
    ],
    "Typhoid": [
        {"name": "Amoxicillin 500mg", "category": "Antibiotic", "weight": 2.0},
        {"name": "Azithromycin 250mg", "category": "Antibiotic", "weight": 1.5},
        {"name": "ORS Sachet", "category": "Hydration", "weight": 2.0},
        {"name": "Paracetamol", "category": "Antipyretic", "weight": 1.5}
    ],
    "Viral Fever": [
        {"name": "Paracetamol", "category": "Antipyretic", "weight": 3.0},
        {"name": "Dolo 650mg", "category": "Antipyretic", "weight": 2.5},
        {"name": "Vitamin C & Zinc", "category": "Immune Support", "weight": 2.0},
        {"name": "Cetirizine 10mg", "category": "Antihistamine", "weight": 1.5}
    ],
    "Fever": [
        {"name": "Paracetamol", "category": "Antipyretic", "weight": 3.0},
        {"name": "Dolo 650mg", "category": "Antipyretic", "weight": 2.5},
        {"name": "ORS Sachet", "category": "Hydration", "weight": 1.5}
    ],
    "COVID-19": [
        {"name": "Paracetamol", "category": "Antipyretic", "weight": 2.5},
        {"name": "Dolo 650mg", "category": "Antipyretic", "weight": 2.5},
        {"name": "Vitamin C & Zinc", "category": "Immune Support", "weight": 2.5},
        {"name": "Cough Syrup 100ml", "category": "Respiratory", "weight": 1.5},
        {"name": "Azithromycin 250mg", "category": "Antibiotic", "weight": 1.0}
    ],
    "Diarrhea": [
        {"name": "ORS Sachet", "category": "Hydration", "weight": 4.0},
        {"name": "Zinc Tablets", "category": "Pediatric / Adult Zinc", "weight": 2.0},
        {"name": "Pantoprazole 40mg", "category": "GI Support", "weight": 1.0}
    ],
    "Tuberculosis (TB)": [
        {"name": "Antibiotics", "category": "Antimicrobial", "weight": 3.0},
        {"name": "Vitamin C & Zinc", "category": "Nutritional Support", "weight": 2.0}
    ],
    "Chicken pox": [
        {"name": "Paracetamol", "category": "Antipyretic", "weight": 2.0},
        {"name": "Cetirizine 10mg", "category": "Antipruritic", "weight": 2.5}
    ],
    "Hypertension": [
        {"name": "Amlodipine 5mg", "category": "Antihypertensive", "weight": 2.5}
    ],
    "Diabetes": [
        {"name": "Metformin 500mg", "category": "Antidiabetic", "weight": 2.5}
    ]
}

def get_medicines_for_disease(disease: str):
    if not disease:
        return []
    d_clean = disease.strip()
    for k, v in DISEASE_TO_MEDICINES.items():
        if k.lower() in d_clean.lower() or d_clean.lower() in k.lower():
            return v
    return [{"name": "Paracetamol", "category": "General Relief", "weight": 1.0}]

def get_diseases_for_medicine(medicine_name: str):
    if not medicine_name:
        return []
    med_lower = medicine_name.strip().lower()
    matched = []
    for d, meds in DISEASE_TO_MEDICINES.items():
        for m in meds:
            if m["name"].lower() in med_lower or med_lower in m["name"].lower():
                matched.append(d)
                break
    return list(set(matched))
