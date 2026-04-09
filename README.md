# Fabric AI — Defect Detection System

Welcome to **Fabric AI**, a premium, AI-powered system designed to detect defects in fabric in real time using computer vision.

---

## 🚀 Key Features

### 📡 1. Live Scanning
A high-performance real-time scanning mode that uses your webcam to continuously monitor fabric.
- **Continuous Monitoring**: Sends frames to the AI model at regular intervals.
- **Session History**: A real-time log of every defect detected during the current scanning session.
- **Visual Feedback**: Scanning sweep animations and on-screen corner brackets provide a professional inspection feel.

### 🖼️ 2. Photo Analysis
For high-resolution, static inspection of fabric samples.
- **File Upload**: Drag and drop fabric images from your computer.
- **Instant Photo**: Capture a high-quality still image using the built-in webcam module.
- **Deep Analysis**: Trigge the YOLOv8 model for a detailed breakdown of defect types and confidence scores.

### 📂 3. Prediction History
A persistent record of every analysis performed.
- **Cloud Storage**: Fetches all previous results from the backend database.
- **Visual Review**: See thumbnails of the problematic fabric areas and the specific defects identified.
- **Status Badges**: Quickly scan through 'Clean' vs 'Defective' records.

---

## 🛠️ Technical Stack

### **Backend (FastAPI & YOLOv8)**
- **FastAPI**: A high-performance Python framework for serving the AI model.
- **YOLOv8**: State-of-the-art computer vision model trained to recognize holes, stains, scratches, and other fabric defects.
- **MongoDB**: Used for persistent storage of detection history and user data.

### **Frontend (React.js & Vite)**
- **Modern UI**: A premium dark-mode interface built with a glassmorphism design system.
- **Real-time Processing**: Efficient frame capture and async communication with the backend.
- **Style**: Custom Vanilla CSS with a focus on high-end aesthetics and smooth transitions.

---

## 🏃 How to Run the Project

### 1. Start the Backend
Navigate to the `backend` directory and activate your virtual environment:
```powershell
# In the backend folder
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 2. Start the Frontend
Navigate to the `frontend` directory and start the Vite dev server:
```powershell
# In the frontend folder
npm run dev
```
The app will typically be available at `http://localhost:5173`.

---

## 🧶 Usage Guide
1. **Choose your mode**: Use the top navigation tabs to select your preferred analysis method.
2. **Start Scanning**: If using Live Scan, click the **"Start Scanner"** button to activate the camera.
3. **Review Results**: Use the interactive chips and Result Cards to see detailed confidence levels for every defect found.
4. **Browse History**: Check the **"Prediction History"** tab to see your progress over time.
