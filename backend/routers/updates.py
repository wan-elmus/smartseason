from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from core.database import get_db
from core.models import Field, FieldUpdate, FieldAssignment, AIAlert
from core.schemas import UpdateCreate, UpdateResponse
from core.dependencies import get_current_user, get_current_agent
from constants.user_role import UserRole
from services.ai.alert_generator import generate_alert_from_notes
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/updates", tags=["Field Updates"])


@router.post("/fields/{field_id}", response_model=UpdateResponse, status_code=status.HTTP_201_CREATED)
async def create_update(
    field_id: int,
    update_data: UpdateCreate,
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Submit field update. Agent: only assigned fields. Admin: any field."""
    field_result = await db.execute(select(Field).where(Field.id == field_id))
    field = field_result.scalar_one_or_none()
    if not field:
        raise HTTPException(status_code=404, detail="Field not found")
    
    if current_user.role == UserRole.AGENT:
        assignment = await db.execute(
            select(FieldAssignment).where(
                FieldAssignment.field_id == field_id,
                FieldAssignment.agent_id == current_user.id
            )
        )
        if not assignment.scalar_one_or_none():
            raise HTTPException(status_code=403, detail="Not assigned to this field")
    
    new_update = FieldUpdate(
        field_id=field_id,
        agent_id=current_user.id,
        new_stage=update_data.new_stage,
        notes=update_data.notes,
        image_url=update_data.image_url,
    )
    db.add(new_update)
    
    field.current_stage = update_data.new_stage
    
    if update_data.notes:
        ai_response = generate_alert_from_notes(update_data.notes)
        if ai_response.has_alert:
            await db.flush()
            ai_alert = AIAlert(
                update_id=new_update.id,
                alert_type=ai_response.alert_type,
                message=ai_response.message,
                confidence=ai_response.confidence,
            )
            db.add(ai_alert)
    
    await db.commit()
    await db.refresh(new_update)
    
    return UpdateResponse(
        id=new_update.id,
        field_id=new_update.field_id,
        agent_id=new_update.agent_id,
        new_stage=new_update.new_stage,
        notes=new_update.notes,
        image_url=new_update.image_url,
        created_at=new_update.created_at,
        agent_name=current_user.full_name,
    )


@router.get("/fields/{field_id}", response_model=List[UpdateResponse])
async def get_field_updates(
    field_id: int,
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    limit: int = 50,
):
    """Get all updates for a field - respects role-based access."""
    field_result = await db.execute(select(Field).where(Field.id == field_id))
    field = field_result.scalar_one_or_none()
    if not field:
        raise HTTPException(status_code=404, detail="Field not found")
    
    if current_user.role == UserRole.AGENT:
        assignment = await db.execute(
            select(FieldAssignment).where(
                FieldAssignment.field_id == field_id,
                FieldAssignment.agent_id == current_user.id
            )
        )
        if not assignment.scalar_one_or_none():
            raise HTTPException(status_code=403, detail="Access denied")
    
    result = await db.execute(
        select(FieldUpdate)
        .options(selectinload(FieldUpdate.agent))
        .where(FieldUpdate.field_id == field_id)
        .order_by(FieldUpdate.created_at.desc())
        .limit(limit)
    )
    updates = result.scalars().all()
    
    return [
        UpdateResponse(
            id=u.id,
            field_id=u.field_id,
            agent_id=u.agent_id,
            new_stage=u.new_stage,
            notes=u.notes,
            image_url=u.image_url,
            created_at=u.created_at,
            agent_name=u.agent.full_name if u.agent else None,
        )
        for u in updates
    ]
    
@router.get("/my", response_model=List[UpdateResponse])
async def get_my_updates(
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    limit: int = 50,
):
    """Get updates submitted by the current user."""
    result = await db.execute(
        select(FieldUpdate)
        .options(selectinload(FieldUpdate.field))
        .where(FieldUpdate.agent_id == current_user.id)
        .order_by(FieldUpdate.created_at.desc())
        .limit(limit)
    )
    updates = result.scalars().all()
    
    return [
        UpdateResponse(
            id=u.id,
            field_id=u.field_id,
            agent_id=u.agent_id,
            new_stage=u.new_stage,
            notes=u.notes,
            image_url=u.image_url,
            created_at=u.created_at,
            agent_name=current_user.full_name,
        )
        for u in updates
    ]