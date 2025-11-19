"""
Flask application for Ocean Waste Detection ML Service.
Provides REST API for waste classification.
"""
import logging
import base64
from flask import Flask, request, jsonify
from flask_cors import CORS
from waste_classifier import WasteClassifier
from config import Config

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Instantiate Flask
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Initialize Classifier
try:
    classifier = WasteClassifier()
    logger.info("Waste classifier initialized successfully")
except Exception as e:
    logger.error(f"Failed to initialize classifier: {e}")
    classifier = None


@app.route('/status', methods=['GET'])
def health_check():
    """
    Health check endpoint.
    
    Returns:
        JSON response with service status
    """
    status = {
        "status": "running",
        "service": "OceanCleanup ML Service",
        "model_loaded": classifier is not None
    }
    return jsonify(status), 200


@app.route('/detect', methods=['POST'])
def detect():
    """
    Detect and classify waste in an image.
    
    Expected request:
        - POST body: Image data (raw bytes or base64 encoded)
        - Content-Type: application/octet-stream or image/*
    
    Returns:
        JSON response with classification results
    """
    if classifier is None:
        return jsonify({
            "success": False,
            "error": "Classifier not initialized"
        }), 503
    
    try:
        # Check if image data is provided
        if not request.data:
            return jsonify({
                "success": False,
                "error": "No image data provided"
            }), 400

        img_bytes = request.data
        
        # Decode base64 if sent as string, or use raw bytes
        try:
            # Handle data URI scheme if present
            if img_bytes.startswith(b'data:image'):
                if b',' in img_bytes:
                    img_bytes = img_bytes.split(b',')[1]
                img_data = base64.b64decode(img_bytes)
            # Try base64 decode if it looks like base64
            elif len(img_bytes) % 4 == 0:
                try:
                    img_data = base64.b64decode(img_bytes, validate=True)
                except Exception:
                    img_data = img_bytes
            else:
                img_data = img_bytes
        except Exception as e:
            logger.warning(f"Base64 decode failed, using raw bytes: {e}")
            img_data = img_bytes

        # Validate image data size
        if len(img_data) == 0:
            return jsonify({
                "success": False,
                "error": "Empty image data"
            }), 400
        
        if len(img_data) > 10 * 1024 * 1024:  # 10MB limit
            return jsonify({
                "success": False,
                "error": "Image too large (max 10MB)"
            }), 400

        logger.info(f"Received image for classification ({len(img_data)} bytes)")
        
        # Classify image
        results = classifier.classify(img_data)
        
        # Get top prediction
        top_label, top_score = max(results.items(), key=lambda x: x[1])

        # Return results
        return jsonify({
            "success": True,
            "predictions": results,
            "top_prediction": {
                "label": top_label,
                "confidence": top_score
            }
        }), 200

    except ValueError as e:
        logger.error(f"Validation error: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 400
        
    except Exception as e:
        logger.error(f"Error processing request: {e}", exc_info=True)
        return jsonify({
            "success": False,
            "error": "Internal server error"
        }), 500


@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors."""
    return jsonify({
        "success": False,
        "error": "Endpoint not found"
    }), 404


@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors."""
    return jsonify({
        "success": False,
        "error": "Internal server error"
    }), 500


if __name__ == '__main__':
    # Validate configuration
    if not Config.validate():
        logger.error("Configuration validation failed")
        exit(1)
    
    # Run Flask app
    app.run(
        host=Config.FLASK_HOST,
        port=Config.FLASK_PORT,
        debug=Config.FLASK_DEBUG
    )
