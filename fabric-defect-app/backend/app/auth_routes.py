from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from datetime import datetime
from app.database import get_db
from app.auth import hash_password, verify_password, create_access_token

router = APIRouter(prefix="/auth", tags=["auth"])

class UserSignup(BaseModel):
    username: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

@router.post("/signup")
async def signup(user_data: UserSignup):
    try:
        db = get_db()
        if db is None:
             raise HTTPException(status_code=500, detail="Database not initialized")

        # Check if user already exists
        existing_user = await db.users.find_one({"email": user_data.email})
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already registered")
            
        hashed_pass = hash_password(user_data.password)
        
        new_user = {
            "username": user_data.username,
            "email": user_data.email,
            "password": hashed_pass,
            "created_at": datetime.utcnow()
        }
        
        await db.users.insert_one(new_user)
        return {"message": "User created successfully"}
    except Exception as e:
        import traceback
        print(f"❌ Signup Error: {str(e)}")
        print(traceback.format_exc())
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/login")
async def login(user_data: UserLogin):
    try:
        db = get_db()
        if db is None:
            raise HTTPException(status_code=503, detail="Database connection is not available")

        user = await db.users.find_one({"email": user_data.email})
        
        if not user or not verify_password(user_data.password, user["password"]):
            raise HTTPException(status_code=401, detail="Invalid email or password")
            
        access_token = create_access_token(data={"sub": user["email"]})
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "username": user["username"]
        }
    except Exception as e:
        import traceback
        print(f"❌ Login Error: {str(e)}")
        print(traceback.format_exc())
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))
