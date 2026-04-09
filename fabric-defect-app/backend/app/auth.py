import os
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from dotenv import load_dotenv
from app.database import get_db

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30))

import bcrypt
from fastapi.security import OAuth2PasswordBearer

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login", auto_error=False)

# ─── Password Helpers ────────────────────────────────────────────────────────

def hash_password(password: str) -> str:
    # Use bcrypt directly to avoid passlib Windows 72-byte bug
    salt = bcrypt.gensalt()
    # Encode password string to bytes
    password_bytes = password.encode('utf-8')
    # Hash and return as string
    hashed = bcrypt.hashpw(password_bytes, salt)
    return hashed.decode('utf-8')

def verify_password(plain: str, hashed: str) -> bool:
    # Compare plain password bytes against hashed version
    return bcrypt.checkpw(plain.encode('utf-8'), hashed.encode('utf-8'))

# ─── Token Helpers ────────────────────────────────────────────────────────────

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def decode_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None  # Return None instead of raising an exception if optional

# ─── Current User Dependency ──────────────────────────────────────────────────

async def get_current_user(token: Optional[str] = Depends(oauth2_scheme)):
    # Create a consistent guest user
    guest_user = {
        "_id": "000000000000000000000000",
        "email": "guest@fabric-ai.com",
        "username": "Guest User",
        "created_at": datetime.utcnow()
    }

    if not token:
        return guest_user

    payload = decode_token(token)
    if not payload:
        return guest_user

    email: str = payload.get("sub")
    if not email:
        return guest_user

    db = get_db()
    if db is None:
        return guest_user

    user = await db.users.find_one({"email": email})
    if not user:
        return guest_user
        
    return user
