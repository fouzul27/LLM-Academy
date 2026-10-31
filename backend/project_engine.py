"""
LLM Academy — AI Project Engine & Roadmap Generation Module
Handles project initialization, personalized roadmap creation, task tracking,
context generation for Qwen, and secure local code verification.
"""

import sys
import subprocess
import os
import tempfile
import time
from typing import List, Dict, Any, Optional
from database import get_db

# Base 10-Stage Roadmap template
DEFAULT_ROADMAP_STAGES = [
    {
        "stage": 1,
        "name": "Development Environment",
        "tasks": [
            {
                "task_name": "Set up Python virtual environment",
                "task_description": "Create a clean Python 3.10+ virtual environment and verify Python path."
            },
            {
                "task_name": "Install core AI libraries",
                "task_description": "Install PyTorch (CPU/CUDA), NumPy, and verify torch.cuda.is_available()."
            },
            {
                "task_name": "Verify installation with health script",
                "task_description": "Run a minimal tensor calculation script to verify your development setup."
            }
        ]
    },
    {
        "stage": 2,
        "name": "Language Model Fundamentals",
        "tasks": [
            {
                "task_name": "Explore tokens and vocabularies",
                "task_description": "Understand how raw text converts into discrete integer tokens."
            },
            {
                "task_name": "Study input and target sequence pairs",
                "task_description": "Construct sequence inputs x and target sequence y shifted by one token for next-token prediction."
            }
        ]
    },
    {
        "stage": 3,
        "name": "Dataset Preparation",
        "tasks": [
            {
                "task_name": "Collect and inspect raw training text",
                "task_description": "Load an open text corpus (e.g. TinyShakespeare or custom domain text) and verify license."
            },
            {
                "task_name": "Clean and normalize text data",
                "task_description": "Strip invalid Unicode, normalize whitespace, and split into 90% train and 10% validation sets."
            }
        ]
    },
    {
        "stage": 4,
        "name": "Build a Tokenizer",
        "tasks": [
            {
                "task_name": "Implement Character & Word Tokenizer",
                "task_description": "Build tokenizer.py with encode() and decode() methods mapping chars/subwords to IDs."
            },
            {
                "task_name": "Verify tokenization fidelity",
                "task_description": "Ensure text == decode(encode(text)) across diverse text samples."
            }
        ]
    },
    {
        "stage": 5,
        "name": "Build the Language Model Architecture",
        "tasks": [
            {
                "task_name": "Implement Embedding & Positional Encoding",
                "task_description": "Build nn.Embedding for token IDs and learned positional embeddings in model.py."
            },
            {
                "task_name": "Implement Multi-Head Self-Attention",
                "task_description": "Build scaled dot-product attention with causal mask (tril) so tokens only attend to past tokens."
            },
            {
                "task_name": "Implement Feed-Forward & Residual Blocks",
                "task_description": "Combine MultiHeadAttention, LayerNorm, and 2-layer MLP with residual connections into a TransformerBlock."
            },
            {
                "task_name": "Assemble the complete TinyTransformer",
                "task_description": "Stack N TransformerBlocks, final LayerNorm, and linear LM Head projecting to vocab_size."
            }
        ]
    },
    {
        "stage": 6,
        "name": "Train the Model",
        "tasks": [
            {
                "task_name": "Implement DataLoader and batching",
                "task_description": "Create get_batch(split) function returning tensor batches of shape (B, T)."
            },
            {
                "task_name": "Write PyTorch training loop",
                "task_description": "Set up AdamW optimizer, CrossEntropyLoss, and calculate train vs validation loss."
            },
            {
                "task_name": "Train model and save checkpoint",
                "task_description": "Train model on CPU/GPU, monitor loss curve reduction, and save model.pt checkpoint."
            }
        ]
    },
    {
        "stage": 7,
        "name": "Text Generation",
        "tasks": [
            {
                "task_name": "Implement autoregressive generation",
                "task_description": "Build generate() method predicting tokens iteratively from a prompt."
            },
            {
                "task_name": "Implement Temperature & Top-K sampling",
                "task_description": "Add temperature scaling and top-k filtering to prevent repetitive or chaotic generation."
            }
        ]
    },
    {
        "stage": 8,
        "name": "Model Optimization & LoRA",
        "tasks": [
            {
                "task_name": "Evaluate model perplexity",
                "task_description": "Calculate perplexity exp(val_loss) on held-out text."
            },
            {
                "task_name": "Explore LoRA parameter-efficient tuning",
                "task_description": "Study low-rank adaptation matrices (A and B) to customize pre-trained weights."
            }
        ]
    },
    {
        "stage": 9,
        "name": "Build Local AI Application",
        "tasks": [
            {
                "task_name": "Create FastAPI inference API",
                "task_description": "Wrap your model in a lightweight FastAPI service with a POST /generate endpoint."
            },
            {
                "task_name": "Build interactive chat client",
                "task_description": "Connect a local web interface to interact with your custom trained model."
            }
        ]
    },
    {
        "stage": 10,
        "name": "Advanced Deployment",
        "tasks": [
            {
                "task_name": "Model quantization (INT8/GGUF)",
                "task_description": "Quantize model weights to run efficiently on low-memory devices."
            },
            {
                "task_name": "Review production LLM architectures",
                "task_description": "Compare your educational model with Llama 3, Mistral, and Qwen architectures."
            }
        ]
    }
]


def create_initial_project(
    user_id: int,
    project_name: str,
    project_goal: str,
    model_building_approach: str,
    experience_level: str,
    hardware_profile: Optional[str] = "8GB RAM, CPU / Integrated Graphics"
) -> Dict[str, Any]:
    """Create a new project with tailored tasks based on user experience and approach."""
    with get_db() as conn:
        cursor = conn.cursor()

        cursor.execute(
            """
            INSERT INTO build_projects (
                user_id, project_name, project_goal, model_building_approach,
                experience_level, hardware_profile, current_stage, current_task
            ) VALUES (?, ?, ?, ?, ?, ?, 1, 'Set up Python virtual environment');
            """,
            (
                user_id, project_name, project_goal, model_building_approach,
                experience_level, hardware_profile
            )
        )
        project_id = cursor.lastrowid

        # Insert roadmap tasks
        for stage_info in DEFAULT_ROADMAP_STAGES:
            stage_num = stage_info["stage"]
            for task_info in stage_info["tasks"]:
                cursor.execute(
                    """
                    INSERT INTO build_tasks (
                        project_id, stage, task_name, task_description, status, verification_status
                    ) VALUES (?, ?, ?, ?, 'pending', 'unverified');
                    """,
                    (project_id, stage_num, task_info["task_name"], task_info["task_description"])
                )

        # Record initial project memory
        cursor.execute(
            """
            INSERT INTO project_memory (project_id, memory_type, memory_content)
            VALUES (?, 'context', ?);
            """,
            (
                project_id,
                f"Project '{project_name}' initiated. Goal: {project_goal}. "
                f"Approach: {model_building_approach}. Learner Experience: {experience_level}. "
                f"Hardware Profile: {hardware_profile}."
            )
        )

    return get_project_by_id(project_id, user_id)


def get_project_by_id(project_id: int, user_id: int) -> Optional[Dict[str, Any]]:
    """Retrieve full project details with tasks, files, and memory."""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT * FROM build_projects WHERE id = ? AND user_id = ?;",
            (project_id, user_id)
        )
        project_row = cursor.fetchone()
        if not project_row:
            return None

        project = dict(project_row)

        # Fetch tasks
        cursor.execute(
            "SELECT * FROM build_tasks WHERE project_id = ? ORDER BY stage ASC, id ASC;",
            (project_id,)
        )
        tasks = [dict(r) for r in cursor.fetchall()]

        # Fetch files
        cursor.execute(
            "SELECT * FROM project_files WHERE project_id = ? ORDER BY id ASC;",
            (project_id,)
        )
        files = [dict(r) for r in cursor.fetchall()]

        # Fetch memory entries
        cursor.execute(
            "SELECT * FROM project_memory WHERE project_id = ? ORDER BY id DESC LIMIT 20;",
            (project_id,)
        )
        memory = [dict(r) for r in cursor.fetchall()]

        project["tasks"] = tasks
        project["files"] = files
        project["memory"] = memory
        return project


def get_user_projects(user_id: int) -> List[Dict[str, Any]]:
    """Get all projects belonging to a user."""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            SELECT p.*,
                   (SELECT COUNT(*) FROM build_tasks WHERE project_id = p.id AND status = 'completed') as completed_tasks_count,
                   (SELECT COUNT(*) FROM build_tasks WHERE project_id = p.id) as total_tasks_count
            FROM build_projects p
            WHERE p.user_id = ?
            ORDER BY p.updated_at DESC;
            """,
            (user_id,)
        )
        return [dict(r) for r in cursor.fetchall()]


def update_task_status(
    project_id: int,
    user_id: int,
    task_id: int,
    status: str,
    verification_status: str = "unverified",
    verification_output: Optional[str] = None
) -> Optional[Dict[str, Any]]:
    """Update task completion status and update project current task."""
    with get_db() as conn:
        cursor = conn.cursor()
        # Verify ownership
        cursor.execute("SELECT id FROM build_projects WHERE id = ? AND user_id = ?;", (project_id, user_id))
        if not cursor.fetchone():
            return None

        cursor.execute(
            """
            UPDATE build_tasks
            SET status = ?, verification_status = ?, verification_output = ?,
                completed_at = CASE WHEN ? = 'completed' THEN CURRENT_TIMESTAMP ELSE NULL END
            WHERE id = ? AND project_id = ?;
            """,
            (status, verification_status, verification_output, status, task_id, project_id)
        )

        # Update project current_task to next pending task
        cursor.execute(
            """
            SELECT stage, task_name FROM build_tasks
            WHERE project_id = ? AND status != 'completed'
            ORDER BY stage ASC, id ASC LIMIT 1;
            """,
            (project_id,)
        )
        next_task = cursor.fetchone()
        if next_task:
            cursor.execute(
                """
                UPDATE build_projects
                SET current_stage = ?, current_task = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?;
                """,
                (next_task["stage"], next_task["task_name"], project_id)
            )

        # Record update in project memory
        cursor.execute(
            """
            INSERT INTO project_memory (project_id, memory_type, memory_content)
            VALUES (?, 'checkpoint', ?);
            """,
            (project_id, f"Task {task_id} marked as {status} (verification: {verification_status}).")
        )

    return get_project_by_id(project_id, user_id)


def execute_python_verification(code: str, timeout_seconds: int = 8) -> Dict[str, Any]:
    """
    Safely execute submitted Python code in an isolated temporary directory.
    Restricts execution time, captures stdout/stderr, and prevents shell injection.
    """
    start_time = time.time()
    with tempfile.TemporaryDirectory() as temp_dir:
        temp_file = os.path.join(temp_dir, "verify_task.py")
        with open(temp_file, "w", encoding="utf-8") as f:
            f.write(code)

        try:
            # Run using the backend virtual environment's python executable
            proc = subprocess.run(
                [sys.executable, temp_file],
                cwd=temp_dir,
                capture_output=True,
                text=True,
                timeout=timeout_seconds
            )
            duration = round(time.time() - start_time, 3)

            return {
                "success": proc.returncode == 0,
                "exit_code": proc.returncode,
                "stdout": proc.stdout[:4000] if proc.stdout else "",
                "stderr": proc.stderr[:4000] if proc.stderr else "",
                "duration_seconds": duration,
                "timed_out": False
            }
        except subprocess.TimeoutExpired:
            return {
                "success": False,
                "exit_code": -1,
                "stdout": "",
                "stderr": f"Execution timed out after {timeout_seconds} seconds. Check for infinite loops.",
                "duration_seconds": timeout_seconds,
                "timed_out": True
            }
        except Exception as e:
            return {
                "success": False,
                "exit_code": -1,
                "stdout": "",
                "stderr": f"Execution failed: {str(e)}",
                "duration_seconds": 0,
                "timed_out": False
            }


def build_mentor_system_prompt(project: Dict[str, Any]) -> str:
    """Generate an authoritative, context-infused system prompt for Qwen AI Mentor."""
    project_name = project.get("project_name", "My LLM")
    project_goal = project.get("project_goal", "Build a Transformer")
    approach = project.get("model_building_approach", "scratch_transformer")
    exp = project.get("experience_level", "beginner")
    hardware = project.get("hardware_profile", "8GB RAM, CPU")
    current_stage = project.get("current_stage", 1)
    current_task = project.get("current_task", "Set up environment")

    # Completed tasks list
    completed_tasks = [
        t["task_name"] for t in project.get("tasks", []) if t.get("status") == "completed"
    ]
    completed_str = ", ".join(completed_tasks) if completed_tasks else "None yet"

    # Recent memory summaries
    recent_memories = [
        m["memory_content"] for m in project.get("memory", [])[:5]
    ]
    memories_str = " | ".join(recent_memories) if recent_memories else "Project recently started."

    return (
        f"You are the Senior AI Mentor and Lead Engineer at LLM Academy. "
        f"You are actively pair-programming with the user to help them build their own Large Language Model.\n\n"
        f"PROJECT CONTEXT:\n"
        f"- Project Name: {project_name}\n"
        f"- Project Goal: {project_goal}\n"
        f"- Architecture Approach: {approach}\n"
        f"- Learner Skill Level: {exp}\n"
        f"- Hardware Constraints: {hardware}\n"
        f"- Current Development Stage: Stage {current_stage} of 10\n"
        f"- Active Task: {current_task}\n"
        f"- Completed Milestones: {completed_str}\n"
        f"- Recent Project Memory: {memories_str}\n\n"
        f"TEACHING RULES:\n"
        f"1. You are building THIS model together step-by-step. Guide, explain, provide working code, and verify output.\n"
        f"2. Follow the 6-Step Pattern: Explain -> Show -> Implement (provide full code) -> Guide execution -> Verify output -> Continue.\n"
        f"3. Teach one practical step at a time. Never dump an entire multi-thousand line Transformer at once.\n"
        f"4. Tailor code and memory recommendations to the user's hardware ({hardware}). "
        f"For 8GB RAM and CPU, recommend small models (e.g. 5M - 15M parameters, batch size 16-32, embedding dim 64-128, 4 layers).\n"
        f"5. When generating code, always specify the file name (e.g. `tokenizer.py` or `model.py`), complete runnable Python code, and terminal command.\n"
        f"6. If the user shares an error, carefully diagnose the root cause and provide the exact fix.\n"
        f"7. Be encouraging, precise, and practical. Never fabricate execution outputs."
    )

