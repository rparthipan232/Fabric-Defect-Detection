from fastapi import APIRouter, Depends, HTTPException, status, Body
from typing import List
from datetime import datetime
from app.database import get_db
from app.auth import get_current_user
from app.schemas import PostCreate, PostResponse

router = APIRouter(prefix="/community", tags=["community"])

@router.post("/posts", status_code=status.HTTP_201_CREATED)
async def create_post(post_data: PostCreate, current_user: dict = Depends(get_current_user)):
    db = get_db()
    if db is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
        
    new_post = {
        "user_id": str(current_user["_id"]),
        "username": current_user["username"],
        "text": post_data.text,
        "image_url": post_data.image_url,
        "created_at": datetime.utcnow()
    }
    
    result = await db.posts.insert_one(new_post)
    return {"message": "Post created successfully", "post_id": str(result.inserted_id)}

@router.get("/posts", response_model=List[PostResponse])
async def get_posts():
    db = get_db()
    if db is None:
        return []
        
    cursor = db.posts.find().sort("created_at", -1)
    posts = await cursor.to_list(length=100)
    
    for post in posts:
        post["id"] = str(post["_id"])
        
    return posts
