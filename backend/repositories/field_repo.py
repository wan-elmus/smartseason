from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete
from sqlalchemy.orm import selectinload
from core.models import Field, FieldAssignment, FieldUpdate


class FieldRepository:
    """Database operations for Field model."""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def get_by_id(self, field_id: int, eager_load: bool = True) -> Optional[Field]:
        query = select(Field).where(Field.id == field_id)
        if eager_load:
            query = query.options(
                selectinload(Field.updates),
                selectinload(Field.assignments),
                selectinload(Field.creator)
            )
        result = await self.db.execute(query)
        return result.scalar_one_or_none()
    
    async def get_all(
        self, 
        field_ids: Optional[List[int]] = None,
        crop_type: Optional[str] = None,
        limit: int = 100,
        offset: int = 0,
    ) -> List[Field]:
        query = select(Field).options(
            selectinload(Field.updates),
            selectinload(Field.assignments)
        )
        
        if field_ids:
            query = query.where(Field.id.in_(field_ids))
        if crop_type:
            query = query.where(Field.crop_type == crop_type)
        
        query = query.offset(offset).limit(limit)
        result = await self.db.execute(query)
        return result.scalars().all()
    
    async def create(self, field_data: dict) -> Field:
        field = Field(**field_data)
        self.db.add(field)
        await self.db.flush()
        return field
    
    async def update(self, field_id: int, update_data: dict) -> Optional[Field]:
        await self.db.execute(
            update(Field)
            .where(Field.id == field_id)
            .values(**update_data)
        )
        await self.db.flush()
        return await self.get_by_id(field_id)
    
    async def delete(self, field_id: int) -> bool:
        result = await self.db.execute(
            delete(Field).where(Field.id == field_id)
        )
        await self.db.flush()
        return result.rowcount > 0
    
    async def get_fields_by_agent(self, agent_id: int) -> List[Field]:
        subquery = select(FieldAssignment.field_id).where(FieldAssignment.agent_id == agent_id)
        result = await self.db.execute(
            select(Field).where(Field.id.in_(subquery))
        )
        return result.scalars().all()