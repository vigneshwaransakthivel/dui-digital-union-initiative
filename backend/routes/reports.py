"""
Collective bargaining reports
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
import statistics
import models
from database import get_db
from models import Transaction, Grievance, PriceSample, MaterialType

router = APIRouter(prefix="/api/reports", tags=["reports"])

@router.get("/dashboard-stats")
async def get_dashboard_stats(db: Session = Depends(get_db)):
    """Get dashboard overview statistics"""
    from models import Worker
    
    total_workers = db.query(Worker).count()
    total_transactions = db.query(Transaction).count()
    pending_grievances = db.query(Grievance).filter(
        Grievance.status.in_(["submitted", "under_review"])
    ).count()
    
    # Calculate average price per material
    avg_prices = {}
    for material in ["plastic", "paper", "cardboard", "aluminium"]:
        samples = db.query(PriceSample).filter(
            PriceSample.material_type == material
        ).all()
        if samples:
            avg_prices[material] = round(statistics.mean([s.price_per_kg for s in samples]), 2)
    
    return {
        "total_workers": total_workers,
        "total_transactions": total_transactions,
        "pending_grievances": pending_grievances,
        "average_prices": avg_prices
    }

@router.get("/recent-activities")
async def get_recent_activities(limit: int = 10, db: Session = Depends(get_db)):
    """Get recent transactions and grievances"""
    transactions = db.query(Transaction).order_by(
        Transaction.transaction_date.desc()
    ).limit(limit).all()
    
    grievances = db.query(Grievance).order_by(
        Grievance.submitted_at.desc()
    ).limit(limit).all()
    
    activities = []
    
    for t in transactions:
        activities.append({
            "type": "transaction",
            "timestamp": t.transaction_date,
            "description": f"Transaction recorded: {t.material_type} ({t.weight_kg}kg)"
        })
    
    for g in grievances:
        activities.append({
            "type": "grievance",
            "timestamp": g.submitted_at,
            "description": f"Grievance submitted: {g.title}"
        })
    
    # Sort by timestamp
    activities.sort(key=lambda x: x["timestamp"], reverse=True)
    return activities[:limit]

@router.get("/material-prices")
async def get_material_prices_report(db: Session = Depends(get_db)):
    """Get aggregated price data for all materials"""
    materials = ["plastic", "paper", "cardboard", "aluminium"]
    report = {}
    
    for material in materials:
        samples = db.query(PriceSample).filter(
            PriceSample.material_type == material
        ).all()
        
        if samples:
            prices = [s.price_per_kg for s in samples]
            report[material] = {
                "median": round(statistics.median(prices), 2),
                "min": round(min(prices), 2),
                "max": round(max(prices), 2),
                "average": round(statistics.mean(prices), 2),
                "samples": len(prices)
            }
    
    return {
        "note": "All price data is synthetic for demonstration",
        "materials": report
    }

@router.get("/grievance-types")
async def get_grievance_types_report(db: Session = Depends(get_db)):
    """Get aggregated grievance data by type"""
    grievances = db.query(Grievance).all()
    
    type_counts = {}
    for g in grievances:
        g_type = g.grievance_type
        type_counts[g_type] = type_counts.get(g_type, 0) + 1
    
    status_counts = {}
    for g in grievances:
        status = g.status
        status_counts[status] = status_counts.get(status, 0) + 1
    
    return {
        "by_type": type_counts,
        "by_status": status_counts,
        "total": len(grievances)
    }

@router.get("/worker-statistics")
async def get_worker_statistics(db: Session = Depends(get_db)):
    """Get worker participation statistics"""
    from models import Worker
    
    workers = db.query(Worker).all()
    
    transactions_per_worker = []
    for worker in workers:
        trans_count = db.query(Transaction).filter(
            Transaction.worker_id == worker.id
        ).count()
        transactions_per_worker.append({
            "worker_id": worker.id,
            "name": worker.name,
            "locality": worker.locality,
            "transactions": trans_count
        })
    
    return {
        "total_workers": len(workers),
        "workers": sorted(transactions_per_worker, key=lambda x: x["transactions"], reverse=True)
    }
