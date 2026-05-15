"""
Savings Goal Models
"""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class SavingsGoalBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    target_amount: float = Field(..., gt=0)
    current_savings: float = Field(0, ge=0)


class SavingsGoalCreate(SavingsGoalBase):
    pass


class SavingsGoalUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    target_amount: Optional[float] = Field(None, gt=0)
    current_savings: Optional[float] = Field(None, ge=0)


class SavingsGoal(SavingsGoalBase):
    id: str
    user_id: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
