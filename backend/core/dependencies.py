from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from core.database import get_db
from core.security import verify_token
from core.models import User
from constants.user_role import UserRole
import logging

logger = logging.getLogger(__name__)

bearer_security = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_security),
    db: AsyncSession = Depends(get_db),
) -> User:
    """
    Dependency: Require valid JWT; return authenticated User model instance.
    Raises 401 if token missing, invalid, or user not found/inactive.
    """
    if not credentials:
        logger.warning("No credentials provided")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        payload = verify_token(credentials.credentials, token_type="access")
        sub = payload.get("sub")
        if not sub:
            logger.warning("Token missing 'sub' claim")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token: missing user ID",
                headers={"WWW-Authenticate": "Bearer"},
            )

        try:
            user_id = int(sub)
        except (TypeError, ValueError):
            logger.warning(f"Invalid user_id format: {sub}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token: invalid user ID",
                headers={"WWW-Authenticate": "Bearer"},
            )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Token verification failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Fetch and validate user from DB
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    if not user or not user.is_active:
        logger.error(f"User {user_id} not found or inactive")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive",
            headers={"WWW-Authenticate": "Bearer"},
        )

    logger.info(f"User {user_id} authenticated successfully")
    return user


async def get_current_admin(
    current_user: User = Depends(get_current_user),
) -> User:
    """Require admin role."""
    if current_user.role != UserRole.ADMIN:
        logger.warning(f"User {current_user.id} attempted admin-only action")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required",
        )
    return current_user


async def get_current_agent(
    current_user: User = Depends(get_current_user),
) -> User:
    """Require agent role (admins also pass through if you want, or restrict)."""
    if current_user.role not in [UserRole.ADMIN, UserRole.AGENT]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Agent or Admin privileges required",
        )
    return current_user


async def get_optional_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_security),
    db: AsyncSession = Depends(get_db),
) -> Optional[User]:
    """Return authenticated User if token valid, else None."""
    if not credentials:
        return None
    try:
        payload = verify_token(credentials.credentials, token_type="access")
        user_id = payload.get("sub")
        if not user_id:
            return None
        result = await db.execute(select(User).where(User.id == int(user_id), User.is_active == True))
        return result.scalar_one_or_none()
    except Exception:
        return None