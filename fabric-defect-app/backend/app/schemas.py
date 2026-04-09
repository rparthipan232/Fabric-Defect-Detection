from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from datetime import datetime

# --- Auth Schemas ---
class UserSignup(BaseModel):
    username: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    username: str

# --- Profile Schemas ---
class UserProfile(BaseModel):
    username: str
    email: EmailStr
    created_at: datetime

class ProfileUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None

# --- Detection Schemas ---
class DefectInfo(BaseModel):
    name: str
    confidence: float
    box: List[float]

class DetectionRecord(BaseModel):
    user_id: str
    filename: str
    defects: List[DefectInfo]
    has_defects: bool
    timestamp: datetime
    image_url: str

# --- Community Schemas ---
class PostCreate(BaseModel):
    text: str
    image_url: Optional[str] = None

class PostResponse(BaseModel):
    id: str
    username: str
    text: str
    image_url: Optional[str] = None
    created_at: datetime

# --- Chat Schemas ---
class ChatMessage(BaseModel):
    message: str

class ChatResponse(BaseModel):
    response: str
    timestamp: datetime
