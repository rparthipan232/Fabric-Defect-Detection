import os
import requests
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Body
from typing import List
from dotenv import load_dotenv
from app.database import get_db
from app.auth import get_current_user
from app.schemas import ChatMessage, ChatResponse

load_dotenv()

router = APIRouter(prefix="/chat", tags=["chatbot"])

# --- API Configuration (HuggingFace Router) ---
MODEL_ID = os.getenv("CHAT_MODEL_NAME", "deepseek-ai/DeepSeek-R1-Distill-Qwen-7B")
HF_TOKEN = os.getenv("HUGGINGFACE_ACCESS_TOKEN")
# Using the NEW Router endpoint for stable inference
API_URL = "https://router.huggingface.co/v1/chat/completions"
HEADERS = {"Authorization": f"Bearer {HF_TOKEN}"}

@router.post("/", response_model=ChatResponse)
async def chat(chat_req: ChatMessage, current_user: dict = Depends(get_current_user)):
    db = get_db()
    if db is None:
        raise HTTPException(status_code=500, detail="Database not initialized")

    user_message = chat_req.message
    bot_response = ""

    # Call HuggingFace Router (OpenAI Compatible)
    payload = {
        "model": MODEL_ID,
        "messages": [
            {"role": "system", "content": "You are a senior fabric inspection AI expert. Assist the user with fabric defects and quality control."},
            {"role": "user", "content": user_message}
        ],
        "max_tokens": 500,
        "stream": False
    }

    try:
        response = requests.post(API_URL, headers=HEADERS, json=payload, timeout=30)
        
        if response.status_code == 200:
            result = response.json()
            # Standard OpenAI format: result['choices'][0]['message']['content']
            if 'choices' in result and len(result['choices']) > 0:
                bot_response = result['choices'][0]['message'].get('content', '').strip()
            else:
                bot_response = "I received a malformed response from the AI."
        else:
            bot_response = f"Simulated Response: You said '{user_message}'. (Router Error: {response.status_code})"
            print(f"HF Router Error: {response.text}")
    except Exception as e:
        bot_response = f"I'm having trouble thinking right now. Error: {str(e)}"

    # Store in MongoDB
    chat_log = {
        "user_id": str(current_user["_id"]),
        "username": current_user["username"],
        "message": user_message,
        "response": bot_response,
        "timestamp": datetime.utcnow()
    }
    await db.chats.insert_one(chat_log)

    return {
        "response": bot_response,
        "timestamp": datetime.utcnow()
    }

@router.get("/history")
async def get_chat_history(current_user: dict = Depends(get_current_user)):
    db = get_db()
    if db is None:
        return []
        
    cursor = db.chats.find({"user_id": str(current_user["_id"])}).sort("timestamp", 1)
    history = await cursor.to_list(length=50)
    
    for h in history:
        h["_id"] = str(h["_id"])
        
    return history
