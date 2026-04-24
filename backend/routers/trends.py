from constants.field_stage import FieldStage
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, cast, Date
from sqlalchemy.sql import extract
from datetime import datetime, timedelta, timezone
from core.database import get_db
from core.models import Field, FieldUpdate
from core.dependencies import get_current_user, get_current_admin
from constants.user_role import UserRole
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/trends", tags=["Trends"])


@router.get("/field-activity")
async def get_field_activity_trend(
    current_user = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
    days: int = 30,
):
    """
    Get field activity trend for the last N days.
    Shows number of field updates per day.
    """
    
    end_date = datetime.now(timezone.utc)
    start_date = end_date - timedelta(days=days)
    
    # Group updates by date
    result = await db.execute(
        select(
            func.date(FieldUpdate.created_at).label("date"),
            func.count(FieldUpdate.id).label("count")
        )
        .where(FieldUpdate.created_at >= start_date)
        .group_by(func.date(FieldUpdate.created_at))
        .order_by(func.date(FieldUpdate.created_at))
    )
    
    updates_by_date = result.all()
    
    update_counts = {row.date: row.count for row in updates_by_date}
    
    # Generate all dates in range
    trend_data = []
    current = start_date.date()
    end = end_date.date()
    
    while current <= end:
        trend_data.append({
            "date": current.strftime("%Y-%m-%d"),
            "fields": update_counts.get(current, 0)
        })
        current += timedelta(days=1)
    
    return {
        "trend": trend_data,
        "total_updates": sum(update_counts.values()),
        "average_daily": round(sum(update_counts.values()) / len(trend_data), 1) if trend_data else 0
    }


@router.get("/field-growth")
async def get_field_growth_trend(
    current_user = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    """
    Get cumulative field growth over time.
    Shows how many fields were created per month.
    """
    
    result = await db.execute(
        select(
            extract('year', Field.created_at).label("year"),
            extract('month', Field.created_at).label("month"),
            func.count(Field.id).label("count")
        )
        .group_by("year", "month")
        .order_by("year", "month")
    )
    
    growth_data = []
    cumulative = 0
    
    for row in result.all():
        cumulative += row.count
        growth_data.append({
            "month": f"{int(row.year)}-{int(row.month):02d}",
            "new_fields": row.count,
            "total_fields": cumulative
        })
    
    return {"growth": growth_data}


@router.get("/status-distribution-over-time")
async def get_status_distribution_trend(
    current_user = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    """
    Get status distribution over time (weekly snapshot).
    This requires calculating field status at each week's end.
    """
    
    # Get all fields with their creation dates
    fields_result = await db.execute(select(Field))
    fields = fields_result.scalars().all()
    
    # Get date range
    today = datetime.now(timezone.utc).date()
    start_date = datetime.now(timezone.utc).date() - timedelta(days=90)
    
    from services.field_status import compute_field_status
    
    weekly_data = []
    current = start_date
    week_count = 0
    
    while current <= today and week_count < 13:
        week_end = current + timedelta(days=6)
        if week_end > today:
            week_end = today
        
        # For each field, determine status at week_end
        status_counts = {"active": 0, "at_risk": 0, "completed": 0}
        
        for field in fields:
            days_at_week = (week_end - field.planting_date.date()).days
            
            if field.current_stage == FieldStage.HARVESTED:
                status_counts["completed"] += 1
            elif days_at_week > 30:
                status_counts["at_risk"] += 1
            else:
                status_counts["active"] += 1
        
        weekly_data.append({
            "week_start": current.strftime("%Y-%m-%d"),
            "week_end": week_end.strftime("%Y-%m-%d"),
            "active": status_counts["active"],
            "at_risk": status_counts["at_risk"],
            "completed": status_counts["completed"]
        })
        
        current = week_end + timedelta(days=1)
        week_count += 1
    
    return {"weekly_status": weekly_data}