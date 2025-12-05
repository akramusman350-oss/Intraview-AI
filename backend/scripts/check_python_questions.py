"""
Check if Python questions are in the database.
"""
import asyncio
from pathlib import Path

from app.database import get_database

BASE_DIR = Path(__file__).resolve().parents[1]


async def check_python_questions():
    """Check Python questions in database."""
    db = get_database().db  # type: ignore[attr-defined]
    questions_col = db["questions"]
    
    # Count total questions
    total = await questions_col.count_documents({})
    print(f"Total questions in database: {total}")
    
    # Count Programming category questions
    programming_count = await questions_col.count_documents({"category": "Programming"})
    print(f"Questions with category='Programming': {programming_count}")
    
    # Count Python subcategory questions
    python_count = await questions_col.count_documents({"programming_subcategory": "Python"})
    print(f"Questions with programming_subcategory='Python': {python_count}")
    
    # Count Programming + Python combination
    python_programming_count = await questions_col.count_documents({
        "category": "Programming",
        "programming_subcategory": "Python"
    })
    print(f"Questions with category='Programming' AND programming_subcategory='Python': {python_programming_count}")
    
    # Show a few sample questions
    print("\nSample Python questions:")
    cursor = questions_col.find({
        "category": "Programming",
        "programming_subcategory": "Python"
    }).limit(5)
    
    count = 0
    async for doc in cursor:
        count += 1
        print(f"\n{count}. Title: {doc.get('title', 'N/A')[:60]}")
        print(f"   Category: {doc.get('category')}")
        print(f"   Subcategory: {doc.get('programming_subcategory')}")
        print(f"   Difficulty: {doc.get('difficulty')}")
    
    # Check category distribution
    print("\n\nCategory distribution:")
    pipeline = [
        {"$group": {"_id": "$category", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}}
    ]
    async for doc in questions_col.aggregate(pipeline):
        print(f"  {doc['_id']}: {doc['count']}")
    
    # Check subcategory distribution for Programming category
    print("\n\nProgramming subcategory distribution:")
    pipeline = [
        {"$match": {"category": "Programming"}},
        {"$group": {"_id": "$programming_subcategory", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}}
    ]
    async for doc in questions_col.aggregate(pipeline):
        print(f"  {doc.get('_id', 'None')}: {doc['count']}")


async def main():
    """Main entry point."""
    await check_python_questions()


if __name__ == "__main__":
    asyncio.run(main())

