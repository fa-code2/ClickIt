import uuid
import io
from fastapi.testclient import TestClient
from app.main import app
from app.database import SessionLocal
from app.models import User, Complaint, WorkOrder

client = TestClient(app)

def test_full_auth_flow():
    print("\n=======================================================")
    print("      MICROGOV AUTHENTICATION & AUTHORIZATION TESTS    ")
    print("=======================================================")

    db = SessionLocal()

    # ---------------------------------------------------------
    # 1. Registration Tests
    # ---------------------------------------------------------
    print("\n[1] Testing Registration...")
    citizen_email = f"citizen_test_{uuid.uuid4().hex[:6]}@example.com"
    reg_payload = {
        "email": citizen_email,
        "password": "valid_password_123",
        "full_name": "Anita Roy",
        "role": "CITIZEN",
        "city": "Metro City",
        "ward": "Ward 14 (North Zone)",
        "zip_code": "713303",
        "representative": "Councilor Priya Sharma (Ward 14)"
    }

    # 1a. Short password validation (< 6 chars)
    bad_payload = dict(reg_payload, password="123")
    res = client.post("/api/auth/register", json=bad_payload)
    assert res.status_code == 400, f"Expected 400 for short password, got {res.status_code}"
    assert "at least 6 characters" in res.json()["detail"]
    print("  [OK] Short password rejected with validation error (400)")

    # 1b. Successful registration
    res = client.post("/api/auth/register", json=reg_payload)
    assert res.status_code == 200, f"Registration failed: {res.text}"
    reg_data = res.json()
    assert "access_token" in reg_data
    assert reg_data["user"]["email"] == citizen_email
    assert reg_data["user"]["role"] == "CITIZEN"
    citizen_token = reg_data["access_token"]
    citizen_id = reg_data["user"]["id"]
    print(f"  [OK] Citizen registered successfully (User ID: {citizen_id})")

    # 1c. Duplicate email rejection
    res = client.post("/api/auth/register", json=reg_payload)
    assert res.status_code == 400
    assert "already registered" in res.json()["detail"].lower()
    print("  [OK] Duplicate registration rejected (400)")

    # ---------------------------------------------------------
    # 2. Email + Password Login Tests
    # ---------------------------------------------------------
    print("\n[2] Testing Email + Password Login...")

    # 2a. Correct credentials
    res = client.post("/api/auth/login", json={"email": citizen_email, "password": "valid_password_123"})
    assert res.status_code == 200
    login_data = res.json()
    assert "access_token" in login_data
    assert login_data["user"]["email"] == citizen_email
    print("  [OK] Valid credentials successfully authenticated (200)")

    # 2b. Incorrect password
    res = client.post("/api/auth/login", json={"email": citizen_email, "password": "wrong_password"})
    assert res.status_code == 400
    assert "incorrect email or password" in res.json()["detail"].lower()
    print("  [OK] Incorrect password cleanly rejected (400)")

    # 2c. Non-existent email
    res = client.post("/api/auth/login", json={"email": "nobody@example.com", "password": "password"})
    assert res.status_code == 400
    assert "incorrect email or password" in res.json()["detail"].lower()
    print("  [OK] Non-existent email cleanly rejected (400)")

    # ---------------------------------------------------------
    # 3. Google OAuth & Account Deduplication Tests
    # ---------------------------------------------------------
    print("\n[3] Testing Google OAuth & Account Deduplication...")

    # 3a. Missing / raw email attempt without Google ID token credential -> MUST be rejected (400)
    res = client.post("/api/auth/google", json={"credential": ""})
    assert res.status_code == 400
    assert "requires a valid google id token" in res.json()["detail"].lower()
    print("  [OK] Unverified / missing token strictly rejected (400)")

    # 3b. Existing user with verified Google ID token -> Must link, NO duplicate account!
    from unittest.mock import patch
    google_sub_id = f"google-sub-{uuid.uuid4().hex[:8]}"

    with patch("google.oauth2.id_token.verify_oauth2_token") as mock_verify:
        mock_verify.return_value = {
            "email": citizen_email,
            "name": "Anita Roy (Verified Google)",
            "sub": google_sub_id
        }

        res = client.post("/api/auth/google", json={"credential": "mock_valid_signed_jwt_token"})
        assert res.status_code == 200, f"Google auth failed: {res.text}"
        google_login_data = res.json()
        assert google_login_data["user"]["email"] == citizen_email
        assert google_login_data["user"]["id"] == citizen_id, "User ID changed; duplicate account created!"

    # Verify directly in database that only ONE user row exists for this email
    user_count = db.query(User).filter(User.email == citizen_email).count()
    assert user_count == 1, f"Duplicate accounts detected! Expected 1, found {user_count}"
    print("  [OK] Verified Google token on existing account linked seamlessly without duplicate record (Count: 1)")

    # 3c. New user with verified Google ID token -> Seamlessly provisions Citizen account
    new_google_email = f"new_google_user_{uuid.uuid4().hex[:6]}@gmail.com"
    with patch("google.oauth2.id_token.verify_oauth2_token") as mock_verify:
        mock_verify.return_value = {
            "email": new_google_email,
            "name": "David Miller",
            "sub": f"google-sub-{uuid.uuid4().hex[:8]}"
        }

        res = client.post("/api/auth/google", json={"credential": "mock_new_user_token"})
        assert res.status_code == 200
        new_google_data = res.json()
        assert new_google_data["user"]["email"] == new_google_email
        assert new_google_data["user"]["role"] == "CITIZEN"
    print("  [OK] Verified Google token for new user automatically created Citizen account")

    # 3d. User registered via Google trying to log in with email + password -> Should guide user
    res = client.post("/api/auth/login", json={"email": new_google_email, "password": "randompassword"})
    assert res.status_code == 400
    assert "continue with google" in res.json()["detail"].lower()
    print("  [OK] Password login on Google-only user directs user to 'Continue with Google'")

    # ---------------------------------------------------------
    # 4. Protected Routes & Role-Based Access Control (RBAC)
    # ---------------------------------------------------------
    print("\n[4] Testing Protected Routes & Role Authorization...")

    # Setup a Municipal Officer user
    officer_email = f"officer_test_{uuid.uuid4().hex[:6]}@microgov.org"
    officer_res = client.post("/api/auth/register", json={
        "email": officer_email,
        "password": "officer_password_123",
        "full_name": "Chief Inspector Sharma",
        "role": "MUNICIPAL_OFFICER",
        "city": "Metro City",
        "ward": "Ward 14 (North Zone)"
    })
    assert officer_res.status_code == 200
    officer_token = officer_res.json()["access_token"]
    print("  [OK] Municipal Officer created for RBAC testing")

    # 4a. /api/auth/me
    # Unauthenticated
    res = client.get("/api/auth/me")
    assert res.status_code == 401
    # Authenticated Citizen
    res = client.get("/api/auth/me", headers={"Authorization": f"Bearer {citizen_token}"})
    assert res.status_code == 200
    assert res.json()["email"] == citizen_email
    print("  [OK] /api/auth/me enforces authentication (401 unauthenticated, 200 authenticated)")

    # 4b. Status update & Work order resolution RBAC
    # Create a test complaint and work order
    test_complaint = Complaint(
        latitude=23.68,
        longitude=86.96,
        description="Test pothole for RBAC",
        department="Public Works",
        status="OPEN"
    )
    db.add(test_complaint)
    db.commit()
    db.refresh(test_complaint)

    test_wo = WorkOrder(complaint_id=test_complaint.id, status="OPEN")
    db.add(test_wo)
    db.commit()
    db.refresh(test_wo)

    # 4c. Status Update authorization
    # Without token -> 401
    res = client.patch(f"/api/complaints/{test_complaint.id}/status?status=IN_PROGRESS")
    assert res.status_code == 401
    # With Citizen token -> 403 Forbidden!
    res = client.patch(
        f"/api/complaints/{test_complaint.id}/status?status=IN_PROGRESS",
        headers={"Authorization": f"Bearer {citizen_token}"}
    )
    assert res.status_code == 403
    assert "municipal officer" in res.json()["detail"].lower()
    # With Municipal Officer token -> 200 OK!
    res = client.patch(
        f"/api/complaints/{test_complaint.id}/status?status=IN_PROGRESS",
        headers={"Authorization": f"Bearer {officer_token}"}
    )
    assert res.status_code == 200
    assert res.json()["status"] == "IN_PROGRESS"
    print("  [OK] Complaint status update strictly requires MUNICIPAL_OFFICER (401 unauth, 403 citizen, 200 officer)")

    # 4d. Work Order Resolve authorization
    dummy_image = io.BytesIO(b"fake image data")
    files = {"after_image": ("after.jpg", dummy_image, "image/jpeg")}
    data = {"resolution_notes": "Repaired and verified"}

    # Without token -> 401
    res = client.post(f"/api/work-orders/{test_wo.id}/resolve", files=files, data=data)
    assert res.status_code == 401

    # With Citizen token -> 403 Forbidden!
    dummy_image.seek(0)
    res = client.post(
        f"/api/work-orders/{test_wo.id}/resolve",
        files={"after_image": ("after.jpg", dummy_image, "image/jpeg")},
        data=data,
        headers={"Authorization": f"Bearer {citizen_token}"}
    )
    assert res.status_code == 403
    assert "municipal officer" in res.json()["detail"].lower()

    # With Officer token -> 200 OK!
    dummy_image.seek(0)
    res = client.post(
        f"/api/work-orders/{test_wo.id}/resolve",
        files={"after_image": ("after.jpg", dummy_image, "image/jpeg")},
        data=data,
        headers={"Authorization": f"Bearer {officer_token}"}
    )
    assert res.status_code == 200
    assert res.json()["status"] == "RESOLVED"
    print("  [OK] Work order resolution strictly requires MUNICIPAL_OFFICER (401 unauth, 403 citizen, 200 officer)")

    db.close()
    print("\n=======================================================")
    print("           ALL AUTH & RBAC TESTS PASSED!               ")
    print("=======================================================\n")

if __name__ == "__main__":
    test_full_auth_flow()
