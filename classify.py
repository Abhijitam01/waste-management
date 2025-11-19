"""
Standalone image classification script.
This is a simplified version for command-line usage.
For production use, prefer the WasteClassifier class.
"""
import sys
import logging
from waste_classifier import WasteClassifier
from config import Config

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


def analyse(image_path: str) -> dict:
    """
    Analyse an image and return classification results.
    
    Args:
        image_path: Path to the image file
        
    Returns:
        Dictionary mapping label names to confidence scores
    """
    try:
        # Read image file
        with open(image_path, 'rb') as f:
            image_data = f.read()
        
        # Use WasteClassifier for consistency
        classifier = WasteClassifier()
        results = classifier.classify(image_data)
        
        logger.info(f"Classification complete for {image_path}")
        return results
        
    except FileNotFoundError:
        logger.error(f"Image file not found: {image_path}")
        raise
    except Exception as e:
        logger.error(f"Error during analysis: {e}")
        raise


def main():
    """Main entry point for command-line usage."""
    if len(sys.argv) > 1:
        image_path = sys.argv[1]
        try:
            results = analyse(image_path)
            print("\nClassification Results:")
            print("-" * 50)
            for label, score in sorted(results.items(), key=lambda x: x[1], reverse=True):
                print(f"{label:20s}: {score:.4f} ({score*100:.2f}%)")
            print("-" * 50)
            top_label, top_score = max(results.items(), key=lambda x: x[1])
            print(f"\nTop Prediction: {top_label} ({top_score*100:.2f}% confidence)")
        except Exception as e:
            print(f"Error during analysis: {e}")
            import traceback
            traceback.print_exc()
            sys.exit(1)
    else:
        print("Usage: python classify.py <image_path>")
        print("Example: python classify.py testing.png")
        sys.exit(1)


if __name__ == "__main__":
    main()