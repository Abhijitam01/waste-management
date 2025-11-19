"""
Simple test script for image classification.
"""
import sys
from classify import analyse

if __name__ == "__main__":
    image_path = sys.argv[1] if len(sys.argv) > 1 else "testing.png"
    
    try:
        result = analyse(image_path)
        print("\nClassification Results:")
        print("=" * 50)
        for label, score in sorted(result.items(), key=lambda x: x[1], reverse=True):
            print(f"{label:20s}: {score:.4f} ({score*100:.2f}%)")
        print("=" * 50)
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)

