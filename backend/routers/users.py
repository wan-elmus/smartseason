from typing import List

from pyparsing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from core.database import get_db
from core.models import User
from core.schemas import UserResponse
from core.dependencies import get_current_admin, get_current_user
from constants.user_role import UserRole
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/agents", response_model=List[UserResponse])
async def get_all_agents(
    current_user = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    """Get all agents (Admin only)."""
    result = await db.execute(
        select(User).where(
            User.role == UserRole.AGENT,
            User.is_active == True
        ).order_by(User.full_name)
    )
    agents = result.scalars().all()
    return agents


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user = Depends(get_current_user),
):
    """Get current authenticated user's information."""
    return current_user


# @router.put("/profile", response_model=UserResponse)
# async def update_profile(
#     full_name: str,
#     current_user = Depends(get_current_user),
#     db: AsyncSession = Depends(get_db),
# ):
#     """Update current user's profile."""
#     current_user.full_name = full_name
#     await db.commit()
#     await db.refresh(current_user)
#     return current_user

@router.put("/profile", response_model=UserResponse)
async def update_profile(
    full_name: str,
    avatar_url: Optional[str] = None,
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update current user's profile."""
    current_user.full_name = full_name
    if avatar_url is not None:
        current_user.avatar_url = avatar_url
    await db.commit()
    await db.refresh(current_user)
    return current_user