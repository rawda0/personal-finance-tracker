"""
Personal Finance Tracker - FastAPI Backend
Main application entry point.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

import config
import firebase_config
from routes import auth_router, transactions_router, savings_router

firebase_config.initialize_firebase()

app = FastAPI(
    title="Personal Finance Tracker API",
    description="Backend API for Personal Finance Tracker with Firebase integration",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=config.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(transactions_router)
app.include_router(savings_router)


@app.get("/")
async def root():
    return {
        "message": "Personal Finance Tracker API",
        "status": "running",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=config.HOST,
        port=config.PORT,
        reload=config.DEBUG
    )
