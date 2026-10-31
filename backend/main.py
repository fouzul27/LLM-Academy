from fastapi import FastAPI, HTTPException, Response, Cookie, Header, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import requests
import re
from typing import Optional

from database import init_db, get_db
import auth

app = FastAPI(title="LLM Academy API")

# Initialize database tables on startup
@app.on_event("startup")
def on_startup():
    init_db()

# Allow React frontend to communicate with Python (credentials allowed for session cookies)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

OLLAMA_URL = "http://localhost:11434/api/chat"
MODEL_NAME = "qwen2.5:1.5b"


class ChatRequest(BaseModel):
    message: str


# --- Authentication Schemas ---

class SignupRequest(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=100)
    email: str = Field(..., min_length=5, max_length=150)
    password: str = Field(..., min_length=6, max_length=128)
    learning_level: Optional[str] = "beginner"
    learning_goal: Optional[str] = "Build my own LLM"


class LoginRequest(BaseModel):
    email: str
    password: str
    remember_me: Optional[bool] = False


class UpdatePreferencesRequest(BaseModel):
    learning_level: Optional[str] = None
    learning_goal: Optional[str] = None
    preferred_language: Optional[str] = None
    tutor_preferences: Optional[str] = None


EMAIL_REGEX = re.compile(r"^[\w\.-]+@[\w\.-]+\.\w+$")


# --- Existing Endpoints (Preserved) ---

@app.get("/")
def home():
    return {
        "message": "Welcome to LLM Academy API",
        "status": "Running"
    }


@app.get("/health")
def health():
    return {"status": "healthy"}


@app.post("/api/chat")
def chat(request: ChatRequest):
    try:
        response = requests.post(
            OLLAMA_URL,
            json={
                "model": MODEL_NAME,
                "messages": [
                    {
                        "role": "system",
                        "content": (
                            "You are LLM Academy, a friendly AI teacher. "
                            "Teach users about AI, machine learning, "
                            "LLMs, Python and model development. "
                            "Explain concepts according to their skill level."
                        )
                    },
                    {
                        "role": "user",
                        "content": request.message
                    }
                ],
                "stream": False
            },
            timeout=180
        )

        response.raise_for_status()

        result = response.json()

        return {
            "reply": result["message"]["content"]
        }

    except requests.exceptions.RequestException as error:
        raise HTTPException(
            status_code=503,
            detail=f"AI model connection failed: {error}"
        )


# --- Authentication Endpoints ---

@app.post("/api/auth/signup")
def signup(req: SignupRequest, response: Response):
    email = req.email.strip().lower()
    full_name = req.full_name.strip()

    if not EMAIL_REGEX.match(email):
        raise HTTPException(status_code=400, detail="Invalid email address format.")

    if len(req.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters.")

    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM users WHERE email = ?;", (email,))
        if cursor.fetchone():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="An account with this email address already exists."
            )

        password_hash = auth.hash_password(req.password)
        cursor.execute(
            """
            INSERT INTO users (full_name, email, password_hash, learning_level, learning_goal)
            VALUES (?, ?, ?, ?, ?);
            """,
            (full_name, email, password_hash, req.learning_level, req.learning_goal)
        )
        user_id = cursor.lastrowid

        # Initialize user preferences
        cursor.execute(
            """
            INSERT INTO user_preferences (user_id, learning_level, learning_goal)
            VALUES (?, ?, ?);
            """,
            (user_id, req.learning_level, req.learning_goal)
        )

    # Create session and set HttpOnly cookie
    raw_token = auth.create_session(user_id, days_valid=30)
    response.set_cookie(
        key="session_token",
        value=raw_token,
        httponly=True,
        samesite="lax",
        secure=False,  # Suitable for local development
        max_age=30 * 86400,
        path="/"
    )

    return {
        "message": "Account created successfully.",
        "session_token": raw_token,
        "user": {
            "id": user_id,
            "full_name": full_name,
            "email": email,
            "learning_level": req.learning_level,
            "learning_goal": req.learning_goal,
            "preferred_language": "english",
            "tutor_preferences": "patient"
        }
    }


@app.post("/api/auth/login")
def login(req: LoginRequest, response: Response):
    email = req.email.strip().lower()

    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            SELECT u.id, u.full_name, u.email, u.password_hash, u.learning_level, u.learning_goal,
                   p.preferred_language, p.tutor_preferences
            FROM users u
            LEFT JOIN user_preferences p ON u.id = p.user_id
            WHERE u.email = ?;
            """,
            (email,)
        )
        row = cursor.fetchone()

        if not row or not auth.verify_password(req.password, row["password_hash"]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password."
            )

        user_id = row["id"]
        user_data = {
            "id": row["id"],
            "full_name": row["full_name"],
            "email": row["email"],
            "learning_level": row["learning_level"] or "beginner",
            "learning_goal": row["learning_goal"] or "Build my own LLM",
            "preferred_language": row["preferred_language"] or "english",
            "tutor_preferences": row["tutor_preferences"] or "patient"
        }

    # Session duration based on remember_me
    days = 30 if req.remember_me else 7
    raw_token = auth.create_session(user_id, days_valid=days)

    response.set_cookie(
        key="session_token",
        value=raw_token,
        httponly=True,
        samesite="lax",
        secure=False,
        max_age=days * 86400,
        path="/"
    )

    return {
        "message": "Logged in successfully.",
        "session_token": raw_token,
        "user": user_data
    }


@app.post("/api/auth/logout")
def logout(
    response: Response,
    session_token: Optional[str] = Cookie(None),
    authorization: Optional[str] = Header(None)
):
    token = auth.extract_token_from_request(session_token, authorization)
    if token:
        auth.delete_session(token)

    response.delete_cookie(key="session_token", path="/")
    return {"message": "Logged out successfully."}


@app.get("/api/auth/me")
def get_me(current_user: dict = Depends(auth.get_current_user)):
    return {"user": current_user}


@app.put("/api/auth/preferences")
def update_preferences(
    req: UpdatePreferencesRequest,
    current_user: dict = Depends(auth.get_current_user)
):
    user_id = current_user["id"]
    with get_db() as conn:
        cursor = conn.cursor()
        if req.learning_level is not None:
            cursor.execute("UPDATE users SET learning_level = ? WHERE id = ?;", (req.learning_level, user_id))
            cursor.execute("UPDATE user_preferences SET learning_level = ? WHERE user_id = ?;", (req.learning_level, user_id))

        if req.learning_goal is not None:
            cursor.execute("UPDATE users SET learning_goal = ? WHERE id = ?;", (req.learning_goal, user_id))
            cursor.execute("UPDATE user_preferences SET learning_goal = ? WHERE user_id = ?;", (req.learning_goal, user_id))

        if req.preferred_language is not None:
            cursor.execute("UPDATE user_preferences SET preferred_language = ? WHERE user_id = ?;", (req.preferred_language, user_id))

        if req.tutor_preferences is not None:
            cursor.execute("UPDATE user_preferences SET tutor_preferences = ? WHERE user_id = ?;", (req.tutor_preferences, user_id))

    # Return refreshed user data
    refreshed_user = auth.get_user_from_token("")  # Or simply reload
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            SELECT u.id, u.full_name, u.email, u.learning_level, u.learning_goal,
                   p.preferred_language, p.tutor_preferences
            FROM users u
            LEFT JOIN user_preferences p ON u.id = p.user_id
            WHERE u.id = ?;
            """,
            (user_id,)
        )
        row = cursor.fetchone()
        return {
            "user": {
                "id": row["id"],
                "full_name": row["full_name"],
                "email": row["email"],
                "learning_level": row["learning_level"],
                "learning_goal": row["learning_goal"],
                "preferred_language": row["preferred_language"],
                "tutor_preferences": row["tutor_preferences"]
            }
        }


# --- AI Build Project Schemas & Endpoints ---

import project_engine


class CreateProjectRequest(BaseModel):
    model_config = {"protected_namespaces": ()}
    project_name: str = Field(..., min_length=2, max_length=150)
    project_goal: str = Field(..., min_length=2)
    model_building_approach: str = Field(..., min_length=2)
    experience_level: str = Field(..., min_length=2)
    hardware_profile: Optional[str] = "8GB RAM, CPU / Integrated Graphics"


class UpdateTaskRequest(BaseModel):
    status: str
    verification_status: Optional[str] = "unverified"
    verification_output: Optional[str] = None


class ProjectChatRequest(BaseModel):
    message: str


class VerifyCodeRequest(BaseModel):
    code: str


@app.get("/api/projects")
def list_projects(current_user: dict = Depends(auth.get_current_user)):
    """Retrieve all AI model projects created by the user."""
    projects = project_engine.get_user_projects(current_user["id"])
    return {"projects": projects}


@app.post("/api/projects")
def create_project(
    req: CreateProjectRequest,
    current_user: dict = Depends(auth.get_current_user)
):
    """Initialize a new AI build project with tailored 10-stage roadmap."""
    project = project_engine.create_initial_project(
        user_id=current_user["id"],
        project_name=req.project_name.strip(),
        project_goal=req.project_goal.strip(),
        model_building_approach=req.model_building_approach.strip(),
        experience_level=req.experience_level.strip(),
        hardware_profile=req.hardware_profile.strip() if req.hardware_profile else "8GB RAM, CPU"
    )
    return {"project": project, "message": "Project initiated successfully."}


@app.get("/api/projects/{project_id}")
def get_project(
    project_id: int,
    current_user: dict = Depends(auth.get_current_user)
):
    """Retrieve full project details with tasks, files, and memory."""
    project = project_engine.get_project_by_id(project_id, current_user["id"])
    if not project:
        raise HTTPException(status_code=404, detail="Project not found.")
    return {"project": project}


@app.put("/api/projects/{project_id}/tasks/{task_id}")
def update_task(
    project_id: int,
    task_id: int,
    req: UpdateTaskRequest,
    current_user: dict = Depends(auth.get_current_user)
):
    """Update task milestone status and advance project stage."""
    updated_project = project_engine.update_task_status(
        project_id=project_id,
        user_id=current_user["id"],
        task_id=task_id,
        status=req.status,
        verification_status=req.verification_status or "unverified",
        verification_output=req.verification_output
    )
    if not updated_project:
        raise HTTPException(status_code=404, detail="Project or task not found.")
    return {"project": updated_project, "message": "Task updated successfully."}


@app.post("/api/projects/{project_id}/chat")
def project_chat(
    project_id: int,
    req: ProjectChatRequest,
    current_user: dict = Depends(auth.get_current_user)
):
    """
    Project-aware AI Mentor chat.
    Injects project goal, roadmap stage, active task, files, and memory into Qwen.
    """
    project = project_engine.get_project_by_id(project_id, current_user["id"])
    if not project:
        raise HTTPException(status_code=404, detail="Project not found.")

    system_prompt = project_engine.build_mentor_system_prompt(project)

    try:
        response = requests.post(
            OLLAMA_URL,
            json={
                "model": MODEL_NAME,
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": req.message}
                ],
                "stream": False
            },
            timeout=180
        )
        response.raise_for_status()
        result = response.json()
        reply = result["message"]["content"]

        # Record interaction in project memory
        with get_db() as conn:
            conn.execute(
                """
                INSERT INTO project_memory (project_id, memory_type, memory_content)
                VALUES (?, 'qa', ?);
                """,
                (project_id, f"User asked: '{req.message[:80]}...' | Mentor advised on next step.")
            )

        return {"reply": reply}
    except requests.exceptions.RequestException as error:
        raise HTTPException(
            status_code=503,
            detail=f"AI Mentor connection failed: {error}"
        )


@app.post("/api/projects/{project_id}/verify-code")
def verify_code(
    project_id: int,
    req: VerifyCodeRequest,
    current_user: dict = Depends(auth.get_current_user)
):
    """
    Safely execute submitted Python code in an isolated temporary environment.
    Captures outputs, errors, and execution metrics.
    """
    # Verify project ownership
    project = project_engine.get_project_by_id(project_id, current_user["id"])
    if not project:
        raise HTTPException(status_code=404, detail="Project not found.")

    res = project_engine.execute_python_verification(req.code)

    # Save verification record in project memory
    with get_db() as conn:
        status_text = "PASSED" if res["success"] else "FAILED"
        conn.execute(
            """
            INSERT INTO project_memory (project_id, memory_type, memory_content)
            VALUES (?, 'execution', ?);
            """,
            (project_id, f"Code execution {status_text} in {res['duration_seconds']}s.")
        )

    return res
