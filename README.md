# MicroGov

MicroGov is an AI-powered municipal operations and civic technology platform that connects citizens with local government through an automated public complaint and work-order system. It combines a multimodal citizen portal, municipal operations command center, AI-assisted complaint classification, automated department routing, and a transparent community incentive feed to streamline public service response.

---

## Overview

MicroGov helps city residents report infrastructure and public service issues while allowing municipal teams to:

* Receive and triage complaints automatically using multimodal AI
* Detect and merge duplicate local complaints in real time
* Assign work orders automatically with dynamic SLA deadlines
* Track resolution progress with AI-powered image verification
* Reward citizens and municipal officers via a sponsored civic points marketplace
* Route issues to the correct department based on complaint type, severity, and location

The platform includes:

* A **FastAPI** backend for data logic, authentication, and AI routing
* A **React + Vite** frontend styled with **Tailwind CSS**
* **SQLite** for lightweight local development
* **Google Gemini Vision & Whisper AI** for multimodal issue analysis and verification
* A **Sponsor & Reward Economy** connecting local businesses with civic engagement

---

## Features

### Citizen Experience (Issue Provider)

* **Multimodal Submissions:** Submit civic complaints using images and optional voice/text descriptions.
* **Auto-GPS Tagging:** Automatically attach location coordinates for precise mapping.
* **Civic Reward System:** Earn **GovCoins** for valid reports, upvoting, and confirming resolutions.
* **Voucher Marketplace:** Redeem earned points for local merchant discounts, parking perks, or coffee vouchers.
* **Issue Tracking:** Monitor real-time status updates from submission to AI-verified resolution.

### Municipal & Field Experience (Issue Solver)

* **Command Dashboard:** View complaints on an interactive Leaflet map color-coded by urgency.
* **Priority Queue:** Inspect auto-sorted work orders based on a 0–100 AI Priority Score and dynamic SLA timers.
* **Officer Incentives:** Earn performance points and fuel/grocery vouchers for completing work orders within SLA targets.
* **AI-Guarded Closures:** Upload "After" photos that undergo automated visual comparison before tickets can close.

### AI, Governance & Key Innovations

#### 1. Spatial-Visual Duplicate Suppression Engine

* Automatically checks for open complaints within a **50-meter geospatial radius**.
* Utilizes Gemini Vision to visually cross-reference incoming photos against active nearby reports.
* Merges duplicates into a **Master Complaint Thread** and boosts its Priority Score instead of cluttering department queues.

#### 2. AI Before/After Resolution Guardrail

* Requires field workers to upload an "After" repair photo upon completing a job.
* Sends both "Before" and "After" photos to Gemini Vision to inspect whether the specific defect was repaired.
* Blocks premature or fake ticket closures unless AI verification confidence exceeds safety thresholds (>85%).

#### 3. Sponsor & Reward Marketplace (GovCoins Economy)

* Establishes a zero-taxpayer-cost incentive economy.
* **Citizens** earn points for reporting valid issues; **Officers** earn points for resolving tickets on time.
* **Local Sponsors & Brands** fund discount vouchers in exchange for hyper-local advertising and CSR visibility.

---

## Tech Stack

### Backend

* **Python 3.10+**
* **FastAPI**
* **SQLAlchemy**
* **SQLite** (default local database)
* **PyJWT & Bcrypt** (role-based authentication)
* **Google Generative AI** (Gemini 1.5 Flash for image analysis & verification)
* **OpenAI Whisper** (audio/speech transcription)

### Frontend

* **React.js**
* **Vite**
* **Tailwind CSS** (Custom MicroGov Palette: Raspberry, Pink Grapefruit, Lemon, Lime, Vanilla, Cream)
* **Leaflet & React-Leaflet** (GIS Map components)
* **Google OAuth (@react-oauth/google)**

---

## Prerequisites

Before running the app, install:

* Python 3.10+
* Node.js 18+
* npm
* Git

---

## Setup

### 1. Backend Setup

From the project root:

```bash
cd backend
python -m venv .venv
source .venv/bin/activate   # Linux/macOS
# or
.venv\Scripts\activate      # Windows PowerShell

pip install -r requirements.txt


```

Create environment variables in a `.env` file inside the `backend` folder:

```env
DATABASE_URL=sqlite:///./microgov.db
GEMINI_API_KEY=your_gemini_api_key_here
JWT_SECRET_KEY=change_this_super_secret_key_in_production
JWT_ALGORITHM=HS256
GOOGLE_CLIENT_ID=your_google_client_id

```

Run the API server:

```bash
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload

```

API documentation will be available at:

* Interactive Swagger UI: `http://localhost:8000/docs`
* ReDoc: `http://localhost:8000/redoc`

### 2. Frontend Setup

From the project root:

```bash
cd frontend
npm install

```

Create a `.env` file in the `frontend` folder if needed:

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_GOOGLE_CLIENT_ID=your_google_client_id

```

Run the development server:

```bash
npm run dev

```

The application will launch at:

* `http://localhost:5173`

---

## Common Commands

### Backend

```bash
cd backend
uvicorn app.main:app --reload

```

### Frontend

```bash
cd frontend
npm install
npm run dev
npm run build
npm run preview

```

---

## Database

The application uses SQLite by default for local development (`microgov.db`). To reset the schema after updating SQLAlchemy models, remove `microgov.db` and restart the FastAPI server to trigger table auto-creation (`Base.metadata.create_all()`).

---

## Deployment

### Frontend Deployment

The React frontend is pre-configured for Vercel deployment using `frontend/vercel.json`.

### Backend Deployment

The FastAPI backend can be deployed to services such as:

* Render
* Railway
* Fly.io
* Any Python-compatible Docker container platform

See `VERCEL_DEPLOYMENT_GUIDE.md` for step-by-step deployment instructions.

---

## Notes

* Uploaded image and audio files are served statically from the `backend/uploads` directory.
* CORS is pre-configured to accept requests from localhost during development.
* Ensure production environments use strong JWT secret keys and restrictive origin policies.

---

## License

This project is intended for hackathon, educational, and prototype/demo use unless specified otherwise by the repository owner.

```
