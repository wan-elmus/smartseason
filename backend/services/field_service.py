from datetime import datetime, timezone
from typing import Optional, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from core.models import Field, FieldUpdate, FieldAssignment, User
from constants.field_stage import FieldStage
from services.field_status import FieldStatusCalculator

# Re-export for convenience
compute_field_status = FieldStatusCalculator.compute


async def create_field(
    db: AsyncSession,
    name: str,
    crop_type: str,
    planting_date: datetime,
    created_by: int,
    latitude: Optional[float] = None,
    longitude: Optional[float] = None,
) -> Field:
    """Create a new field."""
    field = Field(
        name=name,
        crop_type=crop_type,
        planting_date=planting_date,
        created_by=created_by,
        current_stage=FieldStage.PLANTED,
        latitude=latitude,
        longitude=longitude,
    )
    db.add(field)
    await db.flush()
    return field


async def assign_field_to_agent(
    db: AsyncSession,
    field_id: int,
    agent_id: int,
) -> FieldAssignment:
    """Assign a field to an agent."""
    assignment = FieldAssignment(
        field_id=field_id,
        agent_id=agent_id,
    )
    db.add(assignment)
    await db.flush()
    return assignment


async def get_fields_by_agent(
    db: AsyncSession,
    agent_id: int,
) -> list[Field]:
    """Get all fields assigned to a specific agent."""
    result = await db.execute(
        select(Field)
        .join(FieldAssignment, Field.id == FieldAssignment.field_id)
        .options(selectinload(Field.updates))
        .where(FieldAssignment.agent_id == agent_id)
    )
    return result.scalars().all()


async def get_all_fields_with_details(db: AsyncSession) -> list[Field]:
    """Get all fields with their assignments and updates loaded."""
    result = await db.execute(
        select(Field)
        .options(
            selectinload(Field.updates),
            selectinload(Field.assignments).selectinload(FieldAssignment.agent),
        )
    )
    return result.scalars().all()


async def get_field_by_id(db: AsyncSession, field_id: int) -> Optional[Field]:
    """Get a single field by ID with all relationships loaded."""
    result = await db.execute(
        select(Field)
        .options(
            selectinload(Field.updates),
            selectinload(Field.assignments).selectinload(FieldAssignment.agent),
        )
        .where(Field.id == field_id)
    )
    return result.scalar_one_or_none()


async def update_field_details(
    db: AsyncSession,
    field_id: int,
    name: Optional[str] = None,
    crop_type: Optional[str] = None,
    planting_date: Optional[datetime] = None,
    current_stage: Optional[FieldStage] = None,
) -> Optional[Field]:
    """Update field details."""
    field = await get_field_by_id(db, field_id)
    if not field:
        return None
    
    if name is not None:
        field.name = name
    if crop_type is not None:
        field.crop_type = crop_type
    if planting_date is not None:
        field.planting_date = planting_date
    if current_stage is not None:
        field.current_stage = current_stage
    
    field.updated_at = datetime.now(timezone.utc)
    await db.flush()
    return field


def get_field_with_status(field: Field) -> dict:
    """Get field data with computed status and metadata."""
    status, days_planted, days_update = compute_field_status(field)
    
    last_update = None
    if field.updates:
        last_update = max(field.updates, key=lambda u: u.created_at).created_at
    
    return {
        "id": field.id,
        "name": field.name,
        "crop_type": field.crop_type,
        "planting_date": field.planting_date,
        "current_stage": field.current_stage,
        "computed_status": status,
        "days_since_planting": days_planted,
        "days_since_last_update": days_update,
        "last_update": last_update,
        "created_at": field.created_at,
    }