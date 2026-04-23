from typing import Dict, List
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from core.database import get_db
from core.models import User, Field, FieldAssignment, FieldUpdate
from core.schemas import (
    AdminDashboardResponse, AgentDashboardResponse,
    StatusBreakdown, AgentWorkload, CropDistribution, FieldWithStatus, UpdateResponse
)
from core.dependencies import get_current_admin, get_current_agent
from constants.user_role import UserRole
from services.field_status import compute_field_status
from datetime import datetime, timezone
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/admin", response_model=AdminDashboardResponse)
async def admin_dashboard(
    current_user = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    """Admin dashboard - ADMIN ONLY. Shows all fields, all agents, system-wide stats."""
    
    result = await db.execute(
        select(Field).options(
            selectinload(Field.updates),
            selectinload(Field.assignments).selectinload(FieldAssignment.agent),
        )
    )
    fields = result.scalars().all()
    
    status_counts = {"active": 0, "at_risk": 0, "completed": 0}
    crop_counts: Dict[str, int] = {}
    at_risk_fields = []
    
    for field in fields:
        status, _, _ = compute_field_status(field)
        status_counts[status.lower()] += 1
        
        crop = field.crop_type
        crop_counts[crop] = crop_counts.get(crop, 0) + 1
        
        if status == "At Risk" and len(at_risk_fields) < 10:
            last_update = None
            if field.updates:
                last_update = max(field.updates, key=lambda u: u.created_at).created_at
            
            at_risk_fields.append(FieldWithStatus(
                id=field.id,
                name=field.name,
                crop_type=field.crop_type,
                planting_date=field.planting_date,
                current_stage=field.current_stage,
                computed_status="At Risk",
                days_since_planting=None,
                days_since_last_update=None,
                last_update=last_update,
                created_by=field.created_by,
                created_at=field.created_at,
                updated_at=field.updated_at,
                latitude=field.latitude,
                longitude=field.longitude,
            ))
    
    agent_result = await db.execute(
        select(User, func.count(FieldAssignment.field_id).label("field_count"))
        .outerjoin(FieldAssignment, User.id == FieldAssignment.agent_id)
        .where(User.role == UserRole.AGENT, User.is_active == True)
        .group_by(User.id)
    )
    agent_workload = [
        AgentWorkload(agent_id=agent.id, agent_name=agent.full_name, field_count=count or 0)
        for agent, count in agent_result.all()
    ]
    
    total_agents_result = await db.execute(
        select(func.count()).where(User.role == UserRole.AGENT, User.is_active == True)
    )
    total_agents = total_agents_result.scalar() or 0
    
    return AdminDashboardResponse(
        total_fields=len(fields),
        total_agents=total_agents,
        status_breakdown=StatusBreakdown(
            active=status_counts["active"],
            at_risk=status_counts["at_risk"],
            completed=status_counts["completed"],
        ),
        agent_workload=agent_workload,
        crop_distribution=[
            CropDistribution(crop_type=crop, count=count)
            for crop, count in crop_counts.items()
        ],
        recent_at_risk_fields=at_risk_fields,
    )


@router.get("/agent", response_model=AgentDashboardResponse)
async def agent_dashboard(
    current_user = Depends(get_current_agent),
    db: AsyncSession = Depends(get_db),
):
    """Agent dashboard - AGENT ONLY. Shows only assigned fields."""
    
    assignment_result = await db.execute(
        select(FieldAssignment.field_id).where(FieldAssignment.agent_id == current_user.id)
    )
    assigned_field_ids = [row[0] for row in assignment_result.all()]
    
    if not assigned_field_ids:
        return AgentDashboardResponse(
            total_fields=0,
            status_breakdown=StatusBreakdown(active=0, at_risk=0, completed=0),
            pending_updates_count=0,
            recent_updates=[],
        )
    
    result = await db.execute(
        select(Field)
        .options(selectinload(Field.updates))
        .where(Field.id.in_(assigned_field_ids))
    )
    fields = result.scalars().all()
    
    status_counts = {"active": 0, "at_risk": 0, "completed": 0}
    pending_count = 0
    
    for field in fields:
        status, _, days_update = compute_field_status(field)
        status_counts[status.lower()] += 1
        if days_update and days_update > 14:
            pending_count += 1
    
    recent_result = await db.execute(
        select(FieldUpdate)
        .options(selectinload(FieldUpdate.field))
        .where(FieldUpdate.agent_id == current_user.id)
        .order_by(FieldUpdate.created_at.desc())
        .limit(10)
    )
    recent_updates = recent_result.scalars().all()
    
    return AgentDashboardResponse(
        total_fields=len(fields),
        status_breakdown=StatusBreakdown(
            active=status_counts["active"],
            at_risk=status_counts["at_risk"],
            completed=status_counts["completed"],
        ),
        pending_updates_count=pending_count,
        recent_updates=[
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
            for u in recent_updates
        ],
    )