from datetime import datetime, timezone
from typing import Optional
from core.models import Field
from constants.field_stage import FieldStage


def suggest_next_stage(field: Field) -> tuple[Optional[FieldStage], str]:
    """Suggest next logical stage based on days since planting."""
    
    days = (datetime.now(timezone.utc) - field.planting_date).days
    
    # Stage progression thresholds (days)
    if field.current_stage == FieldStage.PLANTED:
        if days >= 14:
            return FieldStage.GROWING, f"Field is {days} days old. Ready for growing stage."
        return FieldStage.GROWING, "Continue monitoring. Move to growing stage soon."
    
    elif field.current_stage == FieldStage.GROWING:
        if days >= 60:
            return FieldStage.READY, f"Field is {days} days old. Likely ready for harvest."
        return None, f"Field is {days} days old. Continue monitoring."
    
    elif field.current_stage == FieldStage.READY:
        return FieldStage.HARVESTED, "Field marked as ready. Suggest harvesting."
    
    else:
        return None, "Field is harvested or at final stage."