from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from .database import engine
from .models import Base
from .routers import complaints, work_orders, auth

# Create database tables if not exist
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="MicroGov API",
    description="Multimodal Civic Governance & Automated Work Order Resolution System with Public Community Layer"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

app.include_router(auth.router)
app.include_router(complaints.router)
app.include_router(work_orders.router)

@app.get("/")
def root():
    return {
        "status": "MicroGov API Operational",
        "community_layer": "Active",
        "dynamic_routing": "Enabled",
        "version": "2.0.1"
    }