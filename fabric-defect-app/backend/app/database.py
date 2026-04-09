import os
import certifi
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

MONGO_DB_URL = os.getenv("MONGO_DB_URL")

client: AsyncIOMotorClient = None

async def connect_db():
    global client
    try:
        if not MONGO_DB_URL:
            print("❌ MONGO_DB_URL not found in .env!")
            return

        # Initialize client with SSL fixes for Windows
        # Some Windows environments fail with certifi.where(), so we rely on tlsAllowInvalidCertificates
        client = AsyncIOMotorClient(
            MONGO_DB_URL, 
            serverSelectionTimeoutMS=10000,
            tls=True,
            tlsCAFile=certifi.where(),
            tlsAllowInvalidCertificates=True
        )
        
        # Test connection
        await client.admin.command('ping')
        print("✅ Connected to MongoDB Atlas")
    except Exception as e:
        print(f"❌ MongoDB Connection failed: {e}")
        client = None

async def close_db():
    global client
    if client:
        client.close()
        print("🔌 Disconnected from MongoDB Atlas")

def get_db():
    if client is None:
        return None
    return client.fabric_defect_db
