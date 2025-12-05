## IntraView AI Backend (FastAPI + MongoDB)

This backend powers the Admin & Candidate panels with real, persistent data.

### 1. Setup

- **Install dependencies** (from the `backend` folder):

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate  # on Windows
pip install -r requirements.txt
```

- **Configure MongoDB** (optional, defaults shown):

```bash
set MONGODB_URI=mongodb://localhost:27017
set MONGODB_DB_NAME=intraview_ai
```

### 2. Run the seed script

```bash
cd backend
python -m scripts.seed_data
```

This will:

- Create an admin account `admin@intraview.ai` (password: `Admin@123`).
- Import coding questions and test cases from `data/raw/merged_problems.json`.
- Import behavioral questions from `data/raw/hr_interview_questions_dataset.json`.
- Insert a curated set of System Design questions.

### 3. Start the API server

```bash
uvicorn app.main:app --reload --port 8000
```

The health check endpoint will be available at `http://localhost:8000/health`.


