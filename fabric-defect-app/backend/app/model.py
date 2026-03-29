import os
from ultralytics import YOLO

# Path to the trained YOLOv8 model
MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "runs", "detect", "train5", "weights", "best.pt")

class DefectDetector:
    def __init__(self):
        # Fallback to a base model if the specific weights don't exist yet (for testing)
        model_file = MODEL_PATH if os.path.exists(MODEL_PATH) else 'yolov8n.pt'
        try:
             self.model = YOLO(model_file)
        except Exception as e:
             print(f"Error loading model: {e}")
             self.model = None

    def predict(self, image_path):
        if self.model is None:
            raise ValueError("Model not loaded properly.")
        
        # Run inference
        results = self.model(image_path)
        return results

detector = DefectDetector()
