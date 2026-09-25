import uuid
from datetime import datetime
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import func

from ..database import get_db
from ..models import GovCoinTransaction, CivicVoucher, RedeemedVoucher, OfficerReward, User
from ..services.auth import get_optional_current_user

router = APIRouter(prefix="/api/rewards", tags=["Civic Rewards & GovCoins"])

# Seed vouchers if table is empty
DEFAULT_VOUCHERS = [
    {
        "title": "Metro Transit 1-Day Pass",
        "category": "TRANSIT",
        "cost": 50,
        "description": "Unlimited 24-hour access to city metro, bus lines, and light rail transit system.",
        "discount_code": "MGOV-TRANSIT-PASS",
        "partner_name": "Metro Transit Authority",
        "icon_name": "Bus"
    },
    {
        "title": "City Library Coffee & Reading Pass",
        "category": "CIVIC",
        "cost": 35,
        "description": "Complimentary artisanal coffee and reserved priority study room booking at any branch.",
        "discount_code": "MGOV-LIB-CAFE",
        "partner_name": "Municipal Library Network",
        "icon_name": "BookOpen"
    },
    {
        "title": "Eco-Community Garden Kit",
        "category": "ECO",
        "cost": 60,
        "description": "Native wildflower seeds, organic compost starter kit, and indoor herb planter set.",
        "discount_code": "MGOV-ECO-GARDEN",
        "partner_name": "Urban Ecology & Parks Trust",
        "icon_name": "Sprout"
    },
    {
        "title": "Downtown Civic Hub Day Pass",
        "category": "COMMUNITY",
        "cost": 45,
        "description": "Access to high-speed civic coworking center, collaboration lounge, and print stations.",
        "discount_code": "MGOV-HUB-ACCESS",
        "partner_name": "Civic Innovation Center",
        "icon_name": "Building2"
    },
    {
        "title": "Farmers Market $10 Fresh Credit",
        "category": "FOOD",
        "cost": 75,
        "description": "$10 voucher redeemable at any participating vendor at the weekly municipal farmer's market.",
        "discount_code": "MGOV-MARKET-FRESH",
        "partner_name": "Local Farmers Cooperative",
        "icon_name": "ShoppingBag"
    },
    {
        "title": "Municipal Property Tax 5% Rebate",
        "category": "CIVIC",
        "cost": 200,
        "description": "5% municipal clean-energy civic contribution rebate against annual municipal utility tax.",
        "discount_code": "MGOV-TAX-REBATE",
        "partner_name": "Department of Municipal Revenue",
        "icon_name": "Receipt"
    }
]

def ensure_vouchers_seeded(db: Session):
    count = db.query(CivicVoucher).count()
    if count == 0:
        for v in DEFAULT_VOUCHERS:
            voucher = CivicVoucher(
                title=v["title"],
                category=v["category"],
                cost=v["cost"],
                description=v["description"],
                discount_code=v["discount_code"],
                partner_name=v["partner_name"],
                icon_name=v["icon_name"],
                is_active=1
            )
            db.add(voucher)
        db.commit()

class RedeemRequest(BaseModel):
    user_id: str
    voucher_id: str

class EarnRequest(BaseModel):
    user_id: str
    amount: int
    transaction_type: str
    description: str

@router.get("/balance")
def get_govcoin_balance(
    user_id: str = Query(...),
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    target_id = (current_user.id if current_user else None) or user_id

    # If first time user has no transactions, grant a 100 GC Civic Onboarding Bonus
    tx_count = db.query(GovCoinTransaction).filter(GovCoinTransaction.user_id == target_id).count()
    if tx_count == 0:
        welcome_tx = GovCoinTransaction(
            user_id=target_id,
            amount=100,
            transaction_type="ONBOARDING_BONUS",
            description="Welcome to MicroGov! Civic Registration & Identity Verification Bonus"
        )
        db.add(welcome_tx)
        db.commit()

    transactions = (
        db.query(GovCoinTransaction)
        .filter(GovCoinTransaction.user_id == target_id)
        .order_by(GovCoinTransaction.created_at.desc())
        .all()
    )

    balance = sum(tx.amount for tx in transactions)
    lifetime_earned = sum(tx.amount for tx in transactions if tx.amount > 0)

    return {
        "user_id": target_id,
        "balance": max(0, balance),
        "lifetime_earned": lifetime_earned,
        "transactions": [
            {
                "id": tx.id,
                "amount": tx.amount,
                "transaction_type": tx.transaction_type,
                "description": tx.description,
                "created_at": tx.created_at.isoformat() if tx.created_at else datetime.utcnow().isoformat()
            }
            for tx in transactions
        ]
    }

@router.get("/vouchers")
def list_vouchers(db: Session = Depends(get_db)):
    ensure_vouchers_seeded(db)
    vouchers = db.query(CivicVoucher).filter(CivicVoucher.is_active == 1).all()
    return vouchers

@router.post("/redeem")
def redeem_voucher(
    payload: RedeemRequest,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    target_id = (current_user.id if current_user else None) or payload.user_id
    ensure_vouchers_seeded(db)

    voucher = db.query(CivicVoucher).filter(CivicVoucher.id == payload.voucher_id).first()
    if not voucher:
        raise HTTPException(status_code=404, detail="Civic voucher not found")

    # Check balance
    txs = db.query(GovCoinTransaction).filter(GovCoinTransaction.user_id == target_id).all()
    current_balance = sum(tx.amount for tx in txs)
    if current_balance < voucher.cost:
        raise HTTPException(
            status_code=400,
            detail=f"Insufficient GovCoins balance. You have {current_balance} GC, but this voucher costs {voucher.cost} GC."
        )

    # Generate redemption code
    unique_suffix = str(uuid.uuid4())[:8].upper()
    redemption_code = f"{voucher.discount_code}-{unique_suffix}"

    # Deduct coins
    spend_tx = GovCoinTransaction(
        user_id=target_id,
        amount=-voucher.cost,
        transaction_type="VOUCHER_REDEEMED",
        description=f"Redeemed: {voucher.title} ({voucher.partner_name})"
    )
    db.add(spend_tx)

    # Save redeemed voucher record
    redeemed = RedeemedVoucher(
        user_id=target_id,
        voucher_id=voucher.id,
        voucher_title=voucher.title,
        code=redemption_code,
        cost=voucher.cost,
        status="ACTIVE",
        partner_name=voucher.partner_name,
        category=voucher.category
    )
    db.add(redeemed)
    db.commit()
    db.refresh(redeemed)

    new_balance = current_balance - voucher.cost

    return {
        "success": True,
        "message": f"Successfully redeemed {voucher.title}!",
        "voucher": {
            "id": redeemed.id,
            "title": redeemed.voucher_title,
            "code": redeemed.code,
            "cost": redeemed.cost,
            "status": redeemed.status,
            "partner_name": redeemed.partner_name,
            "category": redeemed.category,
            "redeemed_at": redeemed.redeemed_at.isoformat() if redeemed.redeemed_at else datetime.utcnow().isoformat()
        },
        "new_balance": new_balance
    }

@router.get("/my-vouchers")
def get_user_vouchers(
    user_id: str = Query(...),
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    target_id = (current_user.id if current_user else None) or user_id
    vouchers = (
        db.query(RedeemedVoucher)
        .filter(RedeemedVoucher.user_id == target_id)
        .order_by(RedeemedVoucher.redeemed_at.desc())
        .all()
    )
    return vouchers

@router.post("/earn")
def earn_govcoins(
    payload: EarnRequest,
    db: Session = Depends(get_db)
):
    tx = GovCoinTransaction(
        user_id=payload.user_id,
        amount=abs(payload.amount),
        transaction_type=payload.transaction_type,
        description=payload.description
    )
    db.add(tx)
    db.commit()
    
    # Return updated balance
    all_txs = db.query(GovCoinTransaction).filter(GovCoinTransaction.user_id == payload.user_id).all()
    balance = sum(t.amount for t in all_txs)
    return {"success": True, "amount_awarded": payload.amount, "current_balance": balance}

@router.get("/officer")
def get_officer_rewards(
    officer_id: Optional[str] = Query(None),
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    target_id = (current_user.id if current_user else None) or officer_id or "officer-default"
    officer_name = (current_user.full_name if current_user else None) or "Municipal Inspector"

    rewards = (
        db.query(OfficerReward)
        .filter(OfficerReward.officer_id == target_id)
        .order_by(OfficerReward.awarded_at.desc())
        .all()
    )

    total_points = sum(r.points for r in rewards)
    if total_points == 0:
        # Default starting stats for officer
        total_points = 350

    badges = [
        {"name": "Verified Field Solver", "icon": "ShieldCheck", "unlocked": True, "desc": "Completed first verified on-site repair"},
        {"name": "AI Precision Inspector", "icon": "Sparkles", "unlocked": total_points >= 200, "desc": "Passed Gemini auto-verification with >95% confidence"},
        {"name": "Rapid SLA Champion", "icon": "Zap", "unlocked": total_points >= 400, "desc": "Dispatched and closed critical priority ticket within SLA"},
        {"name": "Civic Vanguard", "icon": "Award", "unlocked": total_points >= 600, "desc": "Top tier municipal operational excellence award"}
    ]

    leaderboard = [
        {"rank": 1, "name": "Chief Inspector Sharma", "ward": "Ward 14 (North Zone)", "points": 1420, "resolutions": 28, "sla_rate": "98%"},
        {"rank": 2, "name": officer_name, "ward": "Current Zone", "points": max(total_points, 450), "resolutions": 12, "sla_rate": "96%"},
        {"rank": 3, "name": "Inspector Rajiv Verma", "ward": "Ward 8 (Central)", "points": 880, "resolutions": 19, "sla_rate": "92%"},
        {"rank": 4, "name": "Engineer Sunita Rao", "ward": "Ward 3 (South)", "points": 760, "resolutions": 15, "sla_rate": "91%"}
    ]

    return {
        "officer_id": target_id,
        "officer_name": officer_name,
        "total_merit_points": max(total_points, 450),
        "badges": badges,
        "recent_awards": [
            {
                "id": r.id,
                "badge_name": r.badge_name,
                "points": r.points,
                "reason": r.reason,
                "awarded_at": r.awarded_at.isoformat() if r.awarded_at else datetime.utcnow().isoformat()
            }
            for r in rewards
        ],
        "leaderboard": leaderboard
    }
