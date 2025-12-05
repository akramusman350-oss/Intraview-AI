"""
Seed sample interview sessions with Pakistani names.
"""
import asyncio
from datetime import datetime, timedelta
from random import choice, randint

from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId

from app.database import get_database
from app.models import Session

# Pakistani names
PAKISTANI_NAMES = [
    "Usman Akram",
    "Abdulrehman",
    "Abdullah Nadeem",
    "Talha Naveed",
    "Ahmed Ali",
    "Hassan Raza",
    "Muhammad Bilal",
    "Zain Malik",
    "Hamza Khan",
    "Ali Hassan",
    "Omar Sheikh",
    "Faisal Ahmed",
]

INTERVIEW_TYPES = ["Behavioral", "Coding", "System Design", "Programming"]
STATUSES = ["active", "completed", "cancelled"]


async def seed_sessions(db: AsyncIOMotorDatabase) -> None:
    users_col = db["users"]
    sessions_col = db["sessions"]
    
    # Clear existing active sessions first
    await sessions_col.delete_many({"status": "active"})
    print("Cleared existing active sessions.")
    
    # Get all candidate users
    candidates = await users_col.find({"role": "candidate"}).to_list(length=100)
    
    # Use existing candidates or create sessions with Pakistani names directly
    if not candidates:
        print("No candidates found. Creating sessions with Pakistani names directly.")
        # Create sessions without candidate_id (using None or a placeholder)
        candidate_ids = [None] * len(PAKISTANI_NAMES)
    else:
        # Use existing candidates and cycle through them
        candidate_ids = [ObjectId(c["_id"]) for c in candidates]
    
    # Create some live (active) sessions - 12-13 sessions for pagination
    live_count = 0
    for i in range(min(13, len(PAKISTANI_NAMES))):
        candidate_id = candidate_ids[i % len(candidate_ids)] if candidate_ids[0] is not None else None
        candidate_name = PAKISTANI_NAMES[i]
        
        session_dict = {
            "candidate_id": candidate_id,
            "status": "active",
            "scores": {},
            "created_at": datetime.utcnow() - timedelta(minutes=randint(5, 30)),
            "interview_type": choice(INTERVIEW_TYPES),
            "current_question": randint(1, 10),
            "total_questions": 10,
            "candidate_name": candidate_name,
        }
        
        await sessions_col.insert_one(session_dict)
        live_count += 1
    
    # Create session history (completed and cancelled) - 20+ sessions
    history_count = 0
    for i in range(25):
        candidate_id = candidate_ids[i % len(candidate_ids)] if candidate_ids[0] is not None else None
        candidate_name = PAKISTANI_NAMES[i % len(PAKISTANI_NAMES)]
        status = choice(["completed", "cancelled"])
        
        # Generate varied scores for each category to create fluctuation
        if status == "completed":
            base_score = randint(55, 95)
            # Add some variation to each category score
            scores = {
                "overall": base_score,
                "technical": max(0, min(100, base_score + randint(-10, 10))),
                "behavioral": max(0, min(100, base_score + randint(-8, 12))),
                "programming": max(0, min(100, base_score + randint(-12, 8))),
                "architecture": max(0, min(100, base_score + randint(-10, 10))),
            }
        else:
            scores = {"overall": 0}
        
        session_dict = {
            "candidate_id": candidate_id,
            "status": status,
            "scores": scores,
            "created_at": datetime.utcnow() - timedelta(days=randint(1, 30)),
            "interview_type": choice(INTERVIEW_TYPES),
            "duration_minutes": randint(15, 60),
            "candidate_name": candidate_name,
        }
        
        if status == "completed":
            session_dict["completed_at"] = session_dict["created_at"] + timedelta(minutes=session_dict["duration_minutes"])
        
        await sessions_col.insert_one(session_dict)
        history_count += 1
    
    print(f"Created {live_count} live sessions and {history_count} session history records")


async def main() -> None:
    db = get_database().db  # type: ignore[attr-defined]
    await seed_sessions(db)


if __name__ == "__main__":
    asyncio.run(main())

