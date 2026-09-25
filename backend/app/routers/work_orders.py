from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
import os
import shutil
import uuid
from ..database import get_db
from ..models import WorkOrder, Complaint, User
from ..services.auth import require_officer

router = APIRouter(prefix="/api/work-orders", tags=["Work Orders"])

@router.post("/{work_order_id}/resolve")
async def resolve_work_order(
    work_order_id: str,
    after_image: UploadFile = File(...),
    resolution_notes: Optional[str] = Form("Issue successfully repaired and verified on-site by municipal crew."),
    current_user: User = Depends(require_officer),
    db: Session = Depends(get_db)
):
    work_order = db.query(WorkOrder).filter(WorkOrder.id == work_order_id).first()
    if not work_order:
        raise HTTPException(status_code=404, detail="Work Order not found")
        
    os.makedirs("uploads", exist_ok=True)
    image_ext = after_image.filename.split(".")[-1] if "." in after_image.filename else "jpg"
    image_filename = f"resolved_{uuid.uuid4()}.{image_ext}"
    image_path = os.path.join("uploads", image_filename)
    
    with open(image_path, "wb") as buffer:
        shutil.copyfileobj(after_image.file, buffer)
        
    work_order.after_image_path = image_path
    work_order.resolution_notes = resolution_notes
    work_order.status = "RESOLVED"
    
    complaint = db.query(Complaint).filter(Complaint.id == work_order.complaint_id).first()
    if complaint:
        complaint.status = "RESOLVED"
        complaint.routing_status = "RESOLVED"
        
    db.commit()
    return {
        "message": "Work Order resolved successfully",
        "work_order_id": work_order_id,
        "complaint_id": complaint.id if complaint else None,
        "status": "RESOLVED",
        "after_image_path": image_path
    }