"""
AI Alert Keywords for pattern matching in agent notes.
When an agent submits a field update with notes, these keywords trigger
relevant alerts (pest, disease, drought, nutrient deficiency).
"""

# Pest-related keywords
PEST_KEYWORDS = [
    "pest", "insect", "worm", "caterpillar", "locust", "aphid", "beetle",
    "grasshopper", "armyworm", "stalk borer", "thrips", "mite", "leaf miner",
    "chewed leaves", "holes in leaves", "webbing"
]

# Disease-related keywords
DISEASE_KEYWORDS = [
    "disease", "fungus", "fungal", "mold", "mould", "rot", "blight", "rust",
    "mildew", "powdery mildew", "downy mildew", "yellowing", "wilt", "wilted",
    "leaf spot", "canker", "smut", "tar spot", "dieback", "curled leaves",
    "mosaic", "streak"
]

# Drought/water stress keywords
DROUGHT_KEYWORDS = [
    "dry", "drought", "wilting", "no rain", "water stress", "irrigation needed",
    "cracked soil", "scorched", "brown edges", "drooping", "thirsty"
]

# Nutrient deficiency keywords
NUTRIENT_KEYWORDS = [
    "nitrogen", "potassium", "phosphorus", "deficiency", "stunted", 
    "purpling", "yellow lower leaves", "chlorosis", "poor growth",
    "small leaves", "thin stalks", "low vigor", "no fertilizer"
]

# Weather-related risks (extended)
WEATHER_KEYWORDS = [
    "flood", "flooding", "waterlogged", "hail", "storm", "wind damage",
    "landslide", "erosion", "heavy rain", "prolonged rain"
]

# All categories for iteration
ALL_ALERT_KEYWORDS = {
    "pest": PEST_KEYWORDS,
    "disease": DISEASE_KEYWORDS,
    "drought": DROUGHT_KEYWORDS,
    "nutrient": NUTRIENT_KEYWORDS,
    "weather": WEATHER_KEYWORDS,
}


def detect_alert_type(notes: str) -> tuple[str | None, list[str]]:
    """
    Scan agent notes and return (alert_type, matched_keywords).
    
    Args:
        notes: Agent's observation text (case-insensitive)
        
    Returns:
        (alert_type, list_of_matched_keywords) or (None, []) if no match
    """
    if not notes:
        return None, []
    
    notes_lower = notes.lower()
    matched_keywords = []
    
    for alert_type, keywords in ALL_ALERT_KEYWORDS.items():
        for keyword in keywords:
            if keyword.lower() in notes_lower:
                matched_keywords.append(keyword)
        if matched_keywords:
            return alert_type, matched_keywords[:3]
    
    return None, []