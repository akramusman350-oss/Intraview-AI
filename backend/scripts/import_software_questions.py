"""
Import Software Questions from CSV file.
Questions will be stored with category="Programming" and subcategory from the CSV Category column.
"""
import asyncio
import csv
from datetime import datetime
from pathlib import Path

from motor.motor_asyncio import AsyncIOMotorDatabase

from app.database import get_database
from app.models import Question

BASE_DIR = Path(__file__).resolve().parents[1]
SOFTWARE_QUESTIONS_FILE = BASE_DIR / "data" / "Software Questions.csv"


async def import_software_questions(db: AsyncIOMotorDatabase) -> None:
    if not SOFTWARE_QUESTIONS_FILE.exists():
        print(f"File not found: {SOFTWARE_QUESTIONS_FILE}")
        return

    questions_col = db["questions"]
    
    # Get unique categories from the CSV for reference
    categories = set()
    
    count = 0
    updated_count = 0
    
    # Try different encodings
    encodings = ["utf-8-sig", "utf-8", "latin-1", "cp1252"]
    file_handle = None
    reader = None
    
    for encoding in encodings:
        try:
            file_handle = SOFTWARE_QUESTIONS_FILE.open("r", encoding=encoding, errors="replace")
            reader = csv.DictReader(file_handle)
            # Test read first row to verify encoding works
            test_row = next(reader)
            file_handle.seek(0)  # Reset to beginning
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
    
    try:
        for row in reader:
            question_text = row.get("Question", "").strip()
            answer = row.get("Answer", "").strip()
            subcategory = row.get("Category", "").strip()
            difficulty = row.get("Difficulty", "Medium").strip()
            
            if not question_text:
                continue
            
            categories.add(subcategory)
            
            # Check if question already exists by title and category
            existing = await questions_col.find_one({
                "title": question_text[:80],
                "category": "Programming"
            })
            
            # Create question with category="Programming" and subcategory stored separately
            q = Question(
                title=question_text[:80] if len(question_text) > 80 else question_text,
                category="Programming",
                difficulty=difficulty,
                description=question_text,
                created_at=datetime.utcnow(),
            )
            
            # Store subcategory in a custom field
            q_dict = q.dict(by_alias=True, exclude_none=True)
            q_dict["programming_subcategory"] = subcategory
            if answer:
                q_dict["answer"] = answer
            
            if existing:
                # Update existing question
                await questions_col.update_one(
                    {"_id": existing["_id"]},
                    {"$set": q_dict}
                )
                updated_count += 1
            else:
                # Insert new question
                await questions_col.insert_one(q_dict)
            
            count += 1
    finally:
        if file_handle:
            file_handle.close()
    
    print(f"Processed {count} software questions ({count - updated_count} inserted, {updated_count} updated)")
    print(f"Found {len(categories)} unique subcategories: {sorted(categories)}")


async def main() -> None:
    db = get_database().db  # type: ignore[attr-defined]
    await import_software_questions(db)


if __name__ == "__main__":
    asyncio.run(main())

