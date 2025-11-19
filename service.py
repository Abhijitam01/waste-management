"""
Raspberry Pi service for capturing images and sending to ML service.
Designed for continuous monitoring with camera.
"""
import logging
import time
import base64
import requests
from typing import Optional
from config import Config

try:
    import picamera
    PICAMERA_AVAILABLE = True
except ImportError:
    PICAMERA_AVAILABLE = False
    logging.warning("picamera not available. Camera functionality disabled.")

logger = logging.getLogger(__name__)


class CameraService:
    """Service for capturing images and sending to ML service."""
    
    def __init__(
        self,
        ml_service_url: Optional[str] = None,
        image_path: str = "temp.png",
        capture_interval: int = 60
    ):
        """
        Initialize camera service.
        
        Args:
            ml_service_url: URL of the ML service endpoint
            image_path: Path to save captured images
            capture_interval: Interval between captures in seconds
        """
        self.ml_service_url = ml_service_url or Config.ML_SERVICE_URL
        self.image_path = image_path
        self.capture_interval = capture_interval
        self.camera_available = PICAMERA_AVAILABLE
        
    def capture_image(self) -> bool:
        """
        Capture an image using the camera.
        
        Returns:
            bool: True if capture successful, False otherwise
        """
        if not self.camera_available:
            logger.error("Camera not available")
            return False
        
        try:
            with picamera.PiCamera() as camera:
                logger.info("Opening camera...")
                time.sleep(2)  # Allow camera to initialize
                camera.capture(self.image_path)
                logger.info(f"Image captured: {self.image_path}")
                return True
        except Exception as e:
            logger.error(f"Failed to capture image: {e}")
            return False
    
    def send_image(self, image_path: Optional[str] = None) -> Optional[dict]:
        """
        Send image to ML service for classification.
        
        Args:
            image_path: Path to image file (defaults to self.image_path)
            
        Returns:
            Response data from ML service or None if failed
        """
        path = image_path or self.image_path
        
        try:
            # Read image file
            with open(path, "rb") as image_file:
                image_bytes = base64.b64encode(image_file.read())
            
            logger.info(f"Sending image to ML service: {self.ml_service_url}")
            
            # Send to ML service
            response = requests.post(
                f"{self.ml_service_url}/detect",
                data=image_bytes,
                timeout=30
            )
            
            response.raise_for_status()
            response_data = response.json()
            
            logger.info(f"Response received: {response_data}")
            return response_data
            
        except FileNotFoundError:
            logger.error(f"Image file not found: {path}")
            return None
        except requests.exceptions.RequestException as e:
            logger.error(f"Failed to send image to ML service: {e}")
            return None
        except Exception as e:
            logger.error(f"Unexpected error sending image: {e}")
            return None
    
    def capture_and_send(self) -> Optional[dict]:
        """
        Capture image and send to ML service.
        
        Returns:
            Response data from ML service or None if failed
        """
        if self.capture_image():
            return self.send_image()
        return None
    
    def run_continuous(self):
        """Run continuous capture and send loop."""
        logger.info("Starting continuous capture service...")
        logger.info(f"Capture interval: {self.capture_interval} seconds")
        
        while True:
            try:
                self.capture_and_send()
                time.sleep(self.capture_interval)
            except KeyboardInterrupt:
                logger.info("Service stopped by user")
                break
            except Exception as e:
                logger.error(f"Error in continuous loop: {e}")
                time.sleep(self.capture_interval)


def main():
    """Main entry point for camera service."""
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    service = CameraService()
    service.run_continuous()


if __name__ == '__main__':
    main()