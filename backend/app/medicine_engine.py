"""HealthScan — Medicine Savings Engine"""

# Sample data: Salt Name -> {Branded Average, Generic/JanAushadhi Average, Common Brand}
# Prices are approx for 10 tablets in INR
MEDICINE_VAULT = {
    "metformin": {
        "salt": "Metformin (Sugar/Diabetes)",
        "branded_price": 60,
        "generic_price": 12,
        "brand_example": "Glycomet"
    },
    "atorvastatin": {
        "salt": "Atorvastatin (Cholesterol)",
        "branded_price": 120,
        "generic_price": 25,
        "brand_example": "Atorva"
    },
    "amlodipine": {
        "salt": "Amlodipine (Blood Pressure)",
        "branded_price": 45,
        "generic_price": 8,
        "brand_example": "Amlokind"
    },
    "pantoprazole": {
        "salt": "Pantoprazole (Acidity/Gas)",
        "branded_price": 150,
        "generic_price": 35,
        "brand_example": "Pan-D"
    },
    "thyroxine": {
        "salt": "Thyroxine (Thyroid)",
        "branded_price": 180,
        "generic_price": 40,
        "brand_example": "Thyronorm"
    },
    "amoxicillin": {
        "salt": "Amoxicillin (Antibiotic)",
        "branded_price": 220,
        "generic_price": 65,
        "brand_example": "Augmentin"
    }
}

def get_medicine_savings(med_names: list):
    """
    Check list of medicines and find generic alternatives + savings.
    """
    results = []
    total_savings = 0
    
    for med in med_names:
        med_clean = med.lower().strip()
        # Search for salt match
        match = None
        for salt, data in MEDICINE_VAULT.items():
            if salt in med_clean:
                match = data
                break
        
        if match:
            saving = match['branded_price'] - match['generic_price']
            total_savings += saving
            results.append({
                "original": med,
                "generic_name": match['salt'],
                "branded_price": match['branded_price'],
                "generic_price": match['generic_price'],
                "savings": saving,
                "percentage": round((saving / match['branded_price']) * 100)
            })
            
    return {
        "alternatives": results,
        "total_potential_savings": total_savings
    }
