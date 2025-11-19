"""
Configuration management for Ocean Waste Detection Platform.
Uses environment variables with fallback to defaults for development.
"""
import os
from typing import Dict, Any


class Config:
    """Application configuration loaded from environment variables."""
    
    # Flask Configuration
    FLASK_HOST: str = os.getenv('FLASK_HOST', '0.0.0.0')
    FLASK_PORT: int = int(os.getenv('FLASK_PORT', '5000'))
    FLASK_DEBUG: bool = os.getenv('FLASK_DEBUG', 'False').lower() == 'true'
    
    # Model Configuration
    MODEL_PATH: str = os.getenv('MODEL_PATH', 'tf_files/retrained_graph.pb')
    LABEL_PATH: str = os.getenv('LABEL_PATH', 'tf_files/retrained_labels.txt')
    
    # Firebase Configuration
    FIREBASE_API_KEY: str = os.getenv('FIREBASE_API_KEY', '')
    FIREBASE_AUTH_DOMAIN: str = os.getenv('FIREBASE_AUTH_DOMAIN', '')
    FIREBASE_DATABASE_URL: str = os.getenv('FIREBASE_DATABASE_URL', '')
    FIREBASE_STORAGE_BUCKET: str = os.getenv('FIREBASE_STORAGE_BUCKET', '')
    FIREBASE_EMAIL: str = os.getenv('FIREBASE_EMAIL', '')
    FIREBASE_PASSWORD: str = os.getenv('FIREBASE_PASSWORD', '')
    FIREBASE_APP_ID: str = os.getenv('FIREBASE_APP_ID', '')
    FIREBASE_PROJECT_ID: str = os.getenv('FIREBASE_PROJECT_ID', '')
    FIREBASE_B_ID: str = os.getenv('FIREBASE_B_ID', '')
    
    # ML Service Configuration
    ML_SERVICE_URL: str = os.getenv('ML_SERVICE_URL', 'http://localhost:5000')
    
    # TensorFlow Configuration
    TF_CPP_MIN_LOG_LEVEL: str = os.getenv('TF_CPP_MIN_LOG_LEVEL', '3')
    CUDA_VISIBLE_DEVICES: str = os.getenv('CUDA_VISIBLE_DEVICES', '-1')
    
    @classmethod
    def get_firebase_config(cls) -> Dict[str, Any]:
        """Get Firebase configuration dictionary."""
        return {
            "API_KEY": cls.FIREBASE_API_KEY,
            "AUTH_DOMAIN": cls.FIREBASE_AUTH_DOMAIN,
            "DATABASE_URL": cls.FIREBASE_DATABASE_URL,
            "STORAGE_BUCKET": cls.FIREBASE_STORAGE_BUCKET,
            "EMAIL": cls.FIREBASE_EMAIL,
            "APP_ID": cls.FIREBASE_APP_ID,
            "projectId": cls.FIREBASE_PROJECT_ID,
            "PASS": cls.FIREBASE_PASSWORD,
            "B_ID": cls.FIREBASE_B_ID
        }
    
    @classmethod
    def validate(cls) -> bool:
        """Validate that required configuration is present."""
        required = [
            cls.MODEL_PATH,
            cls.LABEL_PATH,
        ]
        return all(required)


# Set TensorFlow environment variables
os.environ['TF_CPP_MIN_LOG_LEVEL'] = Config.TF_CPP_MIN_LOG_LEVEL
os.environ['CUDA_VISIBLE_DEVICES'] = Config.CUDA_VISIBLE_DEVICES

