from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from google.oauth2 import id_token
from google.auth.transport import requests
from ..database import get_db
from ..models import User
from ..services.auth import (
    get_password_hash,
    verify_password,
    create_access_token,
    get_current_user
)

router = APIRouter(prefix="/api/auth", tags=["Auth"])

class RegisterSchema(BaseModel):
    email: str
    password: str
    full_name: str
    role: str = "CITIZEN"  # "CITIZEN" or "MUNICIPAL_OFFICER"
    city: Optional[str] = ""
    ward: Optional[str] = ""
    zip_code: Optional[str] = ""
    representative: Optional[str] = ""

class LoginSchema(BaseModel):
    email: str
    password: str

class ProfileUpdateSchema(BaseModel):
    full_name: Optional[str] = None
    city: Optional[str] = None
    ward: Optional[str] = None
    zip_code: Optional[str] = None
    representative: Optional[str] = None

def user_dict(u: User):
    return {
        "id": u.id,
        "email": u.email,
        "role": u.role,
        "full_name": u.full_name,
        "city": u.city or "",
        "ward": u.ward or "",
        "zip_code": u.zip_code or "",
        "representative": u.representative or ""
    }

class GoogleAuthSchema(BaseModel):
    credential: Optional[str] = None
    token: Optional[str] = None
    role: Optional[str] = "CITIZEN"
    city: Optional[str] = None
    ward: Optional[str] = None

@router.post("/register")
def register(data: RegisterSchema, db: Session = Depends(get_db)):
    clean_email = (data.email or "").strip().lower()
    if not clean_email or "@" not in clean_email or "." not in clean_email:
        raise HTTPException(status_code=400, detail="Please enter a valid email address.")

    clean_name = (data.full_name or "").strip()
    if not clean_name:
        raise HTTPException(status_code=400, detail="Full name is required.")

    if not data.password or len(data.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters long.")

    existing_user = db.query(User).filter(User.email == clean_email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered. Please sign in.")

    clean_ward = (data.ward or "").strip()
    clean_city = (data.city or "").strip()
    clean_rep = (data.representative or "").strip()
    if not clean_rep and clean_ward:
        clean_rep = f"{clean_ward} Representative"

    user = User(
        email=clean_email,
        hashed_password=get_password_hash(data.password),
        full_name=clean_name,
        role=data.role or "CITIZEN",
        city=clean_city or "Metro City",
        ward=clean_ward or "Ward 14 (North Zone)",
        zip_code=(data.zip_code or "").strip(),
        representative=clean_rep
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": user.id, "role": user.role, "email": user.email})
    return {"access_token": token, "token_type": "bearer", "user": user_dict(user)}

@router.post("/login")
def login(data: LoginSchema, db: Session = Depends(get_db)):
    clean_email = (data.email or "").strip().lower()
    if not clean_email:
        raise HTTPException(status_code=400, detail="Email is required.")
    if not data.password:
        raise HTTPException(status_code=400, detail="Password is required.")

    user = db.query(User).filter(User.email == clean_email).first()
    if not user:
        raise HTTPException(status_code=400, detail="Incorrect email or password")

    # If the user registered exclusively via Google OAuth, guide them appropriately
    if not user.hashed_password:
        raise HTTPException(
            status_code=400,
            detail="This account was registered via Google. Please use 'Continue with Google' to sign in."
        )

    if not verify_password(data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect email or password")

    token = create_access_token({"sub": user.id, "role": user.role, "email": user.email})
    return {"access_token": token, "token_type": "bearer", "user": user_dict(user)}

@router.post("/google")
def google_auth(data: GoogleAuthSchema, db: Session = Depends(get_db)):
    raw_token = (data.credential or data.token or "").strip()
    if not raw_token:
        raise HTTPException(
            status_code=400,
            detail="Google authentication requires a valid Google ID token credential."
        )

    try:
        from ..config import settings
        client_id = settings.GOOGLE_CLIENT_ID if settings.GOOGLE_CLIENT_ID else None
        idinfo = id_token.verify_oauth2_token(raw_token, requests.Request(), client_id)
        email = idinfo.get("email")
        full_name = idinfo.get("name") or (email.split('@')[0] if email else "Citizen")
        google_sub = idinfo.get("sub")
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Google ID token verification failed: {str(e)}"
        )

    if not email:
        raise HTTPException(status_code=400, detail="Unable to extract a valid email address from Google token.")

    clean_email = email.strip().lower()
    user = db.query(User).filter(User.email == clean_email).first()

    # Deduplication & Seamless Account Provisioning
    if not user:
        # User does not exist yet -> Create new citizen account linked to Google ID
        user = User(
            email=clean_email,
            hashed_password=None,
            full_name=full_name.strip() if full_name else "Citizen",
            role="CITIZEN",
            google_id=google_sub,
            city="Metro City",
            ward="Ward 14 (North Zone)",
            zip_code="",
            representative="Councilor Priya Sharma (Ward 14)"
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    else:
        # Existing account found -> Link Google ID without creating a duplicate record
        updated = False
        if google_sub and not user.google_id:
            user.google_id = google_sub
            updated = True
        if (not user.full_name or user.full_name == "Citizen") and full_name:
            user.full_name = full_name.strip()
            updated = True
        if updated:
            db.commit()
            db.refresh(user)

    token = create_access_token({"sub": user.id, "role": user.role, "email": user.email})
    return {"access_token": token, "token_type": "bearer", "user": user_dict(user)}

@router.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    return user_dict(current_user)

@router.put("/profile")
def update_profile(data: ProfileUpdateSchema, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if data.full_name is not None:
        current_user.full_name = data.full_name.strip()
    if data.city is not None:
        current_user.city = data.city.strip()
    if data.ward is not None:
        current_user.ward = data.ward.strip()
    if data.zip_code is not None:
        current_user.zip_code = data.zip_code.strip()
    if data.representative is not None:
        current_user.representative = data.representative.strip()
    db.commit()
    db.refresh(current_user)
    return user_dict(current_user)