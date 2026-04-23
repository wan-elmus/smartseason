from typing import Dict, List, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from core.models import User, Field, FieldAssignment, FieldUpdate
from constants.user_role import UserRole
from services.field_service import compute_field_status, get_field_with_status


async def get_admin_dashboard_data(db: AsyncSession) -> Dict[str, Any]:
    """Aggregate data for admin dashboard."""
    
    fields_result = await db.execute(
        select(Field).options(
            selectinload(Field.updates),
            selectinload(Field.assignments).selectinload(FieldAssignment.agent),
        )
    )
    fields = fields_result.scalars().all()
    
    status_counts = {"active": 0, "at_risk": 0, "completed": 0}
    crop_counts: Dict[str, int] = {}
    at_risk_fields_data = []
    
    for field in fields:
        status, days_planted, days_update = compute_field_status(field)
        status_key = status.lower()
        status_counts[status_key] = status_counts.get(status_key, 0) + 1
        
        crop = field.crop_type
        crop_counts[crop] = crop_counts.get(crop, 0) + 1
        
        if status == "At Risk" and len(at_risk_fields_data) < 10:
            at_risk_fields_data.append(get_field_with_status(field))
    
    agent_result = await db.execute(
        select(User, func.count(FieldAssignment.field_id).label("field_count"))
        .outerjoin(FieldAssignment, User.id == FieldAssignment.agent_id)
        .where(User.role == UserRole.AGENT, User.is_active == True)
        .group_by(User.id)
    )
    agent_workload = [
        {"agent_id": agent.id, "agent_name": agent.full_name, "field_count": count or 0}
        for agent, count in agent_result.all()
    ]
    
    total_agents_result = await db.execute(
        select(func.count()).where(User.role == UserRole.AGENT, User.is_active == True)
    )
    total_agents = total_agents_result.scalar() or 0
    
    return {
        "total_fields": len(fields),
        "total_agents": total_agents,
        "status_breakdown": status_counts,
        "agent_workload": agent_workload,
        "crop_distribution": [{"crop_type": k, "count": v} for k, v in crop_counts.items()],
        "recent_at_risk_fields": at_risk_fields_data,
    }


async def get_agent_dashboard_data(db: AsyncSession, agent_id: int) -> Dict[str, Any]:
    """Aggregate data for agent dashboard."""
    
    assignment_result = await db.execute(
        select(FieldAssignment.field_id).where(FieldAssignment.agent_id == agent_id)
    )
    field_ids = [row[0] for row in assignment_result.all()]
    
    if not field_ids:
        return {
            "total_fields": 0,
            "status_breakdown": {"active": 0, "at_risk": 0, "completed": 0},
            "pending_updates_count": 0,
            "recent_updates": [],
        }
    
    fields_result = await db.execute(
        select(Field)
        .options(selectinload(Field.updates))
        .where(Field.id.in_(field_ids))
    )
    fields = fields_result.scalars().all()
    
    status_counts = {"active": 0, "at_risk": 0, "completed": 0}
    pending_count = 0
    
    for field in fields:
        status, _, days_update = compute_field_status(field)
        status_key = status.lower()
        status_counts[status_key] = status_counts.get(status_key, 0) + 1
        if days_update and days_update > 14:
            pending_count += 1
    
    updates_result = await db.execute(
        select(FieldUpdate)
        .options(selectinload(FieldUpdate.field))
        .where(FieldUpdate.agent_id == agent_id)
        .order_by(FieldUpdate.created_at.desc())
        .limit(10)
    )
    recent_updates = updates_result.scalars().all()
    
    return {
        "total_fields": len(fields),
        "status_breakdown": status_counts,
        "pending_updates_count": pending_count,
        "recent_updates": recent_updates,
    }