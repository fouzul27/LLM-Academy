"""
LLM Academy — SQLite Database Management Module
"""

import sqlite3
import os
from contextlib import contextmanager
from typing import Generator

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")
DB_PATH = os.path.join(DATA_DIR, "llm_academy.db")

# Ensure dedicated data directory exists
os.makedirs(DATA_DIR, exist_ok=True)


def get_db_connection() -> sqlite3.Connection:
    """Create a connection to the SQLite database with row factory and WAL mode."""
    conn = sqlite3.connect(DB_PATH, timeout=10.0)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    conn.execute("PRAGMA journal_mode = WAL;")
    return conn


@contextmanager
def get_db() -> Generator[sqlite3.Connection, None, None]:
    """Context manager for safe database transactions."""
    conn = get_db_connection()
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def init_db() -> None:
    """Initialize database tables, foreign keys, and indexes."""
    with get_db() as conn:
        cursor = conn.cursor()

        # Users table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                full_name TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE,
                password_hash TEXT NOT NULL,
                learning_level TEXT DEFAULT 'beginner',
                learning_goal TEXT DEFAULT 'Build my own LLM',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)

        # Sessions table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS sessions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                token_hash TEXT NOT NULL UNIQUE,
                expires_at TIMESTAMP NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            );
        """)

        # User Preferences table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS user_preferences (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL UNIQUE,
                preferred_language TEXT DEFAULT 'english',
                learning_level TEXT DEFAULT 'beginner',
                learning_goal TEXT DEFAULT 'Build my own LLM',
                tutor_preferences TEXT DEFAULT 'patient',
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            );
        """)

        # AI Build Projects table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS build_projects (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                project_name TEXT NOT NULL,
                project_goal TEXT NOT NULL,
                model_building_approach TEXT NOT NULL,
                experience_level TEXT NOT NULL,
                hardware_profile TEXT,
                current_stage INTEGER DEFAULT 1,
                current_task TEXT DEFAULT 'Set up Python Environment',
                status TEXT DEFAULT 'in_progress',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            );
        """)

        # AI Build Tasks table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS build_tasks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                project_id INTEGER NOT NULL,
                stage INTEGER NOT NULL,
                task_name TEXT NOT NULL,
                task_description TEXT,
                status TEXT DEFAULT 'pending',
                verification_status TEXT DEFAULT 'unverified',
                verification_output TEXT,
                completed_at TIMESTAMP,
                FOREIGN KEY (project_id) REFERENCES build_projects(id) ON DELETE CASCADE
            );
        """)

        # Project Files table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS project_files (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                project_id INTEGER NOT NULL,
                file_name TEXT NOT NULL,
                file_path TEXT NOT NULL,
                description TEXT,
                last_verified_at TIMESTAMP,
                FOREIGN KEY (project_id) REFERENCES build_projects(id) ON DELETE CASCADE
            );
        """)

        # Project Memory table (persistent context for AI mentor)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS project_memory (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                project_id INTEGER NOT NULL,
                memory_type TEXT NOT NULL,
                memory_content TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (project_id) REFERENCES build_projects(id) ON DELETE CASCADE
            );
        """)

        # Indexes for fast lookup
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_sessions_token_hash ON sessions(token_hash);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_build_projects_user_id ON build_projects(user_id);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_build_tasks_project_id ON build_tasks(project_id);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_project_files_project_id ON project_files(project_id);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_project_memory_project_id ON project_memory(project_id);")


if __name__ == "__main__":
    init_db()
    print("Database initialized successfully at:", DB_PATH)
