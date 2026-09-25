import urllib.request
import json
import uuid

BASE_URL = "http://127.0.0.1:8000"

def run_tests():
    print("=== Testing MicroGov Civic Community & Dynamic Routing ===")
    
    # 1. Test Root
    req = urllib.request.urlopen(f"{BASE_URL}/")
    data = json.loads(req.read().decode())
    assert data["community_layer"] == "Active", "Community layer not active"
    print("[OK] Root endpoint operational:", data)

    # 2. Test Civic Registration
    reg_email = f"citizen_{uuid.uuid4().hex[:6]}@microgov.org"
    reg_payload = {
        "email": reg_email,
        "password": "securepassword123",
        "full_name": "Pooja Hegde",
        "role": "CITIZEN",
        "city": "Metro City",
        "ward": "Ward 14 (North Zone)",
        "zip_code": "713303",
        "representative": "Councilor Priya Sharma (Ward 14)"
    }
    req = urllib.request.Request(
        f"{BASE_URL}/api/auth/register",
        data=json.dumps(reg_payload).encode(),
        headers={"Content-Type": "application/json"}
    )
    res = urllib.request.urlopen(req)
    user_res = json.loads(res.read().decode())
    user_data = user_res["user"]
    assert user_data["ward"] == "Ward 14 (North Zone)", "Ward mismatch"
    assert user_data["representative"] == "Councilor Priya Sharma (Ward 14)", "Representative mismatch"
    user_id = user_data["id"]
    print(f"[OK] Civic Registration verified: {user_data['full_name']} registered in {user_data['ward']} (Rep: {user_data['representative']})")

    # 3. Test Complaints Feed & Dynamic Routing Metadata
    req = urllib.request.urlopen(f"{BASE_URL}/api/complaints/?sort_by=upvotes")
    complaints = json.loads(req.read().decode())
    assert len(complaints) > 0, "No complaints found"
    first = complaints[0]
    assert "local_authority" in first, "Missing local_authority"
    assert "upvotes" in first, "Missing upvotes"
    assert "routing_status" in first, "Missing routing_status"
    print(f"[OK] Complaints Feed retrieved: {len(complaints)} issues found. Top issue: '{first['issue_type']}' ({first['upvotes']} upvotes) -> Routed to '{first['department']}' & '{first['local_authority']}'")

    # 4. Test Upvoting
    complaint_id = first["id"]
    initial_upvotes = first["upvotes"]
    vote_req = urllib.request.Request(
        f"{BASE_URL}/api/complaints/{complaint_id}/vote",
        data=json.dumps({"vote_type": "UP", "user_id": user_id}).encode(),
        headers={"Content-Type": "application/json"}
    )
    res = urllib.request.urlopen(vote_req)
    vote_data = json.loads(res.read().decode())
    print(f"[OK] Upvote action executed: Complaint {complaint_id[:8]}... now has {vote_data['upvotes']} upvotes (user vote: {vote_data['user_vote']})")

    # 5. Test Adding Community Comment
    comment_payload = {
        "comment_text": "This is a major road safety hazard in Ward 14. Thank you for prioritizing!",
        "user_name": user_data["full_name"],
        "user_id": user_id
    }
    comm_req = urllib.request.Request(
        f"{BASE_URL}/api/complaints/{complaint_id}/comments",
        data=json.dumps(comment_payload).encode(),
        headers={"Content-Type": "application/json"}
    )
    res = urllib.request.urlopen(comm_req)
    comm_data = json.loads(res.read().decode())
    assert comm_data["user_name"] == "Pooja Hegde", "Comment author mismatch"
    print(f"[OK] Community Comment posted by {comm_data['user_name']}: '{comm_data['comment_text']}'")

    # 6. Verify comments list
    req = urllib.request.urlopen(f"{BASE_URL}/api/complaints/{complaint_id}/comments")
    all_comments = json.loads(req.read().decode())
    assert len(all_comments) >= 1, "Comments not returned"
    print(f"[OK] Comments list verified: {len(all_comments)} comments on issue.")

    print("\nALL CIVIC COMMUNITY & DYNAMIC ROUTING TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    run_tests()
