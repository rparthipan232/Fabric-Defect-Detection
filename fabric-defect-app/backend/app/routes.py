from fastapi import APIRouter, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
import shutil
import os
import uuid
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
            
        # Perform detection
        results = detector.predict(upload_path)
        
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
