"""
Savings Goals Routes
"""

from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime
from typing import List

from middleware.auth import get_current_user, AuthenticatedUser
from models.savings import SavingsGoal, SavingsGoalCreate, SavingsGoalUpdate
import firebase_config

router = APIRouter(prefix="/api/savings", tags=["Savings Goals"])


@router.get("", response_model=List[SavingsGoal])
async def list_savings_goals(
    current_user: AuthenticatedUser = Depends(get_current_user)
):
    db = firebase_config.get_firestore_client()
    
    goals_ref = db.collection("users").document(current_user.uid).collection("savingsGoals")
    docs = goals_ref.order_by("created_at", direction="DESCENDING").stream()
    
    goals = []
    for doc in docs:
        data = doc.to_dict()
        goals.append(SavingsGoal(
            id=doc.id,
            user_id=current_user.uid,
            name=data.get("name"),
            target_amount=data.get("target_amount"),
            current_savings=data.get("current_savings", 0),
            created_at=data.get("created_at"),
            updated_at=data.get("updated_at")
        ))
    
    return goals


@router.post("", response_model=SavingsGoal)
async def create_savings_goal(
    goal: SavingsGoalCreate,
    current_user: AuthenticatedUser = Depends(get_current_user)
):
    db = firebase_config.get_firestore_client()
    
    now = datetime.utcnow()
    goal_data = {
        "name": goal.name,
        "target_amount": goal.target_amount,
        "current_savings": goal.current_savings,
        "created_at": now,
        "updated_at": now
    }
    
    goals_ref = db.collection("users").document(current_user.uid).collection("savingsGoals")
    doc_ref = goals_ref.document()
    doc_ref.set(goal_data)
    
    return SavingsGoal(
        id=doc_ref.id,
        user_id=current_user.uid,
        name=goal.name,
        target_amount=goal.target_amount,
        current_savings=goal.current_savings,
        created_at=now,
        updated_at=now
    )


@router.get("/{goal_id}", response_model=SavingsGoal)
async def get_savings_goal(
    goal_id: str,
    current_user: AuthenticatedUser = Depends(get_current_user)
):
    db = firebase_config.get_firestore_client()
    
    doc_ref = db.collection("users").document(current_user.uid).collection("savingsGoals").document(goal_id)
    doc = doc_ref.get()
    
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Savings goal not found")
    
    data = doc.to_dict()
    return SavingsGoal(
        id=doc.id,
        user_id=current_user.uid,
        name=data.get("name"),
        target_amount=data.get("target_amount"),
        current_savings=data.get("current_savings", 0),
        created_at=data.get("created_at"),
        updated_at=data.get("updated_at")
    )


@router.put("/{goal_id}", response_model=SavingsGoal)
async def update_savings_goal(
    goal_id: str,
    updates: SavingsGoalUpdate,
    current_user: AuthenticatedUser = Depends(get_current_user)
):
    db = firebase_config.get_firestore_client()
    
    doc_ref = db.collection("users").document(current_user.uid).collection("savingsGoals").document(goal_id)
    doc = doc_ref.get()
    
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Savings goal not found")
    
    update_data = {}
    if updates.name is not None:
        update_data["name"] = updates.name
    if updates.target_amount is not None:
        update_data["target_amount"] = updates.target_amount
    if updates.current_savings is not None:
        update_data["current_savings"] = updates.current_savings
    
    if update_data:
        update_data["updated_at"] = datetime.utcnow()
        doc_ref.update(update_data)
    
    updated_doc = doc_ref.get()
    data = updated_doc.to_dict()
    
    return SavingsGoal(
        id=updated_doc.id,
        user_id=current_user.uid,
        name=data.get("name"),
        target_amount=data.get("target_amount"),
        current_savings=data.get("current_savings", 0),
        created_at=data.get("created_at"),
        updated_at=data.get("updated_at")
    )


@router.delete("/{goal_id}")
async def delete_savings_goal(
    goal_id: str,
    current_user: AuthenticatedUser = Depends(get_current_user)
):
    db = firebase_config.get_firestore_client()
    
    doc_ref = db.collection("users").document(current_user.uid).collection("savingsGoals").document(goal_id)
    doc = doc_ref.get()
    
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Savings goal not found")
    
    doc_ref.delete()
    
    return {"message": "Savings goal deleted successfully", "id": goal_id}
