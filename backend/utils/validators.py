import re
from typing import Optional
from constants.field_stage import FieldStage


def validate_email(email: str) -> bool:
    """Basic email format validation."""
    pattern = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
    return bool(re.match(pattern, email))


def validate_phone_optional(phone: Optional[str]) -> bool:
    """Validate Kenyan phone number format (optional field)."""
    if not phone:
        return True
    pattern = r"^(\+254|0)[17]\d{8}$"
    return bool(re.match(pattern, phone))


def validate_field_stage_transition(current: FieldStage, new: FieldStage) -> tuple[bool, str]:
    """
    Validate that stage transition is allowed.
    Returns (is_valid, error_message)
    """
    allowed_transitions = {
        FieldStage.PLANTED: [FieldStage.GROWING],
        FieldStage.GROWING: [FieldStage.READY],
        FieldStage.READY: [FieldStage.HARVESTED],
        FieldStage.HARVESTED: [],
    }
    
    allowed = allowed_transitions.get(current, [])
    if new not in allowed and new != current:
        return False, f"Cannot transition from {current.value} to {new.value}"
    return True, ""