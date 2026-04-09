from fastapi import FastAPI
from app import routes, auth_routes, profile_routes, community_routes, chat_routes
from app.database import connect_db, close_db
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

app = FastAPI(title="Fabric Defect Detection API")

# Lifespan events
@app.on_event("startup")
async def startup_db_client():
    await connect_db()

@app.on_event("shutdown")
async def shutdown_db_client():
    await close_db()

# Configure CORS
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

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")

# Include API routes
app.include_router(auth_routes.router)
app.include_router(profile_routes.router)
app.include_router(routes.router, prefix="/detect")
app.include_router(community_routes.router)
app.include_router(chat_routes.router)

@app.get("/")
def read_root():
    return {"message": "Fabric Defect Detection API is running!"}
