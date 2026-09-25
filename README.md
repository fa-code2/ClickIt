# ClickIt
ClickIt is a civic technology platform that connects citizens with local government through a public complaint and work-order system. It combines a citizen portal, municipal dashboard, AI-assisted complaint classification, automated department routing, and a transparent community feed to improve public service response.

## Overview

ClickIt helps city residents report infrastructure and public service issues while allowing municipal teams to:

- receive and triage complaints
- assign work orders automatically
- track resolution progress
- review evidence and public discussion
- route issues to the correct department based on ward and issue type

The platform includes:

- a FastAPI backend for data and API logic
- a React + Vite frontend for the user experience
- SQLite for local development
- AI-based complaint analysis and routing services
- image uploads and civic issue workflows

## Features

### Citizen Experience
- submit civic complaints with optional image uploads
- add comments and vote on issues
- view community activity and local issue trends
- track complaint status and resolution updates

### Municipal Experience
- review all submitted complaints
- inspect AI-generated classification and department recommendations
- create and manage work orders
- update resolution status and evidence
- monitor open and closed civic tasks

### AI & Governance Layer
- issue categorization using AI heuristics
- department routing based on complaint type and ward
- priority detection for urgent public issues
- transparent community visibility for accountability

## Tech Stack

### Backend
- Python
- FastAPI
- SQLAlchemy
- SQLite (default local database)
- Pydantic
- Python-dotenv
- Google Generative AI integration

### Frontend
- React
- Vite
- Tailwind CSS
- Leaflet / map UI components
- Google OAuth support


## Prerequisites

Before running the app, install:

- Python 3.10+
- Node.js 18+
- npm
- Git

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

Create environment variables if needed in a `.env` file inside the backend folder:

```env
DATABASE_URL=sqlite:///./microgov.db
GEMINI_API_KEY=your_api_key_here
JWT_SECRET_KEY=change_this_in_production
JWT_ALGORITHM=HS256
GOOGLE_CLIENT_ID=your_google_client_id
```

Run the API:

```bash
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

API docs will be available at:

- `http://localhost:8000/docs`
- `http://localhost:8000/redoc`

### 2. Frontend Setup

From the project root:

```bash
cd frontend
npm install
```

Create a `.env` file in the frontend folder if needed:

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

Run the frontend:

```bash
npm run dev
```

The app should open at:

- `http://localhost:5173`

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

## Database

The app uses SQLite by default for local development. To initialize or reset the database, use the migration helpers or run service setup scripts as needed.

## Deployment

This project is designed to be deployable to both frontend and backend hosting services.

### Frontend deployment
The frontend is ready for Vercel deployment using the provided configuration in `frontend/vercel.json`.

### Backend deployment
The FastAPI backend can be deployed to services such as:

- Render
- Railway
- Fly.io
- any Python-compatible hosting platform

See [VERCEL_DEPLOYMENT_GUIDE.md](VERCEL_DEPLOYMENT_GUIDE.md) for deployment details.

## Notes

- The backend is configured to serve uploaded files under the `uploads` directory.
- The project uses a permissive CORS configuration for local development.
- For production, make sure to replace default JWT secrets and restrict origin policies.
- Avoid committing environment files or generated local data to source control.

## License

This project is currently intended for educational and prototype/demo use unless otherwise specified by the repository owner.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to your fork
5. Open a pull request

## Support

For local setup help or deployment issues, refer to the project guide and the backend/frontend configuration files.
