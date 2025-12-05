"""
Update existing coding questions with full data from merged_problems.json
This script processes the JSON file using streaming to avoid memory issues.
"""
import asyncio
import ijson
from pathlib import Path

from app.database import get_database


BASE_DIR = Path(__file__).resolve().parents[1]
RAW_DATA_DIR = BASE_DIR / "data" / "raw"
CODING_FILE = RAW_DATA_DIR / "merged_problems.json"


async def update_questions():
    """Update existing questions with full data from JSON file."""
    db = get_database().db
    questions_col = db["questions"]
    
    if not CODING_FILE.exists():
        print(f"File not found: {CODING_FILE}")
        return
    
    print("Processing JSON file using streaming (this may take a while)...")
    
    updated = 0
    not_found = 0
    processed = 0
    
    # Stream parse the JSON file
    with CODING_FILE.open("rb") as f:
        # Parse the "questions" array items
        parser = ijson.items(f, "questions.item")
        
        for problem in parser:
            processed += 1
            if processed % 100 == 0:
                print(f"Processed {processed} problems... (Updated: {updated}, Not found: {not_found})")
            
            title = problem.get("title") or problem.get("name") or "Untitled Coding Problem"
            
            # Find existing question by title
            existing = await questions_col.find_one({"title": title, "category": "Coding"})
            
            if not existing:
                not_found += 1
                continue
            
            # Prepare update data
            update_data = {}
            
            if "description" in problem or "content" in problem or "problem_statement" in problem:
                desc = problem.get("description") or problem.get("content") or problem.get("problem_statement") or ""
                if desc:
                    update_data["description"] = str(desc)
            
            if "difficulty" in problem or "level" in problem:
                diff = problem.get("difficulty") or problem.get("level")
                if diff:
                    update_data["difficulty"] = str(diff)
            
            if "topics" in problem or "tags" in problem:
                topics = problem.get("topics") or problem.get("tags")
                if topics:
                    update_data["topics"] = topics
            
            if "examples" in problem:
                examples = problem.get("examples")
                if examples:
                    update_data["examples"] = examples
            
            if "constraints" in problem:
                constraints = problem.get("constraints")
                if constraints:
                    update_data["constraints"] = constraints
            
            if "hints" in problem:
                hints = problem.get("hints")
                if hints:
                    update_data["hints"] = hints
            
            if "code_snippets" in problem:
                code_snippets = problem.get("code_snippets")
                if code_snippets:
                    update_data["code_snippets"] = code_snippets
            
            # Update if we have any data
            if update_data:
                await questions_col.update_one(
                    {"_id": existing["_id"]},
                    {"$set": update_data}
                )
                updated += 1
    
    print(f"\nUpdate complete!")
    print(f"  - Updated: {updated} questions")
    print(f"  - Not found in DB: {not_found} questions")
    print(f"  - Total processed: {processed} problems")


if __name__ == "__main__":
    asyncio.run(update_questions())

