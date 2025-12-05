"""
Import Python questions from python questions.csv.
Questions will be stored with category="Programming" (Technical in frontend),
and programming_subcategory="Python".
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
PYTHON_QUESTIONS_FILE = BASE_DIR.parent / "python questions.csv"  # In root directory

DIFFICULTIES = ["Easy", "Medium", "Hard"]


async def import_python_questions(db: AsyncIOMotorDatabase) -> None:
    """Import Python questions from CSV file."""
    if not PYTHON_QUESTIONS_FILE.exists():
        print(f"File not found: {PYTHON_QUESTIONS_FILE}")
        print(f"Looking for file at: {PYTHON_QUESTIONS_FILE.absolute()}")
        return

    questions_col = db["questions"]
    
    # Try different encodings
    encodings = ["utf-8-sig", "utf-8", "latin-1", "cp1252"]
    file_handle = None
    reader = None
    
    for encoding in encodings:
        try:
            file_handle = PYTHON_QUESTIONS_FILE.open("r", encoding=encoding, errors="replace")
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
    updated_count = 0
    batch_size = 5000  # Insert in batches of 5000 for speed
    batch: List[Dict[str, Any]] = []

    start_time = datetime.utcnow()
    
    try:
        print(f"Starting import...")
        print(f"CSV columns detected: {reader.fieldnames}")
        
        for row_num, row in enumerate(reader, start=1):
            # Get question from "Instruction" column (try multiple variations)
            question_text = (
                row.get("Instruction") or row.get("instruction") or 
                row.get("Question") or row.get("question") or 
                row.get("Questions") or row.get("questions") or ""
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
            
            # Randomly assign difficulty
            difficulty = random.choice(DIFFICULTIES)
            
            # Check if question already exists by title and category
            existing = await questions_col.find_one({
                "title": title,
                "category": "Programming",
                "programming_subcategory": "Python"
            })
            
            # Create question document
            q = Question(
                title=title,
                category="Programming",  # Maps to "Technical" in frontend
                difficulty=difficulty,
                description=question_text,
                created_at=datetime.utcnow(),
            )
            
            q_dict = q.dict(by_alias=True, exclude_none=True)
            q_dict["programming_subcategory"] = "Python"
            
            if existing:
                # Update existing question
                await questions_col.update_one(
                    {"_id": existing["_id"]},
                    {"$set": q_dict}
                )
                updated_count += 1
            else:
                # Add to batch for bulk insert
                batch.append(q_dict)
                
                # Insert batch when it reaches batch_size
                if len(batch) >= batch_size:
                    await questions_col.insert_many(batch)
                    print(f"Inserted batch of {len(batch)} questions (total: {count + len(batch)})")
                    batch = []
            
            count += 1
            
            # Progress indicator every 1000 questions
            if count % 1000 == 0:
                print(f"Processed {count} questions...")
    
    finally:
        # Insert remaining batch
        if batch:
            await questions_col.insert_many(batch)
            print(f"Inserted final batch of {len(batch)} questions")
        
        if file_handle:
            file_handle.close()
    
    elapsed = (datetime.utcnow() - start_time).total_seconds()
    print("=" * 60)
    print(f"Import completed!")
    print(f"Total questions processed: {count}")
    print(f"Questions inserted: {count - updated_count}")
    print(f"Questions updated: {updated_count}")
    print(f"Questions skipped: {skipped}")
    print(f"Time elapsed: {elapsed:.2f} seconds")
    print(f"Import rate: {count / elapsed if elapsed > 0 else 0:.0f} questions/second")
    print("=" * 60)


async def main():
    """Main entry point."""
    db = get_database().db  # type: ignore[attr-defined]
    await import_python_questions(db)


if __name__ == "__main__":
    asyncio.run(main())

