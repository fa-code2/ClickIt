import os
import uuid
import datetime
from app.database import SessionLocal
from app.models import Complaint, WorkOrder, ComplaintVote, ComplaintComment

db = SessionLocal()

existing_count = db.query(Complaint).count()
print(f"Current complaints in database: {existing_count}")

# Seed sample data if few exist
sample_issues = [
    {
        "description": "Hazardous crater-sized pothole on Central Avenue right before the railway crossing. Multiple two-wheelers skidded during rain.",
        "issue_type": "Pothole",
        "severity": "HIGH",
        "priority_score": 88.5,
        "department": "Department of Public Works & Roads",
        "city": "Metro City",
        "ward": "Ward 14 (North Zone)",
        "local_authority": "Councilor Priya Sharma & Er. Rajesh Mukherjee (Zonal Exec. Engineer)",
        "routing_status": "DISPATCHED_TO_FIELD_CREW",
        "routing_notes": "Automatically routed to Department of Public Works & Roads with alert dispatched to Ward 14 Action Center. Targeted SLA: 24 hours.",
        "upvotes": 42,
        "downvotes": 2,
        "status": "IN_PROGRESS",
        "latitude": 23.6912,
        "longitude": 86.9710,
        "user_name": "Rohan Deshmukh",
        "work_status": "IN_PROGRESS"
    },
    {
        "description": "Commercial trash bins overflowing onto pedestrian walkway near City Market entrance. Stench is unbearable and blocking foot traffic.",
        "issue_type": "Trash Overflow",
        "severity": "MEDIUM",
        "priority_score": 74.0,
        "department": "Department of Sanitation & Waste Management",
        "city": "Metro City",
        "ward": "Ward 8 (Central District)",
        "local_authority": "Councilor Amitav Banerjee & Er. Suman Sengupta (Central District Chief)",
        "routing_status": "RESOLVED",
        "routing_notes": "Dispatched to Sanitation & Waste Management Quick Response Team. Cleared and sanitized.",
        "upvotes": 67,
        "downvotes": 1,
        "status": "RESOLVED",
        "latitude": 23.6845,
        "longitude": 86.9632,
        "user_name": "Dr. Ananya Sen",
        "work_status": "RESOLVED",
        "resolution_notes": "Sanitation compactor truck deployed. Waste cleared, bins sanitized, and daily collection frequency doubled."
    },
    {
        "description": "High-pressure municipal water main pipeline fractured near Sector 3 primary school. Water flooding street and entering shops.",
        "issue_type": "Water Leakage",
        "severity": "CRITICAL",
        "priority_score": 96.0,
        "department": "Municipal Water Supply & Sewerage Board",
        "city": "Metro City",
        "ward": "Ward 3 (South Corridor)",
        "local_authority": "Councilor Farhan Akhtar & Er. Vikramaditya Das (South Zonal Head)",
        "routing_status": "DISPATCHED_TO_FIELD_CREW",
        "routing_notes": "Critical water main burst escalated to Municipal Water Supply emergency wing and Ward 3 Hub. SLA: 12 hours.",
        "upvotes": 89,
        "downvotes": 3,
        "status": "IN_PROGRESS",
        "latitude": 23.6798,
        "longitude": 86.9589,
        "user_name": "Sunil Varma",
        "work_status": "IN_PROGRESS"
    },
    {
        "description": "Cluster of five high-mast streetlights dark for over two weeks on Ring Road Bypass. Extremely unsafe for evening commuters.",
        "issue_type": "Streetlight Failure",
        "severity": "MEDIUM",
        "priority_score": 62.0,
        "department": "Department of Electrical Infrastructure & Energy",
        "city": "Metro City",
        "ward": "Ward 21 (East Suburbs)",
        "local_authority": "Councilor Sunita Roy & Er. Debashis Mondal (East Zonal Engineer)",
        "routing_status": "ROUTED_AND_DISPATCHED",
        "routing_notes": "Logged with Electrical Maintenance Unit #4. Replacement ballast and LED fixtures requisitioned.",
        "upvotes": 28,
        "downvotes": 0,
        "status": "OPEN",
        "latitude": 23.6954,
        "longitude": 86.9821,
        "user_name": "Meera Patel",
        "work_status": "OPEN"
    }
]

if existing_count < 4:
    for data in sample_issues:
        c = Complaint(
            description=data["description"],
            issue_type=data["issue_type"],
            severity=data["severity"],
            priority_score=data["priority_score"],
            department=data["department"],
            city=data["city"],
            ward=data["ward"],
            local_authority=data["local_authority"],
            routing_status=data["routing_status"],
            routing_notes=data["routing_notes"],
            upvotes=data["upvotes"],
            downvotes=data["downvotes"],
            status=data["status"],
            latitude=data["latitude"],
            longitude=data["longitude"],
            user_name=data["user_name"]
        )
        db.add(c)
        db.commit()
        db.refresh(c)

        wo = WorkOrder(
            complaint_id=c.id,
            status=data["work_status"],
            resolution_notes=data.get("resolution_notes")
        )
        db.add(wo)
        
        # Add a sample comment
        comment = ComplaintComment(
            complaint_id=c.id,
            user_name="Concerned Resident",
            comment_text=f"Thank you for reporting this. It has been causing major inconvenience in {data['ward']}!"
        )
        db.add(comment)
        db.commit()

    print("Seed data successfully inserted!")
else:
    print("Database already has complaints, updating any missing fields.")
    for comp in db.query(Complaint).all():
        if not comp.ward:
            comp.ward = "Ward 14 (North Zone)"
        if not comp.city:
            comp.city = "Metro City"
        if not comp.local_authority:
            comp.local_authority = "Councilor Priya Sharma & Zonal Engineer"
        if not comp.routing_status:
            comp.routing_status = "ROUTED_AND_DISPATCHED"
    db.commit()

db.close()
