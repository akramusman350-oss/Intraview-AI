"""
Move Python questions from category="Programming" to category="Coding".
This will make them appear under "Programming" in the frontend instead of "Technical".
"""
import asyncio
from datetime import datetime

from app.database import get_database

BASE_DIR = __file__


async def move_python_questions():
    """Move Python questions from Programming to Coding category."""
    db = get_database().db  # type: ignore[attr-defined]
    questions_col = db["questions"]
    
    # Count questions before migration
    before_count = await questions_col.count_documents({
        "category": "Programming",
        "programming_subcategory": "Python"
    })
    print(f"Found {before_count} Python questions with category='Programming'")
    
    if before_count == 0:
        print("No questions to migrate.")
        return
    
    # Update all Python questions from Programming to Coding
    result = await questions_col.update_many(
        {
            "category": "Programming",
            "programming_subcategory": "Python"
        },
        {
            "$set": {
                "category": "Coding"
            }
        }
    )
    
    print(f"Updated {result.modified_count} questions")
    
    # Verify the update
    after_count = await questions_col.count_documents({
        "category": "Coding",
        "programming_subcategory": "Python"
    })
    print(f"Verified: {after_count} Python questions now have category='Coding'")
    
    # Check if any remain in Programming
    remaining = await questions_col.count_documents({
        "category": "Programming",
        "programming_subcategory": "Python"
    })
    print(f"Remaining in Programming: {remaining}")
    
    if remaining == 0 and after_count == before_count:
        print("\n✅ Migration successful! All Python questions moved to Coding category.")
    else:
        print(f"\n⚠️  Warning: Count mismatch. Before: {before_count}, After: {after_count}, Remaining: {remaining}")


async def main():
    """Main entry point."""
    await move_python_questions()


if __name__ == "__main__":
    asyncio.run(main())

