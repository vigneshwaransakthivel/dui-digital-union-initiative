"""
Transaction routes
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import models
from database import get_db
from models import Transaction, PriceSample, MaterialType

router = APIRouter(prefix="/api/transactions", tags=["transactions"])

class TransactionCreate(BaseModel):
    worker_id: int
    material_type: str
    weight_kg: float
    offered_price_per_kg: float
    final_price: float
    buyer_name: Optional[str] = None
    notes: Optional[str] = None

class TransactionResponse(BaseModel):
    id: int
    worker_id: int
    material_type: str
    weight_kg: float
    offered_price_per_kg: float
    final_price: float
    buyer_name: Optional[str]
    notes: Optional[str]
    transaction_date: datetime
    
    class Config:
        from_attributes = True

@router.get("/", response_model=List[TransactionResponse])
async def list_transactions(worker_id: Optional[int] = None, db: Session = Depends(get_db)):
    """Get transactions, optionally filtered by worker"""
    query = db.query(Transaction)
    if worker_id:
        query = query.filter(Transaction.worker_id == worker_id)
    return query.order_by(Transaction.transaction_date.desc()).all()

@router.get("/{transaction_id}", response_model=TransactionResponse)
async def get_transaction(transaction_id: int, db: Session = Depends(get_db)):
    """Get transaction by ID"""
    transaction = db.query(Transaction).filter(Transaction.id == transaction_id).first()
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return transaction

@router.post("/", response_model=TransactionResponse)
async def create_transaction(transaction: TransactionCreate, db: Session = Depends(get_db)):
    """Create new transaction"""
    db_transaction = Transaction(
        worker_id=transaction.worker_id,
        material_type=transaction.material_type,
        weight_kg=transaction.weight_kg,
        offered_price_per_kg=transaction.offered_price_per_kg,
        final_price=transaction.final_price,
        buyer_name=transaction.buyer_name,
        notes=transaction.notes
    )
    
    db.add(db_transaction)
    db.commit()
    db.refresh(db_transaction)
    
    # Add price sample
    price_sample = PriceSample(
        material_type=transaction.material_type,
        price_per_kg=transaction.final_price,
        weight_kg=transaction.weight_kg,
        transaction_id=db_transaction.id,
        source="transaction"
    )
    db.add(price_sample)
    db.commit()
    
    return db_transaction
