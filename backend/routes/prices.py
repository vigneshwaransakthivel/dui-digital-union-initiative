"""
Price comparison routes
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import statistics
import models
from database import get_db
from models import PriceSample, MaterialType

router = APIRouter(prefix="/api/prices", tags=["prices"])

class PriceComparisonRequest(BaseModel):
    material_type: str
    weight_kg: float
    offered_price_per_kg: float

class PriceStats(BaseModel):
    median_price: float
    min_price: float
    max_price: float
    average_price: float
    sample_count: int
    price_difference: float
    percentage_difference: float
    warning: Optional[str] = None

@router.post("/compare", response_model=PriceStats)
async def compare_price(request: PriceComparisonRequest, db: Session = Depends(get_db)):
    """
    Compare offered price against reference data
    """
    samples = db.query(PriceSample).filter(
        PriceSample.material_type == request.material_type
    ).all()
    
    if not samples or len(samples) < 3:
        # Return synthetic data if insufficient
        synthetic_data = get_synthetic_prices(request.material_type)
        prices = [s["price_per_kg"] for s in synthetic_data]
    else:
        prices = [s.price_per_kg for s in samples]
    
    if not prices:
        raise HTTPException(status_code=400, detail="No price data available")
    
    median_price = statistics.median(prices)
    min_price = min(prices)
    max_price = max(prices)
    average_price = statistics.mean(prices)
    price_difference = request.offered_price_per_kg - median_price
    percentage_difference = (price_difference / median_price * 100) if median_price > 0 else 0
    
    warning = None
    if len(prices) < 5:
        warning = "Limited comparison data available. Results may not be representative."
    
    return PriceStats(
        median_price=round(median_price, 2),
        min_price=round(min_price, 2),
        max_price=round(max_price, 2),
        average_price=round(average_price, 2),
        sample_count=len(prices),
        price_difference=round(price_difference, 2),
        percentage_difference=round(percentage_difference, 2),
        warning=warning
    )

@router.get("/material/{material_type}")
async def get_material_prices(material_type: str, db: Session = Depends(get_db)):
    """Get all prices for a material type"""
    samples = db.query(PriceSample).filter(
        PriceSample.material_type == material_type
    ).order_by(PriceSample.recorded_date.desc()).limit(100).all()
    
    return {
        "material_type": material_type,
        "samples": len(samples),
        "data": [{"price_per_kg": s.price_per_kg, "date": s.recorded_date} for s in samples]
    }

def get_synthetic_prices(material_type: str) -> List[dict]:
    """
    Return synthetic reference prices for comparison
    All prices are synthetic demo data
    """
    synthetic_data = {
        "plastic": [
            {"price_per_kg": 8.5}, {"price_per_kg": 9.0}, {"price_per_kg": 8.2},
            {"price_per_kg": 9.5}, {"price_per_kg": 8.8}, {"price_per_kg": 9.2}
        ],
        "paper": [
            {"price_per_kg": 5.5}, {"price_per_kg": 6.0}, {"price_per_kg": 5.8},
            {"price_per_kg": 6.2}, {"price_per_kg": 5.7}, {"price_per_kg": 6.1}
        ],
        "cardboard": [
            {"price_per_kg": 4.5}, {"price_per_kg": 5.0}, {"price_per_kg": 4.8},
            {"price_per_kg": 5.2}, {"price_per_kg": 4.6}, {"price_per_kg": 5.1}
        ],
        "aluminium": [
            {"price_per_kg": 150.0}, {"price_per_kg": 155.0}, {"price_per_kg": 148.0},
            {"price_per_kg": 160.0}, {"price_per_kg": 152.0}, {"price_per_kg": 157.0}
        ],
    }
    return synthetic_data.get(material_type.lower(), [])
