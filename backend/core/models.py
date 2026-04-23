from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, ForeignKey, DateTime, Boolean, Text,
    Numeric, Index, Enum as SQLEnum, UniqueConstraint
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from core.database import Base
from constants.field_stage import FieldStage
from constants.user_role import UserRole


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=False)
    role = Column(SQLEnum(UserRole), nullable=False, default=UserRole.AGENT)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    created_fields = relationship("Field", back_populates="creator", foreign_keys="Field.created_by")
    assigned_fields = relationship("FieldAssignment", back_populates="agent")
    updates = relationship("FieldUpdate", back_populates="agent")

    __table_args__ = (
        Index("idx_user_role", "role"),
        Index("idx_user_active", "is_active"),
        Index("idx_user_email", "email"),
    )


class Field(Base):
    __tablename__ = "fields"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    crop_type = Column(String, nullable=False, index=True)
    planting_date = Column(DateTime(timezone=True), nullable=False, index=True)
    current_stage = Column(SQLEnum(FieldStage), nullable=False, default=FieldStage.PLANTED)
    created_by = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # geo-location for future mapping features
    latitude = Column(Numeric(10, 6), nullable=True)
    longitude = Column(Numeric(10, 6), nullable=True)

    # Relationships
    creator = relationship("User", back_populates="created_fields", foreign_keys=[created_by])
    assignments = relationship("FieldAssignment", back_populates="field", cascade="all, delete-orphan")
    updates = relationship("FieldUpdate", back_populates="field", cascade="all, delete-orphan")

    __table_args__ = (
        Index("idx_field_crop_stage", "crop_type", "current_stage"),
        Index("idx_field_planting_date", "planting_date"),
        Index("idx_field_created_by", "created_by"),
    )


class FieldAssignment(Base):
    """Maps one field to exactly one agent. Simple version without history."""
    __tablename__ = "field_assignments"

    id = Column(Integer, primary_key=True, index=True)
    field_id = Column(Integer, ForeignKey("fields.id", ondelete="CASCADE"), nullable=False, unique=True)
    agent_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    assigned_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    field = relationship("Field", back_populates="assignments")
    agent = relationship("User", back_populates="assigned_fields")

    __table_args__ = (
        Index("idx_assignment_field", "field_id"),
        Index("idx_assignment_agent", "agent_id"),
        UniqueConstraint("field_id", name="uq_field_assignment"),
    )


class FieldUpdate(Base):
    __tablename__ = "field_updates"

    id = Column(Integer, primary_key=True, index=True)
    field_id = Column(Integer, ForeignKey("fields.id", ondelete="CASCADE"), nullable=False, index=True)
    agent_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    new_stage = Column(SQLEnum(FieldStage), nullable=False)
    notes = Column(Text, nullable=True)
    image_url = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    field = relationship("Field", back_populates="updates")
    agent = relationship("User", back_populates="updates")
    ai_alert = relationship("AIAlert", back_populates="update", uselist=False, cascade="all, delete-orphan")

    __table_args__ = (
        Index("idx_update_field_created", "field_id", "created_at"),
        Index("idx_update_agent", "agent_id"),
        Index("idx_update_stage", "new_stage"),
    )


class AIAlert(Base):
    """Optional: AI-generated alerts triggered by keywords in agent notes."""
    __tablename__ = "ai_alerts"

    id = Column(Integer, primary_key=True, index=True)
    update_id = Column(Integer, ForeignKey("field_updates.id", ondelete="CASCADE"), nullable=False, unique=True)
    alert_type = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    confidence = Column(Numeric(4, 3), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    update = relationship("FieldUpdate", back_populates="ai_alert")

    __table_args__ = (
        Index("idx_alert_update", "update_id"),
        Index("idx_alert_type_created", "alert_type", "created_at"),
    )