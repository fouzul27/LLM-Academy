# LLM Academy

LLM Academy is a learning platform for exploring large language models. It includes a React application and a FastAPI backend with user accounts, learning progress, project workspaces, and an AI tutor integration.

## Requirements

- Node.js 22 or newer and npm
- Python 3.10 or newer
- Optional: [Ollama](https://ollama.com/) with the `qwen2.5:1.5b` model for AI chat
- Optional: Docker with the Docker Compose plugin

### Install Python on Windows

If PowerShell says `Python was not found` or `py` is not recognized, Python and its launcher are not installed. One option is to install Python 3.12 with WinGet:

```powershell
winget install --id Python.Python.3.12 --exact
```

Alternatively, download Python 3.10 or newer from the [official Python downloads page](https://www.python.org/downloads/windows/). In the installer, enable **Add python.exe to PATH** and install the Python launcher. After installation, close and reopen PowerShell. Confirm the installation with:

```powershell
py --version
```

If `py` is not recognized, rerun the installer and ensure the Python launcher is selected.

## Run locally

Install the frontend dependencies:

```powershell
cd frontend
npm ci
```

In one terminal, install and start the backend:

```powershell
cd backend
python -3 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

In a second terminal, start the frontend:

```powershell
cd frontend
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). The Vite development server proxies API and health requests to `http://127.0.0.1:8000`.

To enable AI chat, start Ollama and pull the configured model:

```powershell
ollama pull qwen2.5:1.5b
```

The backend defaults to `http://localhost:11434/api/chat` and `qwen2.5:1.5b`. Set `OLLAMA_URL` and `OLLAMA_MODEL` to use a different Ollama endpoint or model.

## Run with Docker Compose

From the repository root, build and start both application services:

```powershell
docker compose up --build
```

- Frontend: [http://localhost:5173](http://localhost:5173)
- Backend API: [http://localhost:8000](http://localhost:8000)
- API health: [http://localhost:8000/health](http://localhost:8000/health)

The Compose configuration connects the backend to Ollama on the host at `http://host.docker.internal:11434/api/chat`. Start Ollama on the host and pull `qwen2.5:1.5b` to enable AI chat. Override `OLLAMA_URL` or `OLLAMA_MODEL` in the environment when needed. SQLite data is persisted under `backend/data`.

Stop the services with `docker compose down`.

## Development checks

```powershell
cd frontend
npm run lint
npm run build
```

Backend tests are in `backend/test_phase2_auth.py` and `backend/test_phase3_workspace.py`.
