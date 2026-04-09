from fastapi import APIRouter, Depends, HTTPException
from app.database import get_db
from app.auth import get_current_user
from app.schemas import UserProfile, ProfileUpdate

router = APIRouter(prefix="/profile", tags=["profile"])

@router.get("/", response_model=UserProfile)
async def get_profile(current_user: dict = Depends(get_current_user)):
    # Current user is already a dict from the DB
    return {
        "username": current_user["username"],
        "email": current_user["email"],
        "created_at": current_user["created_at"]
    }

@router.put("/update", response_model=UserProfile)
async def update_profile(
    profile_data: ProfileUpdate, 
    current_user: dict = Depends(get_current_user)
):
    db = get_db()
    if db is None:
        raise HTTPException(status_code=500, detail="Database not initialized")

    update_query = {}
    if profile_data.username:
        update_query["username"] = profile_data.username
    if profile_data.email:
        # Check if email is already taken
        if profile_data.email != current_user["email"]:
             existing = await db.users.find_one({"email": profile_data.email})
             if existing:
                 raise HTTPException(status_code=400, detail="Email already in use")
        update_query["email"] = profile_data.email

    if not update_query:
        return current_user

    await db.users.update_one({"_id": current_user["_id"]}, {"$set": update_query})
    
    # Return updated user
    updated_user = await db.users.find_one({"_id": current_user["_id"]})
    return {
        "username": updated_user["username"],
        "email": updated_user["email"],
        "created_at": updated_user["created_at"]
    }
