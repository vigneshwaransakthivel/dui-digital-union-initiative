"""
Database models for DUI
"""

from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, Text, Enum as SQLEnum
from sqlalchemy.sql import func
from datetime import datetime
from enum import Enum
from database import Base

# Enums
class UserRole(str, Enum):
    WORKER = "worker"
    ADMIN = "admin"

class MembershipStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    PENDING = "pending"

class GrievanceStatus(str, Enum):
    SUBMITTED = "submitted"
    UNDER_REVIEW = "under_review"
    RESOLVED = "resolved"
    REJECTED = "rejected"

class MaterialType(str, Enum):
    PLASTIC = "plastic"
    PAPER = "paper"
    CARDBOARD = "cardboard"
    ALUMINIUM = "aluminium"
    METAL = "metal"
    GLASS = "glass"

# Models
class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    full_name = Column(String)
    role = Column(SQLEnum(UserRole), default=UserRole.WORKER)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class Worker(Base):
    __tablename__ = "workers"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True)
    membership_id = Column(String, unique=True, index=True)
    name = Column(String)
    locality = Column(String)
    membership_status = Column(SQLEnum(MembershipStatus), default=MembershipStatus.ACTIVE)
    phone = Column(String, nullable=True)
    joined_at = Column(DateTime(timezone=True), server_default=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class Transaction(Base):
    __tablename__ = "transactions"
    
    id = Column(Integer, primary_key=True, index=True)
    worker_id = Column(Integer, index=True)
    material_type = Column(SQLEnum(MaterialType))
    weight_kg = Column(Float)
    offered_price_per_kg = Column(Float)
    final_price = Column(Float)
    buyer_name = Column(String, nullable=True)
    notes = Column(Text, nullable=True)
    transaction_date = Column(DateTime(timezone=True), server_default=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class PriceSample(Base):
    __tablename__ = "price_samples"
    
    id = Column(Integer, primary_key=True, index=True)
    material_type = Column(SQLEnum(MaterialType), index=True)
    price_per_kg = Column(Float)
    weight_kg = Column(Float)
    transaction_id = Column(Integer, index=True)
    source = Column(String, default="transaction")  # "transaction" or "synthetic"
    recorded_date = Column(DateTime(timezone=True), server_default=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Grievance(Base):
    __tablename__ = "grievances"
    
    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(String, unique=True, index=True)
    worker_id = Column(Integer, index=True)
    title = Column(String)
    description = Column(Text)
    grievance_type = Column(String)  # unfair_transaction, exclusion, recognition, workplace_issue
    status = Column(SQLEnum(GrievanceStatus), default=GrievanceStatus.SUBMITTED)
    assigned_to_admin = Column(Integer, nullable=True)
    submitted_at = Column(DateTime(timezone=True), server_default=func.now())
    resolved_at = Column(DateTime(timezone=True), nullable=True)
    resolution_notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
