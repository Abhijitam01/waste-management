"""
Local test service for testing ML service and Firebase integration.
Uses a test image file instead of camera.
"""
import logging
import base64
import requests
from firebase import Firebase
from config import Config

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


def test_ml_service(image_path: str = "testing.png") -> dict:
    """
    Test ML service with a local image file.
    
    Args:
        image_path: Path to test image file
        
    Returns:
        Response data from ML service
    """
    try:
        # Read and encode image
        with open(image_path, "rb") as image_file:
            image_bytes = base64.b64encode(image_file.read())
        
        logger.info(f"Sending test image to ML service: {Config.ML_SERVICE_URL}")
        
        # Send to ML service
        response = requests.post(
            f"{Config.ML_SERVICE_URL}/detect",
            data=image_bytes,
            timeout=30
        )
        
        response.raise_for_status()
        response_data = response.json()
        
        logger.info("Response received from ML service")
        logger.info(f"Response: {response_data}")
        
        return response_data
        
    except FileNotFoundError:
        logger.error(f"Test image not found: {image_path}")
        raise
    except requests.exceptions.RequestException as e:
        logger.error(f"Failed to communicate with ML service: {e}")
        raise
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        raise


def test_firebase_push(result: dict) -> bool:
    """
    Test Firebase push functionality.
    
    Args:
        result: Data to push to Firebase
        
    Returns:
        bool: True if push successful, False otherwise
    """
    try:
        db = Firebase()
        if db.authenticate():
            return db.push(result)
        else:
            logger.error("Firebase authentication failed")
            return False
    except Exception as e:
        logger.error(f"Firebase push failed: {e}")
        return False


def main():
    """Main test function."""
    try:
        # Test ML service
        result = test_ml_service()
        
        # Test Firebase push
        if test_firebase_push(result):
            logger.info("Test completed successfully")
        else:
            logger.warning("ML service test passed but Firebase push failed")
            
    except Exception as e:
        logger.error(f"Test failed: {e}")
        raise


if __name__ == '__main__':
    main()