import base64
import os
import cv2
import csv
from datetime import datetime

CSV_FILE = "static/results/detections.csv"

def save_result_image(results, output_path):
    # Plot results on image and save
    if results and len(results) > 0:
        annotated_frame = results[0].plot()
        cv2.imwrite(output_path, annotated_frame)
    return output_path

def log_detection_to_csv(filename, defects):
    file_exists = os.path.isfile(CSV_FILE)
    
    with open(CSV_FILE, mode='a', newline='', encoding='utf-8') as file:
        writer = csv.writer(file)
        if not file_exists:
            writer.writerow(['Timestamp', 'Filename', 'Defects Detected', 'Defect Count'])
            
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        defect_str = ", ".join([d['name'] for d in defects]) if defects else "No Defect"
        writer.writerow([timestamp, filename, defect_str, len(defects)])

def extract_defects_info(results):
    defects = []
    if not results or len(results) == 0:
        return defects

    result = results[0]
    boxes = result.boxes
    for box in boxes:
        class_id = int(box.cls[0].item())
        confidence = float(box.conf[0].item())
        class_name = result.names[class_id]
        
        # Get coordinates in [x1, y1, x2, y2] format
        # and normalize them if needed (optional, but raw pixels are fine if we know resolution)
        coords = box.xyxyn[0].tolist() # Normalized coordinates [0, 1]
        
        defects.append({
            "name": class_name,
            "confidence": round(confidence, 2),
            "box": coords # [x1, y1, x2, y2]
        })
    return defects
    
def encode_image_base64(image_path):
    if not os.path.exists(image_path):
        return None
    with open(image_path, "rb") as image_file:
        encoded_string = base64.b64encode(image_file.read()).decode('utf-8')
    return encoded_string
