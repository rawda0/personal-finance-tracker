"""
Firebase Admin SDK Configuration
"""

import firebase_admin
from firebase_admin import credentials, firestore, auth
from pathlib import Path
import config

_firebase_app = None
_firestore_client = None


def initialize_firebase():
    global _firebase_app, _firestore_client
    
    if _firebase_app is not None:
        return _firebase_app
    
    service_account_path = Path(config.FIREBASE_SERVICE_ACCOUNT_PATH)
    if not service_account_path.is_absolute():
        service_account_path = config.BASE_DIR / config.FIREBASE_SERVICE_ACCOUNT_PATH
    
    if not service_account_path.exists():
        raise FileNotFoundError(
            f"Firebase service account file not found at: {service_account_path}"
        )
    
    cred = credentials.Certificate(str(service_account_path))
    _firebase_app = firebase_admin.initialize_app(cred, {
        'projectId': config.FIREBASE_PROJECT_ID
    })
    
    _firestore_client = firestore.client()
    
    return _firebase_app


def get_firestore_client():
    global _firestore_client
    if _firestore_client is None:
        initialize_firebase()
    return _firestore_client


def get_auth_client():
    if _firebase_app is None:
        initialize_firebase()
    return auth


def verify_id_token(id_token: str) -> dict:
    if _firebase_app is None:
        initialize_firebase()
    return auth.verify_id_token(id_token)
