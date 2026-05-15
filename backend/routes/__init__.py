"""
Routes package
"""

from .auth import router as auth_router
from .transactions import router as transactions_router
from .savings import router as savings_router

__all__ = ["auth_router", "transactions_router", "savings_router"]
