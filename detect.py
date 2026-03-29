from ultralytics import YOLO
import cv2

# Load trained model
model = YOLO("runs/detect/train5/weights/best.pt")

# Load test image
image = cv2.imread("test.png")

# Detect defects
results = model(image)

for r in results:
    frame = r.plot()

cv2.imshow("Fabric Defect Detection", frame)
cv2.waitKey(0)
cv2.destroyAllWindows()