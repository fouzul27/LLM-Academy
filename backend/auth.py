"""
LLM Academy — Authentication & Session Management Module
"""

import bcrypt
import hashlib
import secrets
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any
from fastapi import Cookie, Header, HTTPException, status
from database import get_db


def hash_password(password: str) -> str:
    """Hash a plaintext password using bcrypt with a secure salt."""
    salt = bcrypt.gensalt(rounds=12)
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")


def verify_password(password: str, password_hash: str) -> bool:
    """Verify a plaintext password against a stored bcrypt hash."""
    try:
        return bcrypt.checkpw(password.encode("utf-8"), password_hash.encode("utf-8"))
    except Exception:
        return False


def generate_session_token() -> str:
    """Generate a high-entropy URL-safe session token."""
    return secrets.token_urlsafe(32)


def hash_token(token: str) -> str:
    """Compute SHA-256 hash of a session token for secure database storage."""
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def create_session(user_id: int, days_valid: int = 30) -> str:
    """Create a persistent user session in SQLite and return the raw token."""
    raw_token = generate_session_token()
    token_hash = hash_token(raw_token)
    expires_at = datetime.now(timezone.utc) + timedelta(days=days_valid)
    expires_at_str = expires_at.strftime("%Y-%m-%d %H:%M:%S")

    with get_db() as conn:
        conn.execute(
            """
            INSERT INTO sessions (user_id, token_hash, expires_at)
            VALUES (?, ?, ?);
            """,
            (user_id, token_hash, expires_at_str)
        )

    return raw_token


def delete_session(raw_token: str) -> None:
    """Revoke a session by removing its token hash from the database."""
    token_hash = hash_token(raw_token)
    with get_db() as conn:
        conn.execute("DELETE FROM sessions WHERE token_hash = ?;", (token_hash,))


def get_user_from_token(raw_token: str) -> Optional[Dict[str, Any]]:
    """Retrieve user and preference data for an active session token."""
    if not raw_token:
        return None

    token_hash = hash_token(raw_token)
    now_str = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S")

    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            SELECT s.id as session_id, s.expires_at,
                   u.id, u.full_name, u.email, u.learning_level, u.learning_goal, u.created_at,
                   p.preferred_language, p.tutor_preferences
            FROM sessions s
            JOIN users u ON s.user_id = u.id
            LEFT JOIN user_preferences p ON u.id = p.user_id
            WHERE s.token_hash = ?;
            """,
            (token_hash,)
        )
        row = cursor.fetchone()

        if not row:
            return None

        # Check expiration
        expires_at_str = row["expires_at"]
        try:
            expires_at = datetime.strptime(expires_at_str, "%Y-%m-%d %H:%M:%S").replace(tzinfo=timezone.utc)
            if datetime.now(timezone.utc) > expires_at:
                # Expired session; prune it
                conn.execute("DELETE FROM sessions WHERE id = ?;", (row["session_id"],))
                return None
        except Exception:
            pass

        return {
            "id": row["id"],
            "full_name": row["full_name"],
            "email": row["email"],
            "learning_level": row["learning_level"] or "beginner",
            "learning_goal": row["learning_goal"] or "Build my own LLM",
            "preferred_language": row["preferred_language"] or "english",
            "tutor_preferences": row["tutor_preferences"] or "patient",
            "created_at": row["created_at"],
        }


def extract_token_from_request(session_token: Any = None, authorization: Any = None) -> Optional[str]:
    """Helper to retrieve token from either Cookie or Authorization header."""
    if isinstance(session_token, str) and session_token.strip():
        return session_token.strip()
    if isinstance(authorization, str) and authorization.strip():
        val = authorization.strip()
        if val.lower().startswith("bearer "):
            return val[7:].strip()
        return val
    return None


def get_current_user(
    session_token: Optional[str] = Cookie(None),
    authorization: Optional[str] = Header(None)
) -> Dict[str, Any]:
    """FastAPI dependency to require authentication from either Cookie or Bearer header."""
    token = extract_token_from_request(session_token, authorization)
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Please sign in."
        )

    user = get_user_from_token(token)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session expired or invalid. Please sign in again."
        )

    return user


def get_optional_user(
    session_token: Optional[str] = Cookie(None),
    authorization: Optional[str] = Header(None)
) -> Optional[Dict[str, Any]]:
    """FastAPI dependency for optional user context without raising 401."""
    token = extract_token_from_request(session_token, authorization)
    if not token:
        return None
    return get_user_from_token(token)

