# How to Run the Fabric Defect Detection Project

Follow these steps to set up and run both the backend (FastAPI) and frontend (React Native/Expo).

## Prerequisites
- **Python 3.8+** installed.
- **Node.js** and **npm** installed.
- **Git Bash** or **PowerShell**.

---

## 1. Backend Setup (FastAPI)

1. Open a terminal and navigate to the backend directory:
   ```bash
   cd "c:\Users\Parthipan\Downloads\fabric defect project\fabric-defect-app\backend"
   ```

2. Create and activate a Virtual Environment:
   ```powershell
   python -m venv venv
   .\venv\Scripts\activate
   ```

3. Install the required dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Run the Backend Server:
   ```bash
   uvicorn app.main:app --reload
   ```
   > [!NOTE]
   > The backend will start on `http://127.0.0.1:8000`. You can visit `http://127.0.0.1:8000/docs` to see the API documentation.

---

## 2. Frontend Setup (React Native/Expo)

1. Open a **new** terminal window and navigate to the frontend directory:
   ```bash
   cd "c:\Users\Parthipan\Downloads\fabric defect project\fabric-defect-app\frontend"
   ```

2. Install the necessary Node.js packages:
   ```bash
   npm install
   ```

3. Update the Backend IP (If using a physical device):
   Open `services/api.js` and update the `API_BASE_URL` with your computer's local IP address if you're running the app on a real phone via the Expo Go app.
   
   > [!TIP]
   > For web testing, use `http://localhost:8000`. For physical devices, find your IP using `ipconfig` in CMD and replace the IP in `api.js`.

4. Start the Expo development server:
   ```bash
   npx expo start
   ```

5. Choose your platform:
   - Press **`w`** for Web.
   - Press **`a`** for Android Emulator (if set up).
   - Scan the **QR Code** using the **Expo Go** app on your iPhone or Android phone.

---

## 3. Important Notes
- **Database**: Ensure your internet is connected as the project uses MongoDB Atlas.
- **Model**: The YOLOv8 model weights should be located at the path specified in `app/routes.py`.
- **CORS**: The backend is already configured to allow requests from any origin, so the frontend should connect seamlessly.

---

## Summary of Commands
| Service  | Directory | Command |
| :--- | :--- | :--- |
| **Backend** | `fabric-defect-app/backend` | `uvicorn app.main:app --reload` |
| **Frontend** | `fabric-defect-app/frontend` | `npx expo start` |
