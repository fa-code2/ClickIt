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