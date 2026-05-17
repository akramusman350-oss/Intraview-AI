import pymongo
from bson import json_util
import json

def dump_data():
    client = pymongo.MongoClient("mongodb://localhost:27017/")
    db = client["intraview_ai"]
    
    export_data = {}
    collections_to_dump = [
        "users", 
        "interview_sessions", 
        "coding_problems", 
        "test_cases", 
        "cv_uploads", 
        "activity_logs",
        "password_reset_otps"
    ]
    
    for col in collections_to_dump:
        documents = list(db[col].find({}))
        export_data[col] = documents
        print(f"Dumped {len(documents)} documents from '{col}'")
        
    with open("db_export.json", "w", encoding="utf-8") as f:
        # Use json_util to correctly preserve MongoDB ObjectIds and DateTimes
        f.write(json_util.dumps(export_data, indent=2))
    
    print("\nDatabase export completed! Saved to 'db_export.json'")

if __name__ == "__main__":
    dump_data()
