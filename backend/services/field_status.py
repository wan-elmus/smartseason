from datetime import datetime, timezone
from typing import Optional, Tuple
from core.models import Field, FieldUpdate
from constants.field_stage import FieldStage


class FieldStatusCalculator:
    """Calculate field status: Active, At Risk, or Completed."""
    
    # Growth stages that count as "Growing" for age-based risk calculation
    GROWTH_STAGES = {
        FieldStage.GERMINATION,
        FieldStage.VEGETATIVE,
        FieldStage.FLOWERING,
    }
    
    @staticmethod
    def compute(
        field: Field,
        latest_update: Optional[FieldUpdate] = None,
    ) -> Tuple[str, int, Optional[int]]:
        """
        Compute field status based on current stage, planting date, and update recency.
        
        Returns:
            Tuple of (status, days_since_planting, days_since_last_update)
        
        Status Rules:
            - HARVESTED → "Completed"
            - PLANTED + days > 14 → "At Risk"
            - Growth stages (Germination/Vegetative/Flowering) + days > 30 → "At Risk"
            - No update in > 14 days → "At Risk"
            - Everything else → "Active"
        """
        today = datetime.now(timezone.utc)
        days_planted = (today - field.planting_date).days
        
        # Handle future planting dates
        if days_planted < 0:
            days_planted = 0
        
        # Completed check - harvested fields are done
        if field.current_stage == FieldStage.HARVESTED:
            return "Completed", days_planted, None
        
        # Get latest update if not provided
        if latest_update is None and field.updates:
            latest_update = max(field.updates, key=lambda u: u.created_at)
        
        # Calculate days since last update
        days_update = None
        if latest_update:
            days_update = (today - latest_update.created_at).days
        else:
            # No updates ever - consider at risk based on planting date
            days_update = days_planted
        
        # At Risk: Planted stage too old (more than 14 days)
        if field.current_stage == FieldStage.PLANTED and days_planted > 14:
            return "At Risk", days_planted, days_update
        
        # At Risk: Growth stages too old (more than 30 days since planting)
        if field.current_stage in FieldStatusCalculator.GROWTH_STAGES and days_planted > 30:
            return "At Risk", days_planted, days_update
        
        # At Risk: Ready stage with no update in 14 days (waiting too long to harvest)
        if field.current_stage == FieldStage.MATURE and days_update and days_update > 14:
            return "At Risk", days_planted, days_update
        
        # At Risk: No update in more than 14 days
        if days_update and days_update > 14:
            return "At Risk", days_planted, days_update
        
        # All other cases (PLANTED young, growth stages young, MATURE recent)
        return "Active", days_planted, days_update
    
    @staticmethod
    def to_simple_stage(field: Field) -> str:
        """
        Map extended stage to assessment's 4-stage model.
        Useful for API responses that expect simple stages.
        """
        mapping = {
            FieldStage.PLANTED: "Planted",
            FieldStage.GERMINATION: "Growing",
            FieldStage.VEGETATIVE: "Growing",
            FieldStage.FLOWERING: "Growing",
            FieldStage.MATURE: "Ready",
            FieldStage.HARVESTED: "Harvested",
        }
        return mapping.get(field.current_stage, "Growing")


# Convenience functions for use in routers and services
def compute_field_status(
    field: Field,
    latest_update: Optional[FieldUpdate] = None,
) -> Tuple[str, int, Optional[int]]:
    """Convenience function for field status calculation."""
    return FieldStatusCalculator.compute(field, latest_update)


def get_field_with_status(field: Field) -> dict:
    """Get field data with computed status and metadata."""
    status, days_planted, days_update = compute_field_status(field)
    
    last_update = None
    if field.updates:
        last_update = max(field.updates, key=lambda u: u.created_at).created_at
    
    simple_stage = FieldStatusCalculator.to_simple_stage(field)
    
    return {
        "id": field.id,
        "name": field.name,
        "crop_type": field.crop_type,
        "planting_date": field.planting_date,
        "current_stage": field.current_stage.value,
        "simple_stage": simple_stage,
        "computed_status": status,
        "days_since_planting": days_planted,
        "days_since_last_update": days_update,
        "last_update": last_update,
        "created_at": field.created_at,
    }