import uuid
from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Text, func, Integer
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=True)  # Nullable for Google OAuth users
    full_name = Column(String, nullable=True)
    role = Column(String, default="CITIZEN")  # "CITIZEN" or "MUNICIPAL_OFFICER"
    google_id = Column(String, nullable=True)
    
    # Civic Location Context
    city = Column(String, nullable=True, default="Metro City")
    ward = Column(String, nullable=True, default="Ward 14 (North Zone)")
    zip_code = Column(String, nullable=True, default="713303")
    representative = Column(String, nullable=True, default="Councilor Priya Sharma (Ward 14)")
    
    created_at = Column(DateTime, server_default=func.now())

class Complaint(Base):
    __tablename__ = "complaints"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=True)
    user_name = Column(String, nullable=True, default="Anonymous Citizen")
    description = Column(Text, nullable=True)
    image_path = Column(String, nullable=True)
    audio_path = Column(String, nullable=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    
    # Dynamic Civic Classification & Routing
    issue_type = Column(String, nullable=True)
    severity = Column(String, nullable=True)
    priority_score = Column(Float, nullable=True)
    department = Column(String, nullable=True)
    city = Column(String, nullable=True, default="Metro City")
    ward = Column(String, nullable=True, default="Ward 14 (North Zone)")
    local_authority = Column(String, nullable=True)
    routing_status = Column(String, default="ROUTED")  # "ROUTED", "DISPATCHED", "IN_PROGRESS", "RESOLVED"
    routing_notes = Column(Text, nullable=True)
    
    # Community Layer (Upvotes / Downvotes)
    upvotes = Column(Integer, default=0)
    downvotes = Column(Integer, default=0)

    # Resolution Lifecycle
    status = Column(String, default="OPEN")  # "OPEN", "IN_PROGRESS", "RESOLVED"
    created_at = Column(DateTime, server_default=func.now())

    work_order = relationship("WorkOrder", back_populates="complaint", uselist=False)
    votes = relationship("ComplaintVote", back_populates="complaint", cascade="all, delete-orphan")
    comments = relationship("ComplaintComment", back_populates="complaint", cascade="all, delete-orphan")

class ComplaintVote(Base):
    __tablename__ = "complaint_votes"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    complaint_id = Column(String, ForeignKey("complaints.id"), nullable=False)
    user_id = Column(String, nullable=False)  # User ID or anonymous session ID
    vote_type = Column(String, nullable=False)  # "UP" or "DOWN"
    created_at = Column(DateTime, server_default=func.now())

    complaint = relationship("Complaint", back_populates="votes")

class ComplaintComment(Base):
    __tablename__ = "complaint_comments"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    complaint_id = Column(String, ForeignKey("complaints.id"), nullable=False)
    user_id = Column(String, nullable=True)
    user_name = Column(String, default="Citizen")
    comment_text = Column(Text, nullable=False)
    created_at = Column(DateTime, server_default=func.now())

    complaint = relationship("Complaint", back_populates="comments")

class WorkOrder(Base):
    __tablename__ = "work_orders"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    complaint_id = Column(String, ForeignKey("complaints.id"))
    status = Column(String, default="OPEN")
    after_image_path = Column(String, nullable=True)
    resolution_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.now())

    complaint = relationship("Complaint", back_populates="work_order")