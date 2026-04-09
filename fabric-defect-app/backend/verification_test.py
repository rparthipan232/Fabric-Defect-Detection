import requests
import time
import random
import string

BASE_URL = "http://localhost:8000"

def generate_random_string(length=8):
    return ''.join(random.choices(string.ascii_lowercase + string.digits, k=length))

def test_system():
    print("🚀 --- STARTING FULL SYSTEM VERIFICATION ---")
    
    # 1. Test Signup
    test_email = f"test_{generate_random_string()}@example.com"
    test_pass = "secure123"
    print(f"\n[1/5] Testing Signup with: {test_email}...")
    try:
        signup_res = requests.post(f"{BASE_URL}/auth/signup", json={
            "username": "SystemTester",
            "email": test_email,
            "password": test_pass
        })
        print(f"Status: {signup_res.status_code}")
        if signup_res.status_code == 200:
            print("✅ Signup Successful")
        else:
            print(f"❌ Signup Failed: {signup_res.text}")
            return
    except Exception as e:
        print(f"❌ Connection error: {e}")
        return

    # 2. Test Login
    print("\n[2/5] Testing Login...")
    login_res = requests.post(f"{BASE_URL}/auth/login", data={
        "username": test_email,
        "password": test_pass
    })
    print(f"Status: {login_res.status_code}")
    if login_res.status_code == 200:
        token = login_res.json()["access_token"]
        print("✅ Login Successful")
    else:
        print(f"❌ Login Failed: {login_res.text}")
        return

    headers = {"Authorization": f"Bearer {token}"}

    # 3. Test Profile
    print("\n[3/5] Testing Profile retrieval...")
    prof_res = requests.get(f"{BASE_URL}/profile/", headers=headers)
    if prof_res.status_code == 200:
        print(f"✅ Profile Verified: {prof_res.json()['username']}")
    else:
        print(f"❌ Profile Failed: {prof_res.text}")

    # 4. Test Chatbot (DeepSeek Router)
    print("\n[4/5] Testing AI Chatbot (DeepSeek Router)...")
    chat_res = requests.post(f"{BASE_URL}/chat/", headers=headers, json={
        "message": "What are common fabric defects?"
    })
    if chat_res.status_code == 200:
        bot_text = chat_res.json().get('response', '')
        print(f"✅ Chatbot Responded: {bot_text[:100]}...")
        if "Simulated Response" in bot_text or "Error" in bot_text:
             print("⚠️ Warning: Bot returned simulated or error response.")
        else:
             print("🌟 AI BOT IS FULLY LIVE AND RUNNING!")
    else:
        print(f"❌ Chatbot call failed: {chat_res.text}")

    # 5. Test Community Post
    print("\n[5/5] Testing Community Post creation...")
    post_res = requests.post(f"{BASE_URL}/community/posts", headers=headers, json={
        "content": "Automated system check successful. High-speed fabric inspection is live!"
    })
    if post_res.status_code == 201:
        print("✅ Community Post Created")
    else:
        print(f"❌ Community Post Failed: {post_res.text}")

    print("\n🏁 --- VERIFICATION COMPLETE ---")

if __name__ == "__main__":
    test_system()
