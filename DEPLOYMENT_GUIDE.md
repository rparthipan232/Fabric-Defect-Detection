# 🌐 Professional Deployment Guide: Fabric Defect System

This guide ensures your AI-powered system moves from your local computer to a public URL.

---

## 🏗️ Phase 1: Deploying the Backend (AI Model + API)
**Target Platform:** [Render.com](https://render.com) (FREE)

1. **Connect GitHub:** Create a new GitHub repository and push your `fabric-defect-app/backend` folder to it.
2. **New Web Service:**
    - Choose **"Web Service"** in Render.
    - Connect your repo.
    - **Language:** Python
    - **Build Command:** `pip install -r requirements.txt`
    - **Start Command:** `gunicorn -k uvicorn.workers.UvicornWorker app.main:app`
3. **Environmental Variables:** Add these from your `.env`:
    - `MONGO_DB_URL`: Your MongoDB Atlas URL
    - `SECRET_KEY`: Your JWT Secret
4. **Final Step:** Copy the URL Render gives you (e.g., `https://my-app.onrender.com`) and paste it into `/frontend/services/api.js` on line 12 (**PROD_URL**).

---

## 🎨 Phase 2: Deploying the Frontend (Web App)
**Target Platform:** [Vercel.com](https://vercel.com) (FREE)

1. **Export for Web:** In your frontend folder, run:
    ```powershell
    npx expo export:web
    ```
2. **Push to GitHub:** Create another GitHub repo for the `frontend` folder.
3. **Import to Vercel:**
    - Choose **"New Project"** in Vercel.
    - Connect the frontend repo.
    - **Build Settings:**
        - **Framework Preset:** Other
        - **Build Command:** `npx expo export:web`
        - **Output Directory:** `web-build`

---

## 🌟 Professional Tips
- **Continuous Deployment:** Whenever you push new code to GitHub, Render and Vercel will automatically update your website!
- **AI Weights:** Ensure `runs/detect/train5/weights/best.pt` is committed to GitHub, as the server needs it to run detections.
- **SSL Certificates:** Both Render and Vercel provide free SSL automatically.
