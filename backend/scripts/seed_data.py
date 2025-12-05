import asyncio
import json
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List

from motor.motor_asyncio import AsyncIOMotorDatabase
from passlib.context import CryptContext

from app.database import get_database
from app.models import ActivityLog, Question, TestCase, User


BASE_DIR = Path(__file__).resolve().parents[1]
RAW_DATA_DIR = BASE_DIR / "data" / "raw"

CODING_FILE = RAW_DATA_DIR / "merged_problems.json"
BEHAVIORAL_FILE = RAW_DATA_DIR / "hr_interview_questions_dataset.json"

# Match the main security module: avoid bcrypt to keep local setup simple
pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")


def _hash_password(password: str) -> str:
    return pwd_context.hash(password)


def load_json(path: Path) -> Any:
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)


async def seed_admin(db: AsyncIOMotorDatabase) -> None:
    users = db["users"]
    existing = await users.find_one({"email": "admin@intraview.ai"})
    password_hash = _hash_password("Admin@123")
    if existing:
        # Always ensure a consistent admin record for local development
        await users.update_one(
            {"_id": existing["_id"]},
            {
                "$set": {
                    "password_hash": password_hash,
                    "role": "admin",
                    "status": "active",
                    "profile_info": existing.get("profile_info") or {"name": "IntraView Admin"},
                },
                "$unset": {"password": ""},
            },
        )
        print("Updated existing admin@intraview.ai credentials")
        return

    admin = User(
        email="admin@intraview.ai",
        password_hash=password_hash,
        role="admin",
        created_at=datetime.utcnow(),
        profile_info={"name": "IntraView Admin"},
        status="active",
    )
    await users.insert_one(admin.dict(by_alias=True))
    print("Created admin@intraview.ai user")


def extract_test_cases_from_problem(problem: Dict[str, Any]) -> List[Dict[str, str]]:
    """
    Try to extract example test cases from the coding problem structure.
    This is heuristic because dataset formats may vary.
    """
    test_cases: List[Dict[str, str]] = []

    examples = problem.get("examples") or problem.get("example_testcases")
    if isinstance(examples, list):
        for ex in examples:
            inp = ex.get("input") or ex.get("input_text") or ""
            out = ex.get("output") or ex.get("output_text") or ""
            if inp or out:
                test_cases.append({"input": str(inp), "output": str(out)})

    # Fallback: some datasets use a single string with I/O pairs
    if not test_cases and isinstance(problem.get("example"), dict):
        ex = problem["example"]
        inp = ex.get("input") or ""
        out = ex.get("output") or ""
        if inp or out:
            test_cases.append({"input": str(inp), "output": str(out)})

    return test_cases


async def seed_coding_questions(db: AsyncIOMotorDatabase) -> None:
    if not CODING_FILE.exists():
        print(f"Skipping coding questions; file not found: {CODING_FILE}")
        return

    data = load_json(CODING_FILE)
    questions_col = db["questions"]
    testcases_col = db["test_cases"]

    if isinstance(data, dict):
        problems = data.get("questions") or data.get("problems") or data.get("items") or []
    else:
        problems = data

    count = 0
    updated_count = 0
    for problem in problems:
        title = problem.get("title") or problem.get("name") or "Untitled Coding Problem"
        description = (
            problem.get("description")
            or problem.get("content")
            or problem.get("problem_statement")
            or ""
        )
        difficulty = (
            problem.get("difficulty")
            or problem.get("level")
            or "Medium"
        )
        topics = problem.get("topics") or problem.get("tags") or None
        examples = problem.get("examples") or None
        constraints = problem.get("constraints") or None
        hints = problem.get("hints") or None
        code_snippets = problem.get("code_snippets") or None

        # Check if question already exists by title
        existing = await questions_col.find_one({"title": title, "category": "Coding"})
        
        if existing:
            # Update existing question with all fields
            update_data = {
                "description": str(description),
                "difficulty": str(difficulty),
                "topics": topics,
                "examples": examples,
                "constraints": constraints,
                "hints": hints,
                "code_snippets": code_snippets,
            }
            # Remove None values
            update_data = {k: v for k, v in update_data.items() if v is not None}
            await questions_col.update_one(
                {"_id": existing["_id"]},
                {"$set": update_data}
            )
            question_id = existing["_id"]
            updated_count += 1
        else:
            # Insert new question
            q = Question(
                title=title,
                category="Coding",
                difficulty=str(difficulty),
                description=str(description),
                topics=topics,
                examples=examples,
                constraints=constraints,
                hints=hints,
                code_snippets=code_snippets,
                created_at=datetime.utcnow(),
            )
            res = await questions_col.insert_one(q.dict(by_alias=True, exclude_none=True))
            question_id = res.inserted_id

        # Extract example test cases
        for tc in extract_test_cases_from_problem(problem):
            tc_model = TestCase(
                question_id=str(question_id),
                input=tc["input"],
                output=tc["output"],
                is_hidden=False,
            )
            await testcases_col.insert_one(tc_model.dict(by_alias=True))

        count += 1

    print(f"Processed {count} coding questions ({count - updated_count} inserted, {updated_count} updated)")


async def seed_behavioral_questions(db: AsyncIOMotorDatabase) -> None:
    if not BEHAVIORAL_FILE.exists():
        print(f"Skipping behavioral questions; file not found: {BEHAVIORAL_FILE}")
        return

    data = load_json(BEHAVIORAL_FILE)
    questions_col = db["questions"]

    # Clean up any previous behavioral questions / bad null _id docs
    await questions_col.delete_many({"category": "Behavioral"})
    await questions_col.delete_many({"_id": None})

    # Dataset might be a list of objects with a "question" field or similar.
    if isinstance(data, dict):
        items = data.get("questions") or data.get("items") or []
    else:
        items = data

    count = 0
    for item in items:
        text = (
            item.get("question")
            or item.get("text")
            or item.get("prompt")
            or ""
        )
        if not text:
            continue
        q = Question(
            title=text[:80],
            category="Behavioral",
            difficulty="Medium",
            description=text,
            created_at=datetime.utcnow(),
        )
        await questions_col.insert_one(q.dict(by_alias=True, exclude_none=True))
        count += 1

    print(f"Inserted {count} behavioral questions")


SYSTEM_DESIGN_QUESTIONS = [
    "Design Uber",
    "Design YouTube",
    "Design Twitter",
    "Design WhatsApp",
    "Design Instagram",
    "Design Spotify",
    "Design Netflix",
    "Design a URL Shortener",
    "Design an E-commerce platform",
    "Design a Notification System",
    "Design a Chat Application",
    "Design a Ride Sharing Service",
    "Design a News Feed System",
    "Design a File Storage Service",
    "Design a Search Autocomplete Service",
    "Design a Rate Limiter",
    "Design a Payment Gateway",
    "Design an Online Code Judge",
    "Design a Real-time Collaboration Tool",
    "Design a Monitoring and Alerting System",
]


async def seed_system_design_questions(db: AsyncIOMotorDatabase) -> None:
    questions_col = db["questions"]
    existing = await questions_col.count_documents({"category": "System Design"})
    if existing > 0:
        return

    docs = []
    for title in SYSTEM_DESIGN_QUESTIONS:
        q = Question(
            title=title,
            category="System Design",
            difficulty="Medium",
            description=title,
            created_at=datetime.utcnow(),
        )
        docs.append(q.dict(by_alias=True, exclude_none=True))

    if docs:
        await questions_col.insert_many(docs)
        print(f"Inserted {len(docs)} system design questions")


async def main() -> None:
    db = get_database().db  # type: ignore[attr-defined]

    await seed_admin(db)
    await seed_coding_questions(db)
    await seed_behavioral_questions(db)
    await seed_system_design_questions(db)

    # Simple activity log entry to mark that seeding ran
    activity_col = db["activity_logs"]
    log = ActivityLog(
        action="seed_data",
        admin_email="admin@intraview.ai",
        metadata={"source": "seed_data.py"},
    )
    await activity_col.insert_one(log.dict(by_alias=True))


if __name__ == "__main__":
    asyncio.run(main())


