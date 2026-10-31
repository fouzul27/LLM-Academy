"""
LLM Academy — Phase 2 Automated Test Suite
Direct testing of FastAPI auth endpoints, database operations, and bcrypt security.
"""

from fastapi import HTTPException, Response
from main import (
    signup, login, logout, get_me, home, health,
    SignupRequest, LoginRequest, ChatRequest
)
from database import get_db, init_db
import auth

def run_tests():
    print("==========================================")
    print("STARTING PHASE 2 AUTHENTICATION TEST SUITE")
    print("==========================================")

    init_db()

    # 1. Test existing endpoints are preserved
    print("\n[TEST 1] Testing preserved base endpoints...")
    h = home()
    assert h["status"] == "Running"
    hlth = health()
    assert hlth["status"] == "healthy"
    print("[OK] GET / and GET /health are working and preserved.")

    # 2. Test user registration (signup)
    print("\n[TEST 2] Testing user registration (signup)...")
    test_email = "test.student@llmacademy.edu"
    test_password = "SecretPassword123"
    test_name = "Alex Mercer"

    # Clean up test user if previously exists
    with get_db() as conn:
        conn.execute("DELETE FROM users WHERE email = ?;", (test_email,))

    signup_req = SignupRequest(
        full_name=test_name,
        email=test_email,
        password=test_password,
        learning_level="intermediate",
        learning_goal="Fine-tune with LoRA & QLoRA"
    )

    response = Response()
    res = signup(signup_req, response)
    assert "user" in res
    user = res["user"]
    assert user["email"] == test_email
    assert user["full_name"] == test_name
    assert "password" not in user and "password_hash" not in user
    
    # Check session cookie set on response
    set_cookie_header = response.headers.get("set-cookie", "")
    assert "session_token=" in set_cookie_header
    assert "HttpOnly" in set_cookie_header
    print("[OK] User registered successfully and password hash is NOT exposed.")
    print("[OK] HttpOnly session_token cookie properly set on response.")

    # 3. Verify password hash in SQLite database is bcrypt
    print("\n[TEST 3] Verifying database security & bcrypt hash...")
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT password_hash FROM users WHERE email = ?;", (test_email,))
        row = cursor.fetchone()
        assert row is not None
        db_hash = row["password_hash"]
        assert db_hash.startswith("$2b$") or db_hash.startswith("$2a$"), "Hash is not valid bcrypt"
        assert auth.verify_password(test_password, db_hash)
        assert not auth.verify_password("WrongPassword!", db_hash)
    print("[OK] Password securely hashed with bcrypt in SQLite database.")

    # 4. Test duplicate email registration
    print("\n[TEST 4] Testing duplicate email rejection...")
    try:
        signup(signup_req, Response())
        assert False, "Should have raised 409 Conflict"
    except HTTPException as e:
        assert e.status_code == 409
        print(f"[OK] Duplicate email registration rejected with 409 Conflict: {e.detail}")

    # 5. Test login with incorrect credentials
    print("\n[TEST 5] Testing login with wrong password...")
    try:
        login(LoginRequest(email=test_email, password="WrongPassword"), Response())
        assert False, "Should have raised 401 Unauthorized"
    except HTTPException as e:
        assert e.status_code == 401
        print(f"[OK] Login with incorrect credentials rejected with 401: {e.detail}")

    # 6. Test login with non-existent user
    print("\n[TEST 6] Testing login with non-existent email...")
    try:
        login(LoginRequest(email="nobody@example.com", password="anypassword"), Response())
        assert False, "Should have raised 401 Unauthorized"
    except HTTPException as e:
        assert e.status_code == 401
        print("[OK] Login with non-existent email rejected with 401.")

    # 7. Test login with correct credentials
    print("\n[TEST 7] Testing login with correct credentials...")
    login_resp = Response()
    res = login(LoginRequest(email=test_email, password=test_password, remember_me=True), login_resp)
    assert res["user"]["email"] == test_email
    login_cookie = login_resp.headers.get("set-cookie", "")
    assert "session_token=" in login_cookie
    # Extract raw session token
    raw_token = login_cookie.split("session_token=")[1].split(";")[0]
    print("[OK] Logged in successfully; HttpOnly session_token issued.")

    # 8. Test session lookup and protected get_me (via Cookie and Bearer Header)
    print("\n[TEST 8] Accessing protected get_me with authenticated user context...")
    authed_user_cookie = auth.get_current_user(session_token=raw_token)
    assert authed_user_cookie["email"] == test_email
    assert authed_user_cookie["learning_level"] == "intermediate"

    authed_user_bearer = auth.get_current_user(authorization=f"Bearer {raw_token}")
    assert authed_user_bearer["email"] == test_email

    me_res = get_me(current_user=authed_user_bearer)
    assert me_res["user"]["email"] == test_email
    print("[OK] Protected get_me authenticated successfully via both Cookie and Bearer header.")

    # 9. Test unauthenticated dependency failure
    print("\n[TEST 9] Testing get_current_user without valid token...")
    try:
        auth.get_current_user(None)
        assert False, "Should have raised 401"
    except HTTPException as e:
        assert e.status_code == 401
        print(f"[OK] Missing token raised 401: {e.detail}")

    try:
        auth.get_current_user("invalid_fake_token_12345")
        assert False, "Should have raised 401"
    except HTTPException as e:
        assert e.status_code == 401
        print(f"[OK] Invalid token raised 401: {e.detail}")

    # 10. Test logout and session revocation
    print("\n[TEST 10] Testing logout and session revocation...")
    logout_resp = Response()
    logout(logout_resp, raw_token)
    assert "session_token=\"\";" in logout_resp.headers.get("set-cookie", "") or "session_token=;" in logout_resp.headers.get("set-cookie", "")
    
    # Confirm session token was deleted from SQLite database
    assert auth.get_user_from_token(raw_token) is None
    print("[OK] Session successfully revoked in database and cookie expired.")

    # 11. Verify /api/chat schema & integrity
    print("\n[TEST 11] Checking /api/chat schema integrity...")
    test_chat = ChatRequest(message="Explain Transformer attention mechanism")
    assert test_chat.message == "Explain Transformer attention mechanism"
    print("[OK] /api/chat schema preserved and ready.")

    print("\n==========================================")
    print("ALL TESTS PASSED SUCCESSFULLY (100%)!")
    print("==========================================")

if __name__ == "__main__":
    run_tests()
