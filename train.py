from ultralytics import YOLO

# Load YOLOv8 small model
model = YOLO("yolov8n.pt")

# Train model
model.train(
    data="data.yaml",
    epochs=10,
    imgsz=640,
    batch=8
)
