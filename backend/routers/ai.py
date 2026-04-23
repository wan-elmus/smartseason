from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from core.database import get_db
from core.models import AIAlert, Field, FieldUpdate
from core.schemas import AIAlertResponse, StageSuggestionResponse
from core.dependencies import get_current_user
from constants.field_stage import FieldStage
from datetime import datetime, timezone
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/ai", tags=["AI Features"])


@router.get("/alerts/{update_id}", response_model=AIAlertResponse)
async def get_alert_for_update(
    update_id: int,
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get AI-generated alert for a specific field update."""
    result = await db.execute(select(AIAlert).where(AIAlert.update_id == update_id))
    alert = result.scalar_one_or_none()
    
    if not alert:
        return AIAlertResponse(has_alert=False)
    
    return AIAlertResponse(
        has_alert=True,
        alert_type=alert.alert_type,
        message=alert.message,
        confidence=float(alert.confidence) if alert.confidence else None,
    )


@router.get("/suggest-stage/{field_id}", response_model=StageSuggestionResponse)
async def suggest_next_stage(
    field_id: int,
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Suggest the next logical stage based on days since planting."""
    
    result = await db.execute(select(Field).where(Field.id == field_id))
    field = result.scalar_one_or_none()
    
    if not field:
        raise HTTPException(status_code=404, detail="Field not found")
    
    days_since_planting = (datetime.now(timezone.utc) - field.planting_date).days
    
    current = field.current_stage
    suggestion = None
    reason = ""
    
    if current == FieldStage.PLANTED:
        if days_since_planting > 14:
            suggestion = FieldStage.GROWING
            reason = f"Field planted {days_since_planting} days ago. Should be in growing stage."
        else:
            suggestion = FieldStage.GROWING
            reason = "Ready to move to growing stage based on typical timeline."
    
    elif current == FieldStage.GROWING:
        if days_since_planting > 60:
            suggestion = FieldStage.READY
            reason = f"Field is {days_since_planting} days old. Likely ready for harvest soon."
        else:
            suggestion = None
            reason = "Continue monitoring. No stage change suggested yet."
    
    elif current == FieldStage.READY:
        suggestion = FieldStage.HARVESTED
        reason = "Field is marked as ready. Suggest harvesting."
    
    else:
        suggestion = None
        reason = "Field is harvested or at final stage."
    
    return StageSuggestionResponse(
        suggested_stage=suggestion,
        reason=reason,
    )