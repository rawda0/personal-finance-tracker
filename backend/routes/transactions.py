"""
Transaction Routes
"""

from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime
from typing import List

from middleware.auth import get_current_user, AuthenticatedUser
from models.transaction import Transaction, TransactionCreate, TransactionUpdate
import firebase_config

router = APIRouter(prefix="/api/transactions", tags=["Transactions"])


@router.get("", response_model=List[Transaction])
async def list_transactions(
    current_user: AuthenticatedUser = Depends(get_current_user)
):
    db = firebase_config.get_firestore_client()
    
    transactions_ref = db.collection("users").document(current_user.uid).collection("transactions")
    docs = transactions_ref.order_by("date", direction="DESCENDING").stream()
    
    transactions = []
    for doc in docs:
        data = doc.to_dict()
        transactions.append(Transaction(
            id=doc.id,
            user_id=current_user.uid,
            type=data.get("type"),
            amount=data.get("amount"),
            category=data.get("category"),
            date=data.get("date"),
            note=data.get("note"),
            created_at=data.get("created_at"),
            updated_at=data.get("updated_at")
        ))
    
    return transactions


@router.post("", response_model=Transaction)
async def create_transaction(
    transaction: TransactionCreate,
    current_user: AuthenticatedUser = Depends(get_current_user)
):
    db = firebase_config.get_firestore_client()
    
    now = datetime.utcnow()
    transaction_data = {
        "type": transaction.type,
        "amount": transaction.amount,
        "category": transaction.category,
        "date": transaction.date,
        "note": transaction.note or "",
        "created_at": now,
        "updated_at": now
    }
    
    transactions_ref = db.collection("users").document(current_user.uid).collection("transactions")
    doc_ref = transactions_ref.document()
    doc_ref.set(transaction_data)
    
    return Transaction(
        id=doc_ref.id,
        user_id=current_user.uid,
        type=transaction.type,
        amount=transaction.amount,
        category=transaction.category,
        date=transaction.date,
        note=transaction.note,
        created_at=now,
        updated_at=now
    )


@router.get("/{transaction_id}", response_model=Transaction)
async def get_transaction(
    transaction_id: str,
    current_user: AuthenticatedUser = Depends(get_current_user)
):
    db = firebase_config.get_firestore_client()
    
    doc_ref = db.collection("users").document(current_user.uid).collection("transactions").document(transaction_id)
    doc = doc_ref.get()
    
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    data = doc.to_dict()
    return Transaction(
        id=doc.id,
        user_id=current_user.uid,
        type=data.get("type"),
        amount=data.get("amount"),
        category=data.get("category"),
        date=data.get("date"),
        note=data.get("note"),
        created_at=data.get("created_at"),
        updated_at=data.get("updated_at")
    )


@router.put("/{transaction_id}", response_model=Transaction)
async def update_transaction(
    transaction_id: str,
    updates: TransactionUpdate,
    current_user: AuthenticatedUser = Depends(get_current_user)
):
    db = firebase_config.get_firestore_client()
    
    doc_ref = db.collection("users").document(current_user.uid).collection("transactions").document(transaction_id)
    doc = doc_ref.get()
    
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    update_data = {}
    if updates.type is not None:
        update_data["type"] = updates.type
    if updates.amount is not None:
        update_data["amount"] = updates.amount
    if updates.category is not None:
        update_data["category"] = updates.category
    if updates.date is not None:
        update_data["date"] = updates.date
    if updates.note is not None:
        update_data["note"] = updates.note
    
    if update_data:
        update_data["updated_at"] = datetime.utcnow()
        doc_ref.update(update_data)
    
    updated_doc = doc_ref.get()
    data = updated_doc.to_dict()
    
    return Transaction(
        id=updated_doc.id,
        user_id=current_user.uid,
        type=data.get("type"),
        amount=data.get("amount"),
        category=data.get("category"),
        date=data.get("date"),
        note=data.get("note"),
        created_at=data.get("created_at"),
        updated_at=data.get("updated_at")
    )


@router.delete("/{transaction_id}")
async def delete_transaction(
    transaction_id: str,
    current_user: AuthenticatedUser = Depends(get_current_user)
):
    db = firebase_config.get_firestore_client()
    
    doc_ref = db.collection("users").document(current_user.uid).collection("transactions").document(transaction_id)
    doc = doc_ref.get()
    
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    doc_ref.delete()
    
    return {"message": "Transaction deleted successfully", "id": transaction_id}
