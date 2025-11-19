"""
Firebase integration for Ocean Waste Detection Platform.
Handles authentication and database operations.
"""
import datetime
import logging
from typing import Dict, Any, Optional
import pyrebase
from config import Config

logger = logging.getLogger(__name__)


class Firebase:
    """Firebase client for database operations."""
    
    def __init__(self):
        """Initialize Firebase client."""
        self.firebase: Optional[Any] = None
        self.db: Optional[Any] = None
        self.auth: Optional[Any] = None
        self.user: Optional[Dict[str, Any]] = None
        self.uid: Optional[str] = None
        self._authenticated = False

    def authenticate(self) -> bool:
        """
        Authenticate with Firebase using credentials from config.
        
        Returns:
            bool: True if authentication successful, False otherwise
        """
        try:
            firebase_config = Config.get_firebase_config()
            
            # Validate required credentials
            required_keys = ["API_KEY", "AUTH_DOMAIN", "DATABASE_URL", "STORAGE_BUCKET", "EMAIL", "PASS"]
            if not all(firebase_config.get(key) for key in required_keys):
                logger.error("Missing required Firebase credentials")
                return False
            
            self.firebase = pyrebase.initialize_app({
                "apiKey": firebase_config["API_KEY"],
                "authDomain": firebase_config["AUTH_DOMAIN"],
                "databaseURL": firebase_config["DATABASE_URL"],
                "storageBucket": firebase_config["STORAGE_BUCKET"]
            })
            
            self.db = self.firebase.database()
            self.auth = self.firebase.auth()
            
            # Authenticate user
            self.user = self.auth.sign_in_with_email_and_password(
                firebase_config["EMAIL"],
                firebase_config["PASS"]
            )
            self.uid = self.user["localId"]
            self._authenticated = True
            
            logger.info("Firebase authentication successful")
            return True
            
        except Exception as e:
            logger.error(f"Firebase authentication failed: {e}")
            self._authenticated = False
            return False
        
    def push(self, result: Dict[str, Any], path: Optional[str] = None) -> bool:
        """
        Push data to Firebase database.
        
        Args:
            result: Data dictionary to push
            path: Optional custom path (defaults to configured B_ID)
            
        Returns:
            bool: True if push successful, False otherwise
        """
        if not self._authenticated:
            if not self.authenticate():
                logger.error("Cannot push: Authentication failed")
                return False
        
        try:
            if not self.user or not self.db:
                logger.error("Firebase not initialized")
                return False
            
            b_id = path or Config.FIREBASE_B_ID
            if not b_id:
                logger.error("No B_ID configured for Firebase push")
                return False
            
            update_data = {
                "current_result": result,
                "last_updated": str(datetime.datetime.now())
            }
            
            self.db.child("dummy").child(b_id).update(
                update_data,
                self.user["idToken"]
            )
            
            logger.info(f"Successfully pushed data to Firebase at path: dummy/{b_id}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to push data to Firebase: {e}")
            return False
