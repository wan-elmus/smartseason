from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from core.database import get_db
from core.models import Field, FieldAssignment, User
from core.schemas import (
    FieldCreate, FieldUpdate, FieldResponse, FieldWithStatus,
    FieldAssignRequest, FieldAssignmentResponse, AssignedAgent
)
from core.dependencies import get_current_user, get_current_admin
from constants.user_role import UserRole
from services.field_status import compute_field_status
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/fields", tags=["Field Management"])


@router.get("/", response_model=List[FieldWithStatus])
async def list_fields(
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    crop_type: Optional[str] = Query(None),
):
    """List fields - Admin sees all, Agent sees only assigned fields."""
    if current_user.role == UserRole.ADMIN:
        query = select(Field)
    else:
        subquery = select(FieldAssignment.field_id).where(FieldAssignment.agent_id == current_user.id)
        query = select(Field).where(Field.id.in_(subquery))
    
    query = query.options(
        selectinload(Field.updates),
        selectinload(Field.assignments).selectinload(FieldAssignment.agent),
        selectinload(Field.creator)
    )
    
    if crop_type:
        query = query.where(Field.crop_type == crop_type)
    
    result = await db.execute(query)
    fields = result.scalars().all()
    
    response_fields = []
    for field in fields:
        status_str, days_planted, days_update = compute_field_status(field)
        last_update = None
        if field.updates:
            last_update = max(field.updates, key=lambda u: u.created_at).created_at
        
        assigned_agent = None
        if field.assignments:
            assignment = field.assignments[0]
            if assignment.agent:
                assigned_agent = AssignedAgent(
                    id=assignment.agent.id,
                    full_name=assignment.agent.full_name,
                    email=assignment.agent.email
                )
        
        response_fields.append(FieldWithStatus(
            id=field.id,
            name=field.name,
            crop_type=field.crop_type,
            planting_date=field.planting_date,
            current_stage=field.current_stage,
            computed_status=status_str,
            days_since_planting=days_planted,
            days_since_last_update=days_update,
            last_update=last_update,
            created_by=field.created_by,
            created_at=field.created_at,
            updated_at=field.updated_at,
            latitude=field.latitude,
            longitude=field.longitude,
            assigned_agent=assigned_agent,
        ))
    
    return response_fields


@router.get("/{field_id}", response_model=FieldWithStatus)
async def get_field(
    field_id: int,
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get single field - Admin: any field, Agent: only assigned fields."""
    result = await db.execute(
        select(Field).options(
            selectinload(Field.updates),
            selectinload(Field.assignments).selectinload(FieldAssignment.agent),
            selectinload(Field.creator)
        ).where(Field.id == field_id)
    )
    field = result.scalar_one_or_none()
    
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
            raise HTTPException(status_code=403, detail="Access denied - not assigned to this field")
    
    status_str, days_planted, days_update = compute_field_status(field)
    last_update = None
    if field.updates:
        last_update = max(field.updates, key=lambda u: u.created_at).created_at
    
    assigned_agent = None
    if field.assignments:
        assignment = field.assignments[0]
        if assignment.agent:
            assigned_agent = AssignedAgent(
                id=assignment.agent.id,
                full_name=assignment.agent.full_name,
                email=assignment.agent.email
            )
    
    return FieldWithStatus(
        id=field.id,
        name=field.name,
        crop_type=field.crop_type,
        planting_date=field.planting_date,
        current_stage=field.current_stage,
        computed_status=status_str,
        days_since_planting=days_planted,
        days_since_last_update=days_update,
        last_update=last_update,
        created_by=field.created_by,
        created_at=field.created_at,
        updated_at=field.updated_at,
        latitude=field.latitude,
        longitude=field.longitude,
        assigned_agent=assigned_agent,
    )


@router.post("/", response_model=FieldResponse, status_code=status.HTTP_201_CREATED)
async def create_field(
    field_data: FieldCreate,
    current_user = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    """Create field - ADMIN ONLY."""
    new_field = Field(
        name=field_data.name,
        crop_type=field_data.crop_type,
        planting_date=field_data.planting_date,
        created_by=current_user.id,
        latitude=field_data.latitude,
        longitude=field_data.longitude,
    )
    db.add(new_field)
    await db.commit()
    await db.refresh(new_field)
    return new_field


@router.put("/{field_id}", response_model=FieldResponse)
async def update_field(
    field_id: int,
    field_data: FieldUpdate,
    current_user = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    """Update field - ADMIN ONLY."""
    result = await db.execute(select(Field).where(Field.id == field_id))
    field = result.scalar_one_or_none()
    if not field:
        raise HTTPException(status_code=404, detail="Field not found")
    
    update_data = field_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(field, key, value)
    
    await db.commit()
    await db.refresh(field)
    return field


@router.delete("/{field_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_field(
    field_id: int,
    current_user = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    """Delete field - ADMIN ONLY."""
    result = await db.execute(select(Field).where(Field.id == field_id))
    field = result.scalar_one_or_none()
    if not field:
        raise HTTPException(status_code=404, detail="Field not found")
    await db.delete(field)
    await db.commit()


@router.post("/{field_id}/assign", response_model=FieldAssignmentResponse)
async def assign_field(
    field_id: int,
    assignment: FieldAssignRequest,
    current_user = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    """Assign field to agent - ADMIN ONLY."""
    # Check field exists
    field_result = await db.execute(select(Field).where(Field.id == field_id))
    if not field_result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Field not found")
    
    # Check agent exists
    agent_result = await db.execute(
        select(User).where(User.id == assignment.agent_id, User.role == UserRole.AGENT, User.is_active == True)
    )
    if not agent_result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Agent not found")
    
    # Remove existing assignment if any
    existing = await db.execute(
        select(FieldAssignment).where(FieldAssignment.field_id == field_id)
    )
    existing_assign = existing.scalar_one_or_none()
    if existing_assign:
        await db.delete(existing_assign)
        await db.flush()
    
    # Create new assignment
    new_assignment = FieldAssignment(field_id=field_id, agent_id=assignment.agent_id)
    db.add(new_assignment)
    await db.commit()
    await db.refresh(new_assignment)
    
    return new_assignment


@router.delete("/{field_id}/unassign", status_code=status.HTTP_204_NO_CONTENT)
async def unassign_field(
    field_id: int,
    current_user = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    """Remove agent assignment from field - ADMIN ONLY."""
    # Check field exists
    field_result = await db.execute(select(Field).where(Field.id == field_id))
    if not field_result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Field not found")
    
    # Find and delete assignment
    assignment_result = await db.execute(
        select(FieldAssignment).where(FieldAssignment.field_id == field_id)
    )
    assignment = assignment_result.scalar_one_or_none()
    
    if not assignment:
        raise HTTPException(status_code=404, detail="No assignment found for this field")
    
    await db.delete(assignment)
    await db.commit()
    
    return None


@router.get("/agent/assigned", response_model=List[FieldWithStatus])
async def get_my_assigned_fields(
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get fields assigned to current agent - AGENT ONLY."""
    if current_user.role != UserRole.AGENT:
        raise HTTPException(status_code=403, detail="Agent privileges required")
    
    subquery = select(FieldAssignment.field_id).where(FieldAssignment.agent_id == current_user.id)
    result = await db.execute(
        select(Field).options(
            selectinload(Field.updates),
            selectinload(Field.assignments).selectinload(FieldAssignment.agent)
        ).where(Field.id.in_(subquery))
    )
    fields = result.scalars().all()
    
    response_fields = []
    for field in fields:
        status_str, days_planted, days_update = compute_field_status(field)
        last_update = None
        if field.updates:
            last_update = max(field.updates, key=lambda u: u.created_at).created_at
        
        assigned_agent = None
        if field.assignments:
            assignment = field.assignments[0]
            if assignment.agent:
                assigned_agent = AssignedAgent(
                    id=assignment.agent.id,
                    full_name=assignment.agent.full_name,
                    email=assignment.agent.email
                )
        
        response_fields.append(FieldWithStatus(
            id=field.id,
            name=field.name,
            crop_type=field.crop_type,
            planting_date=field.planting_date,
            current_stage=field.current_stage,
            computed_status=status_str,
            days_since_planting=days_planted,
            days_since_last_update=days_update,
            last_update=last_update,
            created_by=field.created_by,
            created_at=field.created_at,
            updated_at=field.updated_at,
            latitude=field.latitude,
            longitude=field.longitude,
            assigned_agent=assigned_agent,
        ))
    
    return response_fields