"""
Authentication routes
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import Optional
from pydantic import BaseModel
import models
from database import get_db
from models import User, UserRole

router = APIRouter(prefix="/api/auth", tags=["auth"])

class LoginRequest(BaseModel):
    email: str
    password: str

class LoginResponse(BaseModel):
    id: int
    email: str
    name: str
    role: UserRole
    token: str

class DemoUser(BaseModel):
    email: str
    name: str
    role: str

# Demo credentials (for prototype)
DEMO_USERS = {
    "worker@demo.com": {"password": "worker123", "name": "Demo Worker", "role": "worker"},
    "admin@demo.com": {"password": "admin123", "name": "Demo Admin", "role": "admin"},
}

@router.post("/login", response_model=LoginResponse)
async def login(request: LoginRequest, db: Session = Depends(get_db)):
    """
    Demo login endpoint
    """
    if request.email not in DEMO_USERS:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    user_data = DEMO_USERS[request.email]
    if user_data["password"] != request.password:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # For demo, we'll use fixed IDs
    demo_id = 1 if request.email == "worker@demo.com" else 2
    
    return LoginResponse(
        id=demo_id,
        email=request.email,
        name=user_data["name"],
        role=user_data["role"],
        token=f"demo_token_{demo_id}"
    )

@router.post("/demo-login")
async def demo_login(role: str):
    """
    Quick demo login for testing
    """
    if role == "worker":
        return LoginResponse(
            id=1,
            email="worker@demo.com",
            name="Demo Worker",
            role="worker",
            token="demo_worker_token"
        )
    elif role == "admin":
        return LoginResponse(
            id=2,
            email="admin@demo.com",
            name="Demo Admin",
            role="admin",
            token="demo_admin_token"
        )
    else:
        raise HTTPException(status_code=400, detail="Invalid role")

@router.get("/me")
async def get_current_user():
    """
    Get current user (demo)
    """
    return {"id": 1, "email": "worker@demo.com", "role": "worker"}
