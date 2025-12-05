"""
Import questions from newcode.csv.
Questions will be stored with category="Coding" (Programming in frontend),
with randomly assigned subcategories and difficulty levels.
Uses bulk insert for fast performance.
"""
import asyncio
import csv
import random
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Any

from app.database import get_database
from app.models import Question

BASE_DIR = Path(__file__).resolve().parents[1]
NEWCODE_FILE = BASE_DIR.parent / "newcode.csv"  # In root directory

# Common programming subcategories for Coding category
CODING_SUBCATEGORIES = [
    "Algorithms",
    "Data Structures",
    "Object-Oriented Programming",
    "System Design",
    "Web Development",
    "Mobile Development",
    "Database Management",
    "Cloud Computing",
    "Machine Learning",
    "Artificial Intelligence",
    "Cybersecurity",
    "Networking",
    "Operating Systems",
    "Software Testing",
    "DevOps",
    "Front-end",
    "Back-end",
    "Data Engineering",
    "Game Development",
    "Embedded Systems",
    "Python",
    "Java",
    "JavaScript",
    "C++",
    "C#",
]

DIFFICULTIES = ["Easy", "Medium", "Hard"]


async def get_existing_subcategories(db) -> List[str]:
    """Get existing subcategories from database, or use defaults."""
    try:
        pipeline = [
            {"$match": {"category": "Coding", "programming_subcategory": {"$exists": True, "$ne": None}}},
            {"$group": {"_id": "$programming_subcategory"}},
            {"$sort": {"_id": 1}},
        ]
        cursor = db["questions"].aggregate(pipeline)
        subcategories = []
        async for doc in cursor:
            subcategories.append(doc["_id"])
        return subcategories if subcategories else CODING_SUBCATEGORIES
    except Exception as e:
        print(f"Error fetching subcategories: {e}")
        return CODING_SUBCATEGORIES


async def import_newcode_questions(db) -> None:
    """Import questions from newcode.csv."""
    if not NEWCODE_FILE.exists():
        print(f"File not found: {NEWCODE_FILE}")
        print(f"Looking for file at: {NEWCODE_FILE.absolute()}")
        return

    questions_col = db["questions"]
    
    # Get subcategories
    subcategories = await get_existing_subcategories(db)
    print(f"Using {len(subcategories)} subcategories")
    
    # Try different encodings
    encodings = ["utf-8-sig", "utf-8", "latin-1", "cp1252"]
    file_handle = None
    reader = None
    
    for encoding in encodings:
        try:
            file_handle = NEWCODE_FILE.open("r", encoding=encoding, errors="replace")
            reader = csv.DictReader(file_handle)
            # Test read first row
            test_row = next(reader)
            file_handle.seek(0)
            reader = csv.DictReader(file_handle)
            print(f"Successfully opened CSV with encoding: {encoding}")
            print(f"CSV columns detected: {reader.fieldnames}")
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
        print(f"Starting import...")
        
        for row_num, row in enumerate(reader, start=1):
            # Get Problem name (title) and Problem statement (description)
            # Try multiple column name variations
            title = (
                row.get("Problem name") or row.get("problem name") or 
                row.get("Problem Name") or row.get("Problem_name") or
                row.get("problem_name") or row.get("Title") or row.get("title") or ""
            ).strip()
            
            description = (
                row.get("Problem statement") or row.get("problem statement") or
                row.get("Problem Statement") or row.get("Problem_statement") or
                row.get("problem_statement") or row.get("Description") or 
                row.get("description") or ""
            ).strip()
            
            if not title:
                skipped += 1
                if skipped <= 5:
                    print(f"Row {row_num}: Skipping - no title found")
                continue
            
            # Use description if available, otherwise use title
            if not description:
                description = title
            
            # Show first few rows for debugging
            if count < 3:
                print(f"Row {row_num}: Title: {title[:50]}...")
            
            # Create title (first 80 chars or full if shorter)
            title_short = title[:80] if len(title) > 80 else title
            
            # Randomly assign subcategory and difficulty
            subcategory = random.choice(subcategories)
            difficulty = random.choice(DIFFICULTIES)
            
            # Check if question already exists by title
            existing = await questions_col.find_one({
                "title": title_short,
                "category": "Coding"
            })
            
            if existing:
                # Skip duplicates
                skipped += 1
                continue
            
            # Create question document
            q = Question(
                title=title_short,
                category="Coding",  # Maps to "Programming" in frontend
                difficulty=difficulty,
                description=description,
                created_at=datetime.utcnow(),
            )
            
            q_dict = q.dict(by_alias=True, exclude_none=True)
            q_dict["programming_subcategory"] = subcategory
            
            # Add to batch for bulk insert
            batch.append(q_dict)
            
            # Insert batch when it reaches batch_size
            if len(batch) >= batch_size:
                try:
                    await questions_col.insert_many(batch, ordered=False)
                    elapsed = (datetime.utcnow() - start_time).total_seconds()
                    rate = count / elapsed if elapsed > 0 else 0
                    print(f"Inserted batch: {count + len(batch):,} questions ({rate:.0f} questions/sec)")
                except Exception as e:
                    # Some duplicates might exist, continue with individual inserts
                    print(f"Batch insert warning: {e}")
                    for item in batch:
                        try:
                            await questions_col.insert_one(item)
                        except:
                            pass  # Skip duplicates
                
                batch = []
            
            count += 1
            
            # Progress indicator every 1000 questions
            if count % 1000 == 0:
                elapsed = (datetime.utcnow() - start_time).total_seconds()
                rate = count / elapsed if elapsed > 0 else 0
                print(f"Processed {count:,} questions ({rate:.0f} questions/sec)...")
    
    finally:
        # Insert remaining batch
        if batch:
            try:
                await questions_col.insert_many(batch, ordered=False)
                print(f"Inserted final batch of {len(batch)} questions")
            except Exception as e:
                print(f"Final batch insert warning: {e}")
                # Try individual inserts
                for item in batch:
                    try:
                        await questions_col.insert_one(item)
                    except:
                        pass
        
        if file_handle:
            file_handle.close()
    
    elapsed = (datetime.utcnow() - start_time).total_seconds()
    print("=" * 60)
    print(f"Import completed!")
    print(f"Total questions processed: {count}")
    print(f"Questions inserted: {count}")
    print(f"Questions skipped: {skipped}")
    print(f"Time elapsed: {elapsed:.2f} seconds")
    print(f"Import rate: {count / elapsed if elapsed > 0 else 0:.0f} questions/second")
    print("=" * 60)


async def main():
    """Main entry point."""
    db = get_database().db  # type: ignore[attr-defined]
    await import_newcode_questions(db)


if __name__ == "__main__":
    asyncio.run(main())

