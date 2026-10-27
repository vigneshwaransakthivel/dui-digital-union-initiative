"""
Grievance management routes
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import uuid
import models
from database import get_db
from models import Grievance, GrievanceStatus

router = APIRouter(prefix="/api/grievances", tags=["grievances"])

class GrievanceCreate(BaseModel):
    worker_id: int
    title: str
    description: str
    grievance_type: str

class GrievanceUpdate(BaseModel):
    status: Optional[str] = None
    resolution_notes: Optional[str] = None

class GrievanceResponse(BaseModel):
    id: int
    case_id: str
    worker_id: int
    title: str
    description: str
    grievance_type: str
    status: str
    submitted_at: datetime
    resolved_at: Optional[datetime]
    resolution_notes: Optional[str]
    
    class Config:
        from_attributes = True

@router.get("/", response_model=List[GrievanceResponse])
async def list_grievances(worker_id: Optional[int] = None, db: Session = Depends(get_db)):
    """Get grievances, optionally filtered by worker"""
    query = db.query(Grievance)
    if worker_id:
        query = query.filter(Grievance.worker_id == worker_id)
    return query.order_by(Grievance.submitted_at.desc()).all()

@router.get("/{grievance_id}", response_model=GrievanceResponse)
async def get_grievance(grievance_id: int, db: Session = Depends(get_db)):
    """Get grievance by ID"""
    grievance = db.query(Grievance).filter(Grievance.id == grievance_id).first()
    if not grievance:
        raise HTTPException(status_code=404, detail="Grievance not found")
    return grievance

@router.post("/", response_model=GrievanceResponse)
async def create_grievance(grievance: GrievanceCreate, db: Session = Depends(get_db)):
    """Submit new grievance"""
    case_id = f"GRV-{uuid.uuid4().hex[:8].upper()}"
    
    db_grievance = Grievance(
        case_id=case_id,
        worker_id=grievance.worker_id,
        title=grievance.title,
        description=grievance.description,
        grievance_type=grievance.grievance_type,
        status=GrievanceStatus.SUBMITTED
    )
    
    db.add(db_grievance)
    db.commit()
    db.refresh(db_grievance)
    return db_grievance

@router.put("/{grievance_id}", response_model=GrievanceResponse)
async def update_grievance(grievance_id: int, update: GrievanceUpdate, db: Session = Depends(get_db)):
    """Update grievance status (admin only)"""
    db_grievance = db.query(Grievance).filter(Grievance.id == grievance_id).first()
    if not db_grievance:
        raise HTTPException(status_code=404, detail="Grievance not found")
    
    if update.status:
        db_grievance.status = update.status
        if update.status == GrievanceStatus.RESOLVED:
            db_grievance.resolved_at = datetime.utcnow()
    
    if update.resolution_notes:
        db_grievance.resolution_notes = update.resolution_notes
    
    db.commit()
    db.refresh(db_grievance)
    return db_grievance

@router.get("/stats/summary")
async def get_grievance_stats(db: Session = Depends(get_db)):
    """Get grievance statistics"""
    total = db.query(Grievance).count()
    submitted = db.query(Grievance).filter(Grievance.status == GrievanceStatus.SUBMITTED).count()
    under_review = db.query(Grievance).filter(Grievance.status == GrievanceStatus.UNDER_REVIEW).count()
    resolved = db.query(Grievance).filter(Grievance.status == GrievanceStatus.RESOLVED).count()
    
    return {
        "total": total,
        "submitted": submitted,
        "under_review": under_review,
        "resolved": resolved
    }
