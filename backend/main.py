"""
DUI Backend - FastAPI Application
Digital Union Initiative for waste pickers in Chennai
"""

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Import routers
from routes import auth, workers, transactions, grievances, prices, reports

load_dotenv()

app = FastAPI(
    title="DUI API",
    description="Digital Union Initiative API for waste pickers",
    version="0.1.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:8000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(workers.router)
app.include_router(transactions.router)
app.include_router(grievances.router)
app.include_router(prices.router)
app.include_router(reports.router)

@app.get("/")
async def root():
    return {
        "message": "DUI Backend API",
        "version": "0.1.0",
        "status": "running"
    }

@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "service": "DUI API"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
