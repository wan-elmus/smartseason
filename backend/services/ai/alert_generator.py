from typing import Optional
from constants.alert_keywords import ALL_ALERT_KEYWORDS
from core.schemas import AIAlertResponse


def generate_alert_from_notes(notes: Optional[str]) -> AIAlertResponse:
    """Generate AI alert based on keyword matching in agent notes."""
    if not notes:
        return AIAlertResponse(has_alert=False)
    
    notes_lower = notes.lower()
    
    for alert_type, keywords in ALL_ALERT_KEYWORDS.items():
        for keyword in keywords:
            if keyword in notes_lower:
                return AIAlertResponse(
                    has_alert=True,
                    alert_type=alert_type,
                    message=f"Potential {alert_type} issue detected: '{keyword}' mentioned.",
                    confidence=0.75,
                )
    
    return AIAlertResponse(has_alert=False)