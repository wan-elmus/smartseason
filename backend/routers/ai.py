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
    
    # Growth stages list
    growth_stages = [FieldStage.GERMINATION, FieldStage.VEGETATIVE, FieldStage.FLOWERING]
    
    if current == FieldStage.PLANTED:
        if days_since_planting > 14:
            suggestion = FieldStage.GERMINATION
            reason = f"Field planted {days_since_planting} days ago. Should be in germination stage."
        else:
            suggestion = FieldStage.GERMINATION
            reason = "Ready to move to germination stage based on typical timeline."
    
    elif current in growth_stages:
        if current == FieldStage.GERMINATION:
            if days_since_planting > 21:
                suggestion = FieldStage.VEGETATIVE
                reason = f"Field has been in germination for {days_since_planting - 14} days. Ready for vegetative stage."
            else:
                suggestion = None
                reason = "Continue monitoring germination progress."
        elif current == FieldStage.VEGETATIVE:
            if days_since_planting > 45:
                suggestion = FieldStage.FLOWERING
                reason = f"Vegetative stage lasting {days_since_planting - 21} days. Should begin flowering soon."
            else:
                suggestion = None
                reason = "Continue monitoring vegetative growth."
        elif current == FieldStage.FLOWERING:
            if days_since_planting > 75:
                suggestion = FieldStage.MATURE
                reason = f"Flowering stage lasting {days_since_planting - 45} days. Crops approaching maturity."
            else:
                suggestion = None
                reason = "Monitor flowering progress and pest activity."
    
    elif current == FieldStage.MATURE:
        suggestion = FieldStage.HARVESTED
        reason = "Field is mature and ready for harvest."
    
    elif current == FieldStage.HARVESTED:
        suggestion = None
        reason = "Field has been harvested. No further stage changes."
    
    else:
        suggestion = None
        reason = "Field is at final stage."
    
    return StageSuggestionResponse(
        suggested_stage=suggestion,
        reason=reason,
    )