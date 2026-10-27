"""
Worker profile routes
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List
from datetime import datetime
import models
from database import get_db
from models import Worker, MembershipStatus
import uuid

router = APIRouter(prefix="/api/workers", tags=["workers"])

class WorkerCreate(BaseModel):
    name: str
    locality: str
    phone: Optional[str] = None

class WorkerUpdate(BaseModel):
    name: Optional[str] = None
    locality: Optional[str] = None
    phone: Optional[str] = None

class WorkerResponse(BaseModel):
    id: int
    membership_id: str
    name: str
    locality: str
    phone: Optional[str]
    membership_status: str
    joined_at: datetime
    
    class Config:
        from_attributes = True

@router.get("/", response_model=List[WorkerResponse])
async def list_workers(db: Session = Depends(get_db)):
    """Get all workers"""
    workers = db.query(Worker).all()
    return workers

@router.get("/{worker_id}", response_model=WorkerResponse)
async def get_worker(worker_id: int, db: Session = Depends(get_db)):
    """Get worker by ID"""
    worker = db.query(Worker).filter(Worker.id == worker_id).first()
    if not worker:
        raise HTTPException(status_code=404, detail="Worker not found")
    return worker

@router.post("/", response_model=WorkerResponse)
async def create_worker(worker: WorkerCreate, db: Session = Depends(get_db)):
    """Create new worker"""
    membership_id = f"DUI-{uuid.uuid4().hex[:8].upper()}"
    
    db_worker = Worker(
        user_id=1,  # Demo
        membership_id=membership_id,
        name=worker.name,
        locality=worker.locality,
        phone=worker.phone,
        membership_status=MembershipStatus.ACTIVE
    )
    db.add(db_worker)
    db.commit()
    db.refresh(db_worker)
    return db_worker

@router.put("/{worker_id}", response_model=WorkerResponse)
async def update_worker(worker_id: int, worker: WorkerUpdate, db: Session = Depends(get_db)):
    """Update worker profile"""
    db_worker = db.query(Worker).filter(Worker.id == worker_id).first()
    if not db_worker:
        raise HTTPException(status_code=404, detail="Worker not found")
    
    if worker.name:
        db_worker.name = worker.name
    if worker.locality:
        db_worker.locality = worker.locality
    if worker.phone:
        db_worker.phone = worker.phone
    
    db.commit()
    db.refresh(db_worker)
    return db_worker
