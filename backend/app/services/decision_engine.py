"""
MicroGov Dynamic Decision & Civic Routing Engine.
Routes civic complaints dynamically to the appropriate municipal department and local authority
based on issue classification and any civic location context.
"""

DEPARTMENT_DIRECTORY = {
    "Pothole": "Department of Public Works & Roads",
    "Road Damage": "Department of Public Works & Roads",
    "Broken Pavement": "Department of Public Works & Roads",
    "Trash Overflow": "Department of Sanitation & Waste Management",
    "Garbage Dump": "Department of Sanitation & Waste Management",
    "Illegal Dumping": "Department of Sanitation & Waste Management",
    "Water Leakage": "Municipal Water Supply & Sewerage Board",
    "Broken Drainage": "Municipal Water Supply & Sewerage Board",
    "Sewage Overflow": "Municipal Water Supply & Sewerage Board",
    "Streetlight Failure": "Department of Electrical Infrastructure & Energy",
    "Fallen Electric Wire": "Department of Electrical Infrastructure & Energy",
    "Broken Traffic Light": "Department of Traffic Engineering & Signals",
    "Fallen Tree": "Department of Parks & Urban Forestry",
    "Stray Animals": "Animal Control & Public Health Division",
    "General Municipal Issue": "General Municipal Administration"
}

def resolve_civic_routing(issue_type: str, severity: str, ward: str = None, city: str = None, lat: float = None, lon: float = None) -> dict:
    """
    Dynamically routes a civic complaint to:
    1. The primary municipal department
    2. The responsible local representative & zonal office for ANY given city and ward
    3. Generates transparent routing justification notes and SLA
    """
    clean_issue = (issue_type or "General Municipal Issue").strip()
    
    # Resolve Department
    department = DEPARTMENT_DIRECTORY.get(clean_issue)
    if not department:
        lowered = clean_issue.lower()
        if any(w in lowered for w in ["road", "pothole", "asphalt", "sidewalk", "bridge", "street"]):
            department = "Department of Public Works & Roads"
        elif any(w in lowered for w in ["trash", "waste", "garbage", "dump", "bin", "clean", "debris"]):
            department = "Department of Sanitation & Waste Management"
        elif any(w in lowered for w in ["water", "sewage", "pipe", "leak", "drain", "flood"]):
            department = "Municipal Water Supply & Sewerage Board"
        elif any(w in lowered for w in ["light", "power", "wire", "electric", "pole", "lamp"]):
            department = "Department of Electrical Infrastructure & Energy"
        elif any(w in lowered for w in ["tree", "park", "garden", "green", "branch"]):
            department = "Department of Parks & Urban Forestry"
        else:
            department = "General Municipal Administration"

    # Dynamic Ward & Local Authority Resolution (Works for any city/ward entered by the citizen)
    selected_ward = ward.strip() if ward and ward.strip() else "Local Civic Ward"
    selected_city = city.strip() if city and city.strip() else "Municipal Jurisdiction"

    local_authority = f"{selected_ward} Local Representative & Zonal Authority"
    
    # SLA based on severity
    sev = (severity or "MEDIUM").upper()
    if sev == "CRITICAL":
        sla_hours = 12
        priority_boost = 15.0
    elif sev == "HIGH":
        sla_hours = 24
        priority_boost = 10.0
    elif sev == "MEDIUM":
        sla_hours = 48
        priority_boost = 0.0
    else:
        sla_hours = 72
        priority_boost = -5.0

    routing_notes = (
        f"Dynamic civic routing executed: Identified '{clean_issue}' in {selected_ward}, {selected_city}. "
        f"Dispatched notification to {department} and copied {local_authority}. "
        f"Targeted SLA: {sla_hours} hours."
    )

    return {
        "department": department,
        "ward": selected_ward,
        "city": selected_city,
        "local_authority": local_authority,
        "routing_status": "ROUTED_AND_DISPATCHED",
        "routing_notes": routing_notes,
        "sla_hours": sla_hours,
        "priority_boost": priority_boost
    }
