"""
User Profile Models
"""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class UserProfileBase(BaseModel):
    username: str = Field(..., min_length=2, max_length=50)
    email: str = Field(..., min_length=5, max_length=100)


class UserProfileCreate(UserProfileBase):
    pass


class UserProfileUpdate(BaseModel):
    username: Optional[str] = Field(None, min_length=2, max_length=50)


class UserProfile(UserProfileBase):
    uid: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
