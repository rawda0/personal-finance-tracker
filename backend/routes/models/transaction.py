"""
Transaction Models
"""

from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import datetime


class TransactionBase(BaseModel):
    type: Literal["income", "expense"]
    amount: float = Field(..., gt=0)
    category: str = Field(..., min_length=1, max_length=50)
    date: str
    note: Optional[str] = Field(None, max_length=200)


class TransactionCreate(TransactionBase):
    pass


class TransactionUpdate(BaseModel):
    type: Optional[Literal["income", "expense"]] = None
    amount: Optional[float] = Field(None, gt=0)
    category: Optional[str] = Field(None, min_length=1, max_length=50)
    date: Optional[str] = None
    note: Optional[str] = Field(None, max_length=200)


class Transaction(TransactionBase):
    id: str
    user_id: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
