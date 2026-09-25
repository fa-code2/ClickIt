from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional, List
import shutil
import uuid
import os
from ..database import get_db
from ..models import Complaint, WorkOrder, ComplaintVote, ComplaintComment, User
from ..schemas import ComplaintResponse, VoteRequest, CommentCreate, CommentResponse
from ..services.ai_engine import analyze_report, transcribe_audio_file
from ..services.decision_engine import resolve_civic_routing
from ..services.auth import require_officer, get_optional_current_user

router = APIRouter(prefix="/api/complaints", tags=["Complaints"])

@router.post("/", response_model=ComplaintResponse)
async def create_complaint(
    latitude: float = Form(...),
    longitude: float = Form(...),
    description: str = Form(""),
    city: str = Form("Metro City"),
    ward: str = Form("Ward 14 (North Zone)"),
    user_id: Optional[str] = Form(None),
    user_name: Optional[str] = Form(None),
    image: UploadFile = File(...),
    audio: UploadFile = File(None),
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    os.makedirs("uploads", exist_ok=True)
    
    # Save Image
    image_ext = image.filename.split(".")[-1] if "." in image.filename else "jpg"
    image_filename = f"{uuid.uuid4()}.{image_ext}"
    image_path = os.path.join("uploads", image_filename)
    with open(image_path, "wb") as buffer:
        shutil.copyfileobj(image.file, buffer)
        
    # Process Audio if provided
    transcribed_text = description
    audio_path = None
    if audio:
        audio_ext = audio.filename.split(".")[-1] if "." in audio.filename else "mp3"
        audio_filename = f"{uuid.uuid4()}.{audio_ext}"
        audio_path = os.path.join("uploads", audio_filename)
        with open(audio_path, "wb") as buffer:
            shutil.copyfileobj(audio.file, buffer)
        
        audio_text = transcribe_audio_file(audio_path)
        if audio_text:
            transcribed_text = f"{description} {audio_text}".strip()

    # AI Multimodal Analysis
    ai_result = await analyze_report(image_path, transcribed_text)
    issue_type = ai_result.get("issue_type", "General Municipal Issue")
    severity = ai_result.get("severity", "MEDIUM")
    base_priority = float(ai_result.get("priority_score", 50.0))

    # Dynamic Civic Routing Engine
    routing_result = resolve_civic_routing(
        issue_type=issue_type,
        severity=severity,
        ward=ward,
        city=city,
        lat=latitude,
        lon=longitude
    )

    # Compute final priority (capped between 10 and 100)
    final_priority = min(100.0, max(10.0, base_priority + routing_result.get("priority_boost", 0.0)))
    
    author_id = (current_user.id if current_user else None) or user_id
    author_name = (current_user.full_name if current_user else None) or user_name or "Active Citizen"

    complaint = Complaint(
        user_id=author_id,
        user_name=author_name,
        latitude=latitude,
        longitude=longitude,
        description=transcribed_text,
        image_path=image_path,
        audio_path=audio_path,
        issue_type=issue_type,
        severity=severity,
        priority_score=final_priority,
        department=routing_result.get("department"),
        city=routing_result.get("city"),
        ward=routing_result.get("ward"),
        local_authority=routing_result.get("local_authority"),
        routing_status=routing_result.get("routing_status"),
        routing_notes=routing_result.get("routing_notes"),
        upvotes=1,  # Submitting citizen implicitly upvotes their civic issue
        downvotes=0,
        status="OPEN"
    )
    db.add(complaint)
    db.commit()
    db.refresh(complaint)
    
    # Record creator's initial upvote if author_id provided
    if author_id:
        creator_vote = ComplaintVote(
            complaint_id=complaint.id,
            user_id=author_id,
            vote_type="UP"
        )
        db.add(creator_vote)
        db.commit()

    # Create related Work Order for municipal tracking
    work_order = WorkOrder(complaint_id=complaint.id, status="OPEN")
    db.add(work_order)
    db.commit()
    db.refresh(complaint)
    
    return complaint

@router.get("/", response_model=List[ComplaintResponse])
def get_complaints(
    sort_by: str = Query("upvotes", description="Sort by: upvotes, priority, or recent"),
    department: Optional[str] = Query(None),
    ward: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    user_id: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(Complaint)

    if department and department != "ALL":
        query = query.filter(Complaint.department.ilike(f"%{department}%"))
    if ward and ward != "ALL":
        query = query.filter(Complaint.ward == ward)
    if status and status != "ALL":
        query = query.filter(Complaint.status == status)

    if sort_by == "upvotes":
        query = query.order_by(Complaint.upvotes.desc(), Complaint.created_at.desc())
    elif sort_by == "priority":
        query = query.order_by(Complaint.priority_score.desc())
    else:  # recent
        query = query.order_by(Complaint.created_at.desc())

    complaints = query.all()

    # If user_id provided, populate user_vote status
    user_votes_map = {}
    if user_id:
        user_votes = db.query(ComplaintVote).filter(ComplaintVote.user_id == user_id).all()
        user_votes_map = {v.complaint_id: v.vote_type for v in user_votes}

    for c in complaints:
        c.user_vote = user_votes_map.get(c.id)

    return complaints

@router.get("/{complaint_id}", response_model=ComplaintResponse)
def get_complaint(complaint_id: str, user_id: Optional[str] = None, db: Session = Depends(get_db)):
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    
    if user_id:
        vote = db.query(ComplaintVote).filter(
            ComplaintVote.complaint_id == complaint_id,
            ComplaintVote.user_id == user_id
        ).first()
        complaint.user_vote = vote.vote_type if vote else None

    return complaint

@router.post("/{complaint_id}/vote")
def vote_complaint(
    complaint_id: str,
    payload: VoteRequest,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")

    user_id = (current_user.id if current_user else None) or payload.user_id or "anonymous"
    existing_vote = db.query(ComplaintVote).filter(
        ComplaintVote.complaint_id == complaint_id,
        ComplaintVote.user_id == user_id
    ).first()

    requested = payload.vote_type.upper()  # "UP" or "DOWN"

    if existing_vote:
        if existing_vote.vote_type == requested:
            # Clicking same vote toggles it off
            db.delete(existing_vote)
            current_vote = None
        else:
            # Change vote
            existing_vote.vote_type = requested
            current_vote = requested
    else:
        # New vote
        new_vote = ComplaintVote(
            complaint_id=complaint_id,
            user_id=user_id,
            vote_type=requested
        )
        db.add(new_vote)
        current_vote = requested

    db.commit()

    # Recalculate upvotes and downvotes
    up_count = db.query(ComplaintVote).filter(ComplaintVote.complaint_id == complaint_id, ComplaintVote.vote_type == "UP").count()
    down_count = db.query(ComplaintVote).filter(ComplaintVote.complaint_id == complaint_id, ComplaintVote.vote_type == "DOWN").count()

    complaint.upvotes = up_count
    complaint.downvotes = down_count
    db.commit()

    return {
        "complaint_id": complaint_id,
        "upvotes": complaint.upvotes,
        "downvotes": complaint.downvotes,
        "user_vote": current_vote
    }

@router.get("/{complaint_id}/comments", response_model=List[CommentResponse])
def get_comments(complaint_id: str, db: Session = Depends(get_db)):
    return db.query(ComplaintComment).filter(
        ComplaintComment.complaint_id == complaint_id
    ).order_by(ComplaintComment.created_at.asc()).all()

@router.post("/{complaint_id}/comments", response_model=CommentResponse)
def add_comment(
    complaint_id: str,
    payload: CommentCreate,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")

    comment_user_id = (current_user.id if current_user else None) or payload.user_id
    comment_user_name = (current_user.full_name if current_user else None) or payload.user_name or "Citizen"

    comment = ComplaintComment(
        complaint_id=complaint_id,
        user_id=comment_user_id,
        user_name=comment_user_name,
        comment_text=payload.comment_text
    )
    db.add(comment)
    db.commit()
    db.refresh(comment)
    return comment

@router.patch("/{complaint_id}/status")
def update_status(
    complaint_id: str,
    status: str = Query(...),
    current_user: User = Depends(require_officer),
    db: Session = Depends(get_db)
):
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
        
    complaint.status = status.upper()
    if complaint.work_order:
        complaint.work_order.status = status.upper()
    db.commit()
    return {"message": "Status updated successfully", "complaint_id": complaint_id, "status": complaint.status}