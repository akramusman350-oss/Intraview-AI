"""
Import questions from newdata.csv (100,000 questions max).
Questions will be stored with category="Programming" (Technical in frontend),
with randomly assigned subcategories and difficulty levels.
Uses bulk insert for fast performance.
"""
import asyncio
import csv
import random
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Any

from motor.motor_asyncio import AsyncIOMotorDatabase

from app.database import get_database
from app.models import Question

BASE_DIR = Path(__file__).resolve().parents[1]
NEWDATA_FILE = BASE_DIR.parent / "newdata.csv"  # In root directory

# Common technical/programming subcategories
TECHNICAL_SUBCATEGORIES = [
    "Algorithms",
    "Data Structures",
    "Object-Oriented Programming",
    "Database Design",
    "System Architecture",
    "API Design",
    "Security",
    "Performance Optimization",
    "Testing",
    "Design Patterns",
    "Concurrency",
    "Memory Management",
    "Networking",
    "Operating Systems",
    "Software Engineering",
    "Code Quality",
    "Refactoring",
    "Version Control",
    "DevOps",
    "Cloud Computing",
]

DIFFICULTIES = ["Easy", "Medium", "Hard"]


async def get_existing_subcategories(db: AsyncIOMotorDatabase) -> List[str]:
    """Get existing subcategories from database, or use defaults."""
    try:
        pipeline = [
            {"$match": {"category": "Programming", "programming_subcategory": {"$exists": True, "$ne": None}}},
            {"$group": {"_id": "$programming_subcategory"}},
            {"$sort": {"_id": 1}},
        ]
        cursor = db["questions"].aggregate(pipeline)
        subcategories = []
        async for doc in cursor:
            subcategories.append(doc["_id"])
        
        if subcategories:
            print(f"Found {len(subcategories)} existing subcategories in database")
            return subcategories
    except Exception as e:
        print(f"Error fetching subcategories: {e}")
    
    print(f"Using default {len(TECHNICAL_SUBCATEGORIES)} subcategories")
    return TECHNICAL_SUBCATEGORIES


async def import_newdata_questions(db: AsyncIOMotorDatabase, max_questions: int = 100000) -> None:
    """Import questions from newdata.csv with batch inserts for speed."""
    if not NEWDATA_FILE.exists():
        print(f"File not found: {NEWDATA_FILE}")
        print(f"Looking for file at: {NEWDATA_FILE.absolute()}")
        return

    questions_col = db["questions"]
    
    # Get subcategories
    subcategories = await get_existing_subcategories(db)
    if not subcategories:
        subcategories = TECHNICAL_SUBCATEGORIES
    
    print(f"Using subcategories: {subcategories[:5]}... (total: {len(subcategories)})")
    
    # Try different encodings
    encodings = ["utf-8-sig", "utf-8", "latin-1", "cp1252"]
    file_handle = None
    reader = None
    
    for encoding in encodings:
        try:
            file_handle = NEWDATA_FILE.open("r", encoding=encoding, errors="replace")
            reader = csv.DictReader(file_handle)
            # Test read first row
            test_row = next(reader)
            file_handle.seek(0)
            reader = csv.DictReader(file_handle)
            print(f"Successfully opened CSV with encoding: {encoding}")
            break
        except (UnicodeDecodeError, StopIteration) as e:
            if file_handle:
                file_handle.close()
                file_handle = None
            continue
    
    if not reader or not file_handle:
        print("Failed to read CSV file with any encoding")
        return
    
    count = 0
    skipped = 0
    batch_size = 5000  # Insert in batches of 5000 for speed
    batch: List[Dict[str, Any]] = []
    start_time = datetime.utcnow()
    
    try:
        print(f"Starting import (max {max_questions} questions)...")
        print(f"CSV columns detected: {reader.fieldnames}")
        
        for row_num, row in enumerate(reader, start=1):
            if count >= max_questions:
                break
            
            # Get question and answer (try multiple column name variations)
            question_text = (
                row.get("Questions") or row.get("Question") or 
                row.get("questions") or row.get("question") or ""
            ).strip()
            answer = (
                row.get("Answers") or row.get("Answer") or 
                row.get("answers") or row.get("answer") or ""
            ).strip()
            
            if not question_text:
                skipped += 1
                if skipped <= 5:
                    print(f"Row {row_num}: Skipping empty question")
                continue
            
            # Show first few rows for debugging
            if count < 3:
                print(f"Row {row_num}: Question preview: {question_text[:50]}...")
            
            # Create title (first 80 chars or full if shorter)
            title = question_text[:80] if len(question_text) > 80 else question_text
            
            # Randomly assign subcategory and difficulty
            subcategory = random.choice(subcategories)
            difficulty = random.choice(DIFFICULTIES)
            
            # Create question document
            q = Question(
                title=title,
                category="Programming",  # Maps to "Technical" in frontend
                difficulty=difficulty,
                description=question_text,
                created_at=datetime.utcnow(),
            )
            
            q_dict = q.dict(by_alias=True, exclude_none=True)
            q_dict["programming_subcategory"] = subcategory
            if answer:
                q_dict["answer"] = answer
            
            batch.append(q_dict)
            count += 1
            
            # Insert batch when it reaches batch_size
            if len(batch) >= batch_size:
                try:
                    await questions_col.insert_many(batch, ordered=False)
                    elapsed = (datetime.utcnow() - start_time).total_seconds()
                    rate = count / elapsed if elapsed > 0 else 0
                    print(f"Inserted batch: {count:,} questions ({rate:.0f} questions/sec)")
                except Exception as e:
                    # Some duplicates might exist, continue
                    print(f"Batch insert warning (some may be duplicates): {e}")
                    # Try individual inserts for this batch
                    for item in batch:
                        try:
                            await questions_col.insert_one(item)
                        except:
                            pass  # Skip duplicates
                
                batch = []
        
        # Insert remaining batch
        if batch:
            try:
                await questions_col.insert_many(batch, ordered=False)
            except Exception as e:
                print(f"Final batch insert warning: {e}")
                # Try individual inserts
                for item in batch:
                    try:
                        await questions_col.insert_one(item)
                    except:
                        pass
        
    finally:
        if file_handle:
            file_handle.close()
    
    elapsed = (datetime.utcnow() - start_time).total_seconds()
    rate = count / elapsed if elapsed > 0 else 0
    print(f"\n{'='*60}")
    print(f"Import completed!")
    print(f"Total questions processed: {count:,}")
    print(f"Rows skipped (empty): {skipped:,}")
    print(f"Time elapsed: {elapsed:.2f} seconds")
    if count > 0:
        print(f"Import rate: {rate:.0f} questions/second")
    else:
        print(f"WARNING: No questions were imported!")
        print(f"Check CSV column names. Expected: 'Questions' and 'Answers'")
    print(f"{'='*60}")


async def main() -> None:
    db = get_database().db  # type: ignore[attr-defined]
    await import_newdata_questions(db, max_questions=100000)


if __name__ == "__main__":
    asyncio.run(main())

