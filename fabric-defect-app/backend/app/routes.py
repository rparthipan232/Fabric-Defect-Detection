from fastapi import APIRouter, File, UploadFile, HTTPException, Depends
from fastapi.responses import JSONResponse
import shutil
import os
import uuid
import cv2
from datetime import datetime
from app.model import detector
from app.utils import save_result_image, extract_defects_info, encode_image_base64
from app.auth import get_current_user
from app.database import get_db

router = APIRouter(tags=["detection"])

@router.post("/predict")
async def predict_defect(
    file: UploadFile = File(...), 
    current_user: dict = Depends(get_current_user)
):
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
        
        # Ensure static directories exist
        os.makedirs("static/uploads", exist_ok=True)
        os.makedirs("static/results", exist_ok=True)
        
        upload_path = os.path.join("static", "uploads", filename)
        result_path = os.path.join("static", "results", f"result_{filename}")
        
        # Save uploaded file
        with open(upload_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # Perform detection
        print(f"🔍 [BACKEND] Starting detection on {upload_path}...")
        results = detector.model(upload_path, conf=0.15)
        
        # Process results
        defects = extract_defects_info(results)
        print(f"📊 [BACKEND] Detection complete. Found {len(defects)} defects.")
        for d in defects:
            print(f"   - {d['name']} ({d['confidence'] * 100}%)")
        
        # Save output image
        save_result_image(results, result_path)
        
        # Encode result image to base64 to send to frontend (optional, use URL for prod)
        base64_img = encode_image_base64(result_path)
        
        # Save to MongoDB
        db = get_db()
        if db is not None:
             detection_record = {
                "user_id": str(current_user["_id"]),
                "email": current_user["email"],
                "username": current_user["username"],
                "filename": filename,
                "defects": defects,
                "has_defects": len(defects) > 0,
                "timestamp": datetime.utcnow(),
                "image_url": f"/static/results/result_{filename}",
                "original_url": f"/static/uploads/{filename}"
            }
             await db.detections.insert_one(detection_record)
        else:
             print("⚠️ MongoDB client not connected while saving detection.")

        return {
            "success": True,
            "message": "Detection completed successfully.",
            "defects": defects,
            "has_defects": len(defects) > 0,
            "result_image_base64": f"data:image/jpeg;base64,{base64_img}" if base64_img else None,
            "result_image_url": f"/static/results/result_{filename}"
        }
        
    except Exception as e:
        import traceback
        print(f"❌ Error during prediction: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Server Error: {str(e)}")

@router.get("/history")
async def get_history(current_user: dict = Depends(get_current_user)):
    db = get_db()
    if db is None:
        return {"history": []}
        
    cursor = db.detections.find({"user_id": str(current_user["_id"])}).sort("timestamp", -1)
    history = await cursor.to_list(length=100)
    for h in history:
        h["_id"] = str(h["_id"]) 
        if isinstance(h["timestamp"], datetime):
            h["timestamp"] = h["timestamp"].isoformat()
    return {"history": history}

@router.post("/live_scan")
async def live_scan(file: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
    try:
        contents = await file.read()
        import numpy as np
        nparr = np.frombuffer(contents, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if frame is None:
            return JSONResponse({"success": False, "error": "Invalid image data"})

        # Run detector
        print(f"📡 [BACKEND] Processing live frame...")
        results = detector.model(frame, verbose=False, conf=0.15)
        defects = extract_defects_info(results)
        print(f"⚡ [BACKEND] Live detection: {len(defects)} defects ({'Found!' if len(defects) > 0 else 'None'})")
        
        return {
            "success": True,
            "defects": defects,
            "has_defects": len(defects) > 0
        }
    except Exception as e:
        print(f"Live Scan Error: {e}")
        return JSONResponse({"success": False, "error": str(e)}, status_code=500)
