from fastapi import APIRouter, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
import shutil
import os
import uuid
import cv2
from fastapi.responses import JSONResponse, StreamingResponse
from app.model import detector
from app.utils import save_result_image, log_detection_to_csv, extract_defects_info, encode_image_base64

router = APIRouter()

@router.post("/predict")
async def predict_defect(file: UploadFile = File(...)):
    try:
        # Validate file
        if not file.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="File provided is not an image.")
            
        # Create unique filenames
        file_id = str(uuid.uuid4())
        ext = file.filename.split('.')[-1] if '.' in file.filename else 'jpg'
        if len(ext) > 5 or not ext.isalnum():
            ext = 'jpg'
            
        filename = f"{file_id}.{ext}"
        
        upload_path = os.path.join("static", "uploads", filename)
        result_path = os.path.join("static", "results", f"result_{filename}")
        
        # Save uploaded file
        with open(upload_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # Perform detection with lower confidence to catch subtle defects
        results = detector.model(upload_path, conf=0.15)
        
        # Process results
        defects = extract_defects_info(results)
        
        # Save output image
        save_result_image(results, result_path)
        
        # Log to CSV
        log_detection_to_csv(filename, defects)
        
        # Encode result image to base64 to send to frontend
        base64_img = encode_image_base64(result_path)
        
        # If no defects detected, base64_img won't have boxes, we can still return it
        # Actually save_result_image plots boxes. If no detections, it still plots (nothing)
        # However if we wanted we can return original image or the empty plotted one
        
        return JSONResponse(content={
            "success": True,
            "message": "Detection completed successfully.",
            "defects": defects,
            "has_defects": len(defects) > 0,
            "result_image_base64": f"data:image/jpeg;base64,{base64_img}" if base64_img else None,
            "result_image_url": f"/static/results/result_{filename}"
        })
        
    except Exception as e:
        print(f"Error during prediction: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/live_scan")
async def live_scan(file: UploadFile = File(...)):
    try:
        # 1. Read directly into memory (NO saving to disk!)
        contents = await file.read()
        import numpy as np
        # Convert to OpenCV image
        nparr = np.frombuffer(contents, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if frame is None:
            return JSONResponse({"success": False, "error": "Invalid image data"})

        # 2. Run detector with high sensitivity
        results = detector.model(frame, verbose=False, conf=0.15)
        
        # 3. Extract boxes
        defects = extract_defects_info(results)
        
        return {
            "success": True,
            "defects": defects,
            "has_defects": len(defects) > 0
        }
    except Exception as e:
        print(f"Live Scan Error: {e}")
        return JSONResponse({"success": False, "error": str(e)}, status_code=500)

@router.get("/video_feed")
def video_feed():
    def generate_frames():
        # Start reading the server's local camera (the same way your old camera.py did)
        cap = cv2.VideoCapture(0)
        if not cap.isOpened():
            print("Cannot open camera")
            return
            
        while True:
            success, frame = cap.read()
            if not success:
                break
                
            # Perform YOLO live detection on the frame
            if detector.model is not None:
                results = detector.model(frame, verbose=False)
                for r in results:
                    frame = r.plot()  # Draw bounding boxes
            
            # Encode frame explicitly to JPEG
            ret, buffer = cv2.imencode('.jpg', frame)
            if not ret:
                continue
                
            # Yield the frame to the active stream
            frame_bytes = buffer.tobytes()
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
                   
        cap.release()

    # Returns the multipart MJPEG stream that browsers and React Native Image components can render natively
    return StreamingResponse(generate_frames(), media_type="multipart/x-mixed-replace; boundary=frame")
