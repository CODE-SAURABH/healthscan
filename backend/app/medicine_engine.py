"""HealthScan — Medicine Savings Engine (AI Enhanced)"""

def get_medicine_savings(ai_med_results: list):
    """
    Process medicine data extracted by AI.
    Calculate total savings and format for UI.
    """
    if not ai_med_results:
        return {"alternatives": [], "total_potential_savings": 0}

    results = []
    total_savings = 0
    
    for med in ai_med_results:
        name = med.get("name", "Unknown Medicine")
        salt = med.get("salt", "N/A")
        branded_p = med.get("typical_branded_price", 0)
        generic_p = med.get("typical_generic_price", 0)
        
        # Validation to avoid zero divisions or weird data
        if branded_p > 0 and generic_p > 0:
            saving = branded_p - generic_p
            if saving > 0:
                total_savings += saving
                results.append({
                    "original": name,
                    "generic_name": salt,
                    "branded_price": branded_p,
                    "generic_price": generic_p,
                    "savings": saving,
                    "percentage": round((saving / branded_p) * 100),
                    "purpose": med.get("purpose", "")
                })
            
    return {
        "alternatives": results,
        "total_potential_savings": total_savings
    }
