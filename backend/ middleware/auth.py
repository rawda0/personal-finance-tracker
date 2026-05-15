"""
Authentication Middleware
"""

from fastapi import Header, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
import firebase_config


class AuthenticatedUser(BaseModel):
    uid: str
    email: Optional[str] = None
    email_verified: bool = False
    name: Optional[str] = None


async def get_current_user(authorization: str = Header(...)) -> AuthenticatedUser:
    if not authorization:
        raise HTTPException(
            status_code=401,
            detail="Authorization header missing"
        )
    
    parts = authorization.split(" ")
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(
            status_code=401,
            detail="Invalid authorization header format. Expected: Bearer <token>"
        )
    
    id_token = parts[1]
    
    try:
        decoded_token = firebase_config.verify_id_token(id_token)
        
        return AuthenticatedUser(
            uid=decoded_token["uid"],
            email=decoded_token.get("email"),
            email_verified=decoded_token.get("email_verified", False),
            name=decoded_token.get("name")
        )
    except Exception as e:
        raise HTTPException(
            status_code=401,
            detail=f"Invalid or expired token: {str(e)}"
        )
