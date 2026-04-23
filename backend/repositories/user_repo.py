from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from core.models import User


class UserRepository:
    """Database operations for User model."""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def get_by_id(self, user_id: int) -> Optional[User]:
        result = await self.db.execute(select(User).where(User.id == user_id))
        return result.scalar_one_or_none()
    
    async def get_by_email(self, email: str) -> Optional[User]:
        result = await self.db.execute(select(User).where(User.email == email))
        return result.scalar_one_or_none()
    
    async def get_all_agents(self, active_only: bool = True) -> list[User]:
        query = select(User).where(User.role == "agent")
        if active_only:
            query = query.where(User.is_active == True)
        result = await self.db.execute(query)
        return result.scalars().all()
    
    async def create(self, user_data: dict) -> User:
        user = User(**user_data)
        self.db.add(user)
        await self.db.flush()
        return user
    
    async def update(self, user_id: int, update_data: dict) -> Optional[User]:
        from sqlalchemy import update
        await self.db.execute(
            update(User)
            .where(User.id == user_id)
            .values(**update_data)
        )
        await self.db.flush()
        return await self.get_by_id(user_id)