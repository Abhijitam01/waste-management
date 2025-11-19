"""
Waste Classification Module using TensorFlow.
Provides image classification for waste types.
"""
import logging
from typing import Dict, Any, Optional
import tensorflow as tf
import numpy as np
from config import Config

logger = logging.getLogger(__name__)


class WasteClassifier:
    """
    Waste classifier using TensorFlow model.
    Classifies images into waste categories.
    """
    
    def __init__(
        self,
        model_path: Optional[str] = None,
        label_path: Optional[str] = None
    ):
        """
        Initialize the waste classifier.
        
        Args:
            model_path: Path to the TensorFlow model file
            label_path: Path to the labels file
        """
        self.model_path = model_path or Config.MODEL_PATH
        self.label_path = label_path or Config.LABEL_PATH
        self.graph: Optional[tf.Graph] = None
        self.sess: Optional[tf.Session] = None
        self.labels: Optional[list] = None
        self.input_operation: Optional[tf.Tensor] = None
        self.output_operation: Optional[tf.Tensor] = None
        
        self._load_model()

    def _load_model(self) -> None:
        """Load the TensorFlow model and labels."""
        try:
            logger.info("Loading waste classification model...")
            
            # Load labels
            if not tf.io.gfile.exists(self.label_path):
                raise FileNotFoundError(f"Labels file not found: {self.label_path}")
            
            self.labels = [
                line.rstrip() 
                for line in tf.io.gfile.GFile(self.label_path, 'r')
            ]
            
            if not self.labels:
                raise ValueError("No labels found in labels file")
            
            # Load model graph
            if not tf.io.gfile.exists(self.model_path):
                raise FileNotFoundError(f"Model file not found: {self.model_path}")
            
            self.graph = tf.compat.v1.Graph()
            with self.graph.as_default():
                graph_def = tf.compat.v1.GraphDef()
                with tf.io.gfile.GFile(self.model_path, 'rb') as f:
                    graph_def.ParseFromString(f.read())
                    tf.import_graph_def(graph_def, name='')

            # Create session and get operations
            self.sess = tf.compat.v1.Session(graph=self.graph)
            self.input_operation = self.graph.get_tensor_by_name('DecodeJpeg/contents:0')
            self.output_operation = self.graph.get_tensor_by_name('final_result:0')
            
            logger.info(f"Model loaded successfully with {len(self.labels)} labels")
            
        except Exception as e:
            logger.error(f"Failed to load model: {e}")
            raise

    def classify(self, image_data: bytes) -> Dict[str, float]:
        """
        Classify an image and return predictions.
        
        Args:
            image_data: Image data as bytes
            
        Returns:
            Dictionary mapping label names to confidence scores
            
        Raises:
            RuntimeError: If model is not loaded
            ValueError: If image_data is invalid
        """
        if not self.sess:
            raise RuntimeError("Model not loaded. Cannot classify image.")
        
        if not image_data:
            raise ValueError("Image data is empty")
        
        try:
            # Run inference
            predictions = self.sess.run(
                self.output_operation,
                {self.input_operation: image_data}
            )
            
            # Get top predictions
            top_indices = np.argsort(predictions[0])[::-1]
            
            results = {}
            for i in top_indices:
                if i < len(self.labels):
                    human_string = self.labels[i]
                    score = float(predictions[0][i])
                    results[human_string] = score
            
            logger.debug(f"Classification completed. Top prediction: {max(results.items(), key=lambda x: x[1])}")
            return results
            
        except Exception as e:
            logger.error(f"Error during classification: {e}")
            raise

    def get_top_prediction(self, image_data: bytes) -> tuple[str, float]:
        """
        Get the top prediction for an image.
        
        Args:
            image_data: Image data as bytes
            
        Returns:
            Tuple of (label, confidence_score)
        """
        results = self.classify(image_data)
        top_label, top_score = max(results.items(), key=lambda x: x[1])
        return top_label, top_score

    def __del__(self):
        """Cleanup resources on deletion."""
        if self.sess:
            try:
                self.sess.close()
            except Exception as e:
                logger.warning(f"Error closing session: {e}")
