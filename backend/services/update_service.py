from datetime import datetime, timezone
from typing import Optional, Dict, Any, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from sqlalchemy.orm import selectinload
from core.models import Field, FieldUpdate, FieldAssignment, AIAlert
from core.schemas import UpdateCreate, AIAlertResponse
from constants.field_stage import FieldStage
from services.ai.alert_generator import generate_alert_from_notes
from services.field_status import compute_field_status


async def process_update_with_ai(
    db: AsyncSession,
    field_id: int,
    agent_id: int,
    update_data: UpdateCreate,
) -> Tuple[FieldUpdate, AIAlertResponse]:
    """Process a field update, generate AI alert, and update field stage."""
    
    field = await db.execute(
        select(Field).options(selectinload(Field.updates)).where(Field.id == field_id)
    )
    field = field.scalar_one_or_none()
    
    if not field:
        raise ValueError(f"Field {field_id} not found")
    
    assignment = await db.execute(
        select(FieldAssignment).where(
            FieldAssignment.field_id == field_id,
            FieldAssignment.agent_id == agent_id
        )
    )
    if not assignment.scalar_one_or_none():
        raise PermissionError(f"Agent {agent_id} not assigned to field {field_id}")
    
    # Create update record
    field_update = FieldUpdate(
        field_id=field_id,
        agent_id=agent_id,
        new_stage=update_data.new_stage,
        notes=update_data.notes,
        image_url=update_data.image_url,
        created_at=datetime.now(timezone.utc),
    )
    db.add(field_update)
    
    # Generate AI alert from notes
    ai_response = generate_alert_from_notes(update_data.notes)
    
    if ai_response.has_alert:
        ai_alert = AIAlert(
            update_id=field_update.id,
            alert_type=ai_response.alert_type,
            message=ai_response.message,
            confidence=ai_response.confidence,
        )
        db.add(ai_alert)
    
    # Update field stage
    field.current_stage = update_data.new_stage
    field.updated_at = datetime.now(timezone.utc)
    
    await db.flush()
    
    return field_update, ai_response


async def get_field_updates(
    db: AsyncSession,
    field_id: int,
    limit: int = 20,
    offset: int = 0,
) -> list[FieldUpdate]:
    """Get all updates for a specific field."""
    
    result = await db.execute(
        select(FieldUpdate)
        .where(FieldUpdate.field_id == field_id)
        .order_by(FieldUpdate.created_at.desc())
        .offset(offset)
        .limit(limit)
    )
    return result.scalars().all()


async def get_field_with_status_and_updates(
    db: AsyncSession,
    field_id: int,
) -> Optional[Dict[str, Any]]:
    """Get field with computed status and recent updates."""
    
    result = await db.execute(
        select(Field)
        .options(
            selectinload(Field.updates),
            selectinload(Field.assignments).selectinload(FieldAssignment.agent),
        )
        .where(Field.id == field_id)
    )
    field = result.scalar_one_or_none()
    
    if not field:
        return None
    
    status, days_planted, days_update = compute_field_status(field)
    
    last_update = None
    if field.updates:
        last_update = max(field.updates, key=lambda u: u.created_at)
    
    recent_updates = sorted(field.updates, key=lambda u: u.created_at, reverse=True)[:10]
    
    return {
        "field": {
            "id": field.id,
            "name": field.name,
            "crop_type": field.crop_type,
            "planting_date": field.planting_date,
            "current_stage": field.current_stage,
            "computed_status": status,
            "days_since_planting": days_planted,
            "days_since_last_update": days_update,
        },
        "last_update": last_update,
        "recent_updates": recent_updates,
        "assigned_agent": field.assignments[0].agent.full_name if field.assignments else None,
    }