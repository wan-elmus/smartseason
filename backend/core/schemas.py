from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional, List
from datetime import datetime
from decimal import Decimal
from constants.field_stage import FieldStage
from constants.user_role import UserRole

class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: UserRole = UserRole.AGENT
    
class UserCreate(UserBase):
    password: str = Field(..., min_length=8)
    
class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}

class UserLogin(BaseModel):
    email: EmailStr
    password: str


# Token Schemas
class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int


class TokenPayload(BaseModel):
    sub: Optional[int] = None
    exp: Optional[int] = None
    role: Optional[str] = None 


# Field Schemas
class FieldBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    crop_type: str = Field(..., min_length=1, max_length=50)
    planting_date: datetime
    latitude: Optional[Decimal] = Field(None, ge=-90, le=90)
    longitude: Optional[Decimal] = Field(None, ge=-180, le=180)

class FieldCreate(FieldBase):
    pass

class FieldUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    crop_type: Optional[str] = Field(None, min_length=1, max_length=50)
    planting_date: Optional[datetime] = None
    current_stage: Optional[FieldStage] = None

class FieldResponse(FieldBase):
    id: int
    current_stage: FieldStage
    created_by: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}

class FieldWithStatus(FieldResponse):
    computed_status: str  # "Active", "At Risk", "Completed"
    last_update: Optional[datetime] = None
    days_since_planting: Optional[int] = None
    days_since_last_update: Optional[int] = None


# Assignment Schemas
class FieldAssignRequest(BaseModel):
    agent_id: int

class FieldAssignmentResponse(BaseModel):
    id: int
    field_id: int
    agent_id: int
    assigned_at: datetime

    model_config = {"from_attributes": True}

# Update Schemas
class UpdateCreate(BaseModel):
    new_stage: FieldStage
    notes: Optional[str] = None
    image_url: Optional[str] = None

class UpdateResponse(BaseModel):
    id: int
    field_id: int
    agent_id: int
    new_stage: FieldStage
    notes: Optional[str]
    image_url: Optional[str]
    created_at: datetime
    agent_name: Optional[str] = None

    model_config = {"from_attributes": True}

#  Dashboard Schemas
class StatusBreakdown(BaseModel):
    active: int
    at_risk: int
    completed: int

class AgentWorkload(BaseModel):
    agent_id: int
    agent_name: str
    field_count: int

class CropDistribution(BaseModel):
    crop_type: str
    count: int

class AdminDashboardResponse(BaseModel):
    total_fields: int
    total_agents: int
    status_breakdown: StatusBreakdown
    agent_workload: List[AgentWorkload]
    crop_distribution: List[CropDistribution]
    recent_at_risk_fields: List[FieldWithStatus]

class AgentDashboardResponse(BaseModel):
    total_fields: int
    status_breakdown: StatusBreakdown
    pending_updates_count: int
    recent_updates: List[UpdateResponse]

# AI Schemas
class AIAlertResponse(BaseModel):
    has_alert: bool
    alert_type: Optional[str] = None
    message: Optional[str] = None
    confidence: Optional[float] = None

class StageSuggestionResponse(BaseModel):
    suggested_stage: Optional[FieldStage]
    reason: str