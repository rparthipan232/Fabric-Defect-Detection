from fastapi import FastAPI
from app.routes import router
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

app = FastAPI(title="Fabric Defect Detection API")

# Configure CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure required directories exist
os.makedirs("static/uploads", exist_ok=True)
os.makedirs("static/results", exist_ok=True)

# Mount static files to serve images
app.mount("/static", StaticFiles(directory="static"), name="static")

# Include API routes
app.include_router(router)

@app.get("/")
def read_root():
    return {"message": "Fabric Defect Detection API is running!"}
