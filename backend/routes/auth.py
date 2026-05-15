"""
Authentication Routes
"""

from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime
from typing import Optional

from middleware.auth import get_current_user, AuthenticatedUser
from models.user import UserProfile, UserProfileCreate, UserProfileUpdate
import firebase_config

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/register", response_model=UserProfile)
async def create_user_profile(
    profile: UserProfileCreate,
    current_user: AuthenticatedUser = Depends(get_current_user)
):
    db = firebase_config.get_firestore_client()
    
    user_ref = db.collection("users").document(current_user.uid)
    existing = user_ref.get()
    
    if existing.exists:
        raise HTTPException(
            status_code=400,
            detail="User profile already exists"
        )
    
    now = datetime.utcnow()
    user_data = {
        "username": profile.username,
        "email": profile.email,
        "created_at": now,
        "updated_at": now
    }
    
    user_ref.set(user_data)
    
    return UserProfile(
        uid=current_user.uid,
        username=profile.username,
        email=profile.email,
        created_at=now,
        updated_at=now
    )


@router.get("/profile", response_model=UserProfile)
async def get_user_profile(
    current_user: AuthenticatedUser = Depends(get_current_user)
):
    db = firebase_config.get_firestore_client()
    
    user_ref = db.collection("users").document(current_user.uid)
    user_doc = user_ref.get()
    
    if not user_doc.exists:
        raise HTTPException(
            status_code=404,
            detail="User profile not found"
        )
    
    data = user_doc.to_dict()
    return UserProfile(
        uid=current_user.uid,
        username=data.get("username", ""),
        email=data.get("email", current_user.email or ""),
        created_at=data.get("created_at"),
        updated_at=data.get("updated_at")
    )


@router.put("/profile", response_model=UserProfile)
async def update_user_profile(
    updates: UserProfileUpdate,
    current_user: AuthenticatedUser = Depends(get_current_user)
):
    db = firebase_config.get_firestore_client()
    
    user_ref = db.collection("users").document(current_user.uid)
    user_doc = user_ref.get()
    
    if not user_doc.exists:
        raise HTTPException(
            status_code=404,
            detail="User profile not found"
        )
    
    update_data = {}
    if updates.username is not None:
        update_data["username"] = updates.username
    
    if update_data:
        update_data["updated_at"] = datetime.utcnow()
        user_ref.update(update_data)
    
    updated_doc = user_ref.get()
    data = updated_doc.to_dict()
    
    return UserProfile(
        uid=current_user.uid,
        username=data.get("username", ""),
        email=data.get("email", current_user.email or ""),
        created_at=data.get("created_at"),
        updated_at=data.get("updated_at")
    )


@router.get("/verify")
async def verify_token(
    current_user: AuthenticatedUser = Depends(get_current_user)
):
    db = firebase_config.get_firestore_client()
    
    user_ref = db.collection("users").document(current_user.uid)
    user_doc = user_ref.get()
    
    profile = None
    if user_doc.exists:
        data = user_doc.to_dict()
        profile = {
            "username": data.get("username"),
            "email": data.get("email")
        }
    
    return {
        "valid": True,
        "uid": current_user.uid,
        "email": current_user.email,
        "email_verified": current_user.email_verified,
        "profile": profile
    }
