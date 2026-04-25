from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from core.database import get_db
from core.models import User
from core.schemas import UserResponse
from core.dependencies import get_current_admin, get_current_user
from constants.user_role import UserRole
import logging
import json

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


@router.put("/profile", response_model=UserResponse)
async def update_profile(
    request_data: dict,
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update current user's profile."""
    try:
        logger.info(f"Received request data: {request_data}")
        
        full_name = request_data.get("full_name")
        avatar_url = request_data.get("avatar_url")
        
        logger.info(f"Parsed full_name: {full_name}")
        logger.info(f"Parsed avatar_url: {avatar_url}")
        
        if not full_name or len(full_name.strip()) < 2:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Full name must be at least 2 characters"
            )
        
        current_user.full_name = full_name.strip()
        
        if avatar_url is not None and avatar_url != "":
            current_user.avatar_url = avatar_url
        elif avatar_url == "":
            current_user.avatar_url = None
        
        await db.commit()
        await db.refresh(current_user)
        
        logger.info(f"Profile updated successfully for user {current_user.id}")
        return current_user
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Profile update error: {e}")
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update profile: {str(e)}"
        )