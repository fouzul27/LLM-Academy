"""
LLM Academy — Phase 3 AI Build Workspace Automated Test Suite
Validates project creation, 10-stage roadmap task generation, task completion,
code verification sandbox, and AI mentor context injection.
"""

from database import init_db, get_db
import auth
import project_engine
from main import (
    create_project, get_project, list_projects, update_task, verify_code,
    CreateProjectRequest, UpdateTaskRequest, VerifyCodeRequest
)

def run_tests():
    print("==========================================")
    print("STARTING PHASE 3 AI WORKSPACE TEST SUITE")
    print("==========================================")

    init_db()

    # 1. Setup mock user
    test_email = "mentor.builder@llmacademy.edu"
    with get_db() as conn:
        conn.execute("DELETE FROM users WHERE email = ?;", (test_email,))
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO users (full_name, email, password_hash, learning_level, learning_goal)
            VALUES ('Dev User', ?, 'dummy_hash', 'beginner', 'Build my own LLM');
            """,
            (test_email,)
        )
        user_id = cursor.lastrowid

    current_user = {"id": user_id, "email": test_email, "full_name": "Dev User"}

    # 2. Test project initialization
    print("\n[TEST 1] Testing project creation with 10-stage roadmap...")
    create_req = CreateProjectRequest(
        project_name="Custom TinyTransformer",
        project_goal="Build a 1.2M parameter educational decoder model",
        model_building_approach="scratch_transformer",
        experience_level="beginner",
        hardware_profile="8GB RAM, CPU (Windows 11)"
    )

    proj_res = create_project(create_req, current_user=current_user)
    assert "project" in proj_res
    project = proj_res["project"]
    project_id = project["id"]
    assert project["project_name"] == "Custom TinyTransformer"
    assert project["current_stage"] == 1
    assert len(project["tasks"]) >= 10
    print(f"[OK] Project created with ID {project_id} and {len(project['tasks'])} roadmap tasks.")

    # 3. Test list projects
    print("\n[TEST 2] Testing listing user projects...")
    list_res = list_projects(current_user=current_user)
    assert "projects" in list_res
    assert len(list_res["projects"]) >= 1
    assert list_res["projects"][0]["id"] == project_id
    print("[OK] User projects listed successfully.")

    # 4. Test fetch single project
    print("\n[TEST 3] Testing fetch project details...")
    get_res = get_project(project_id, current_user=current_user)
    assert get_res["project"]["id"] == project_id
    assert len(get_res["project"]["tasks"]) > 0
    assert len(get_res["project"]["memory"]) > 0
    print("[OK] Full project details retrieved with tasks and memory.")

    # 5. Test task status update
    print("\n[TEST 4] Testing task status update and stage progression...")
    first_task = project["tasks"][0]
    task_id = first_task["id"]
    update_req = UpdateTaskRequest(
        status="completed",
        verification_status="verified",
        verification_output="Python 3.11 virtual environment verified"
    )
    upd_res = update_task(project_id, task_id, update_req, current_user=current_user)
    assert upd_res["project"]["tasks"][0]["status"] == "completed"
    assert upd_res["project"]["tasks"][0]["verification_status"] == "verified"
    print("[OK] Task updated to completed and verification recorded.")

    # 6. Test code verification sandbox
    print("\n[TEST 5] Testing safe code verification sandbox...")
    verify_req = VerifyCodeRequest(
        code="""
# Minimal tokenizer test
vocab = {char: i for i, char in enumerate("abcdefghijklmnopqrstuvwxyz")}
text = "hello"
tokens = [vocab[c] for c in text if c in vocab]
assert len(tokens) == 5
print(f"Tokenized successfully: {tokens}")
"""
    )
    code_res = verify_code(project_id, verify_req, current_user=current_user)
    assert code_res["success"] is True
    assert "Tokenized successfully:" in code_res["stdout"]
    print(f"[OK] Code verification executed safely in {code_res['duration_seconds']}s.")

    # 7. Test AI mentor system prompt builder
    print("\n[TEST 6] Testing context-infused mentor system prompt...")
    prompt = project_engine.build_mentor_system_prompt(get_res["project"])
    assert "Custom TinyTransformer" in prompt
    assert "8GB RAM" in prompt
    assert "Stage" in prompt
    print("[OK] AI Mentor system prompt properly infused with live project state.")

    # 8. Test user isolation
    print("\n[TEST 7] Testing user isolation for projects...")
    other_user = {"id": 999999, "email": "other@domain.com"}
    other_list = list_projects(current_user=other_user)
    assert len(other_list["projects"]) == 0
    print("[OK] User isolation verified: other users cannot see this project.")

    print("\n==========================================")
    print("ALL PHASE 3 TESTS PASSED (100%)!")
    print("==========================================")

if __name__ == "__main__":
    run_tests()

