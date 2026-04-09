# 🌐 Professional Deployment Guide: Fabric Defect System

This guide ensures your AI-powered system moves from your local computer to a public URL.

---

## 🏗️ Phase 1: Deploying the Backend (AI Model + API)
**Target Platform:** [Render.com](https://render.com) (FREE)

1. **GitHub Setup:** Create a new GitHub repository and push the contents of the `fabric-defect-app/backend` folder to it.
2. **Create New Web Service:**
    - Choose **"Web Service"** in Render.
    - Connect your repo.
    - **Language:** Python
    - **Build Command:** `pip install -r requirements.txt`
    - **Start Command:** `gunicorn -k uvicorn.workers.UvicornWorker app.main:app`
3. **Environmental Variables:** Add these in the Render dashboard:
    - `MONGO_DB_URL`: Your MongoDB Atlas URL (found in `.env`)
    - `SECRET_KEY`: Your JWT Secret
4. **Final Step:** Copy the URL Render gives you (e.g., `https://my-backend.onrender.com`).

---

## 🎨 Phase 2: Deploying the Frontend (Web App)
**Target Platform:** [Vercel.com](https://vercel.com) or [Netlify.com](https://netlify.com)

1. **Connect to Backend:**
    - Open `fabric-defect-app/frontend/src/services/api.js` (or wherever your API URL is defined).
    - Update the `baseURL` to your **Render URL** from Phase 1.
2. **Push to GitHub:** Create another GitHub repo for the `fabric-defect-app/frontend` folder contents.
3. **Import to Vercel/Netlify:**
    - Choose **"New Project"**.
    - Connect the frontend repo.
    - **Build Settings:**
        - **Framework Preset:** Vite
        - **Build Command:** `npm run build`
        - **Output Directory:** `dist`

---

## 🌟 Professional Tips
- **Continuous Deployment:** Whenever you push new code to GitHub, Render and Vercel will automatically update your website!
- **AI Weights:** Ensure the file `runs/detect/train5/weights/best.pt` is inside your backend folder when you push to GitHub, as the server needs it.
- **Stay Active:** Free Render services "sleep" after 15 mins of inactivity. The first request after a break might take 30-60 seconds to wake up.
