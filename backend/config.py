"""
Application Configuration
"""

import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent

FIREBASE_SERVICE_ACCOUNT_PATH = os.getenv(
    "FIREBASE_SERVICE_ACCOUNT_PATH",
    str(BASE_DIR.parent / "personal-finance-tracker-ae902-firebase-adminsdk-fbsvc-17e91b13ab.json")
)
FIREBASE_PROJECT_ID = os.getenv("FIREBASE_PROJECT_ID", "personal-finance-tracker-ae902")

HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", 8000))
DEBUG = os.getenv("DEBUG", "True").lower() == "true"

ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:5500,http://127.0.0.1:5500,http://localhost:3000,null"
).split(",")
