# MicroGov - Deployment Guide for Vercel & Cloud Services

This document details how to run MicroGov on **localhost** and deploy it to **Vercel** with full public community features and dynamic civic routing.

---

## 1. Running on Localhost

### Backend (FastAPI + SQLite + AI Engine)
```bash
cd backend
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
- API Documentation available at: `http://localhost:8000/docs`
- Health check: `http://localhost:8000/`

### Frontend (React + Vite + TailwindCSS)
```bash
cd frontend
npm install
npm run dev
```
- App runs on `http://localhost:5173/`

---

## 2. Deploying Frontend to Vercel

The frontend is fully configured for single-click deployment on [Vercel](https://vercel.com/).

### Option A: Deploy via GitHub / Vercel Dashboard (Recommended)

1. Push your code to your GitHub repository:
   ```bash
   git add .
   git commit -m "Add civic community layer, dynamic routing, and Vercel configuration"
   git push origin main
   ```
2. Log in to [Vercel Dashboard](https://vercel.com/new).
3. Click **"Add New Project"** and select your GitHub repository.
4. Set the **Root Directory** to `frontend`.
5. Under **Build and Output Settings**:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
6. Under **Environment Variables**:
   - `VITE_API_BASE_URL`: URL of your deployed backend (e.g. `https://microgov-api.onrender.com` or leave empty to use built-in client fallback store)
   - `VITE_GOOGLE_CLIENT_ID` (Optional): Your Google OAuth Client ID
7. Click **Deploy**!

### Option B: Deploy via Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```
2. From the `frontend/` directory:
   ```bash
   cd frontend
   vercel
   ```
3. Follow the CLI prompts. To deploy to production:
   ```bash
   vercel --prod
   ```

> [!NOTE]
> `frontend/vercel.json` is pre-configured with SPA route rewrites (`"rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]`) to prevent 404 errors on page reloads.

---

## 3. Deploying the Backend (Python FastAPI)

Since Vercel is optimized for frontend and serverless functions, the standard Python FastAPI server can be deployed on any free/low-cost cloud platform:

### Deploying to Render.com (Free)
1. Go to [Render Dashboard](https://dashboard.render.com/) and click **New + Web Service**.
2. Connect your GitHub repository.
3. Configure settings:
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Add Environment Variables:
   - `GEMINI_API_KEY`: Your Google Gemini API Key
5. Copy your Render URL (e.g., `https://microgov-api.onrender.com`) and paste it into your Vercel frontend project as `VITE_API_BASE_URL`.

### Deploying to Railway.app
1. Go to [Railway.app](https://railway.app/) and create a new project from your repo.
2. Select the `backend` folder as root directory.
3. Railway automatically detects `Dockerfile` or `requirements.txt` and provisions a public HTTPS domain.

---

## 4. Built-in Offline & Standalone Resilience

MicroGov includes an intelligent fallback store in `frontend/src/services/api.js`. If the backend URL is unavailable or during a live presentation demo, the frontend will automatically maintain an interactive local state for:
- Viewing pre-seeded civic issues across multiple wards
- Upvoting and downvoting complaints in real-time
- Adding community comments and discussion updates
- Filing new complaints with auto-assigned ward routing
- Viewing official resolution verification with before & after photos
