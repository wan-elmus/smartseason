from datetime import datetime
from typing import Optional


def format_date(date_obj: Optional[datetime], format_str: str = "%Y-%m-%d") -> Optional[str]:
    """Format datetime to string, return None if input is None."""
    if date_obj is None:
        return None
    return date_obj.strftime(format_str)


def format_status_for_display(status: str) -> str:
    """Format status string for display (e.g., 'at_risk' -> 'At Risk')."""
    status_map = {
        "active": "Active",
        "at_risk": "At Risk",
        "completed": "Completed",
        "At Risk": "At Risk",
    }
    return status_map.get(status, status)


def format_field_summary(field_name: str, crop_type: str, status: str) -> str:
    """Create human-readable field summary."""
    return f"{field_name} ({crop_type}) - {format_status_for_display(status)}"