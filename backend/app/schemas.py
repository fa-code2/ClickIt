from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

class ComplaintBase(BaseModel):
    latitude: float
    longitude: float
    description: Optional[str] = None
    city: Optional[str] = "Metro City"
    ward: Optional[str] = "Ward 14 (North Zone)"

class WorkOrderResponse(BaseModel):
    id: str
    status: str
    after_image_path: Optional[str] = None
    resolution_notes: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class CommentResponse(BaseModel):
    id: str
    complaint_id: str
    user_name: str
    comment_text: str
    created_at: datetime

    class Config:
        from_attributes = True

class ComplaintResponse(ComplaintBase):
    id: str
    user_id: Optional[str] = None
    user_name: Optional[str] = "Anonymous Citizen"
    image_path: Optional[str] = None
    audio_path: Optional[str] = None
    issue_type: Optional[str] = None
    severity: Optional[str] = None
    priority_score: Optional[float] = None
    department: Optional[str] = None
    local_authority: Optional[str] = None
    routing_status: Optional[str] = "ROUTED"
    routing_notes: Optional[str] = None
    upvotes: int = 0
    downvotes: int = 0
    user_vote: Optional[str] = None
    status: str
    created_at: datetime
    work_order: Optional[WorkOrderResponse] = None
    comments: Optional[List[CommentResponse]] = []

    class Config:
        from_attributes = True

class WorkOrderUpdate(BaseModel):
    status: str
    resolution_notes: Optional[str] = None

class VoteRequest(BaseModel):
    vote_type: str  # "UP" or "DOWN" or "NONE"
    user_id: Optional[str] = "anonymous"

class CommentCreate(BaseModel):
    comment_text: str
    user_name: Optional[str] = "Citizen"
    user_id: Optional[str] = None

class CivicProfileUpdate(BaseModel):
    city: Optional[str] = None
    ward: Optional[str] = None
    zip_code: Optional[str] = None
    representative: Optional[str] = None