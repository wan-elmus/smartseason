import enum
class FieldStage(str, enum.Enum):
    """
    Extended field lifecycle for Kenyan smallholder farming.
    Maps to assessment's simple stages where needed:
    - Planted → PLANTED
    - Growing → GERMINATION, VEGETATIVE, FLOWERING
    - Ready → MATURE
    - Harvested → HARVESTED
    """
    # Stages
    PLANTED = "Planted"              # Seeds in ground
    GERMINATION = "Germination"      # Emergence (7-14 days)
    VEGETATIVE = "Vegetative"        # Leaf growth, weeding, top dressing
    FLOWERING = "Flowering"          # Reproductive stage
    MATURE = "Mature"                # Ready for harvest
    HARVESTED = "Harvested"          # Completed
    
    @classmethod
    def to_simple_stage(cls, stage: "FieldStage") -> str:
        """Map extended stage to assessment's 4-stage model."""
        mapping = {
            cls.PLANTED: "Planted",
            cls.GERMINATION: "Growing",
            cls.VEGETATIVE: "Growing",
            cls.FLOWERING: "Growing",
            cls.MATURE: "Ready",
            cls.HARVESTED: "Harvested",
        }
        return mapping.get(stage, "Growing")