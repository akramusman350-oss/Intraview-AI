import pymongo
from bson import json_util
import json
import os

def restore_data():
    if not os.path.exists("db_export.json"):
        print("Error: 'db_export.json' not found!")
        return
        
    client = pymongo.MongoClient("mongodb://localhost:27017/")
    db = client["intraview_ai"]
    
    with open("db_export.json", "r", encoding="utf-8") as f:
        export_data = json_util.loads(f.read())
        
    print("Starting restoration of database...")
    for col_name, documents in export_data.items():
        if not documents:
            print(f" - Collection '{col_name}': 0 documents to restore")
            continue
            
        # Clear existing documents to avoid duplicates
        db[col_name].delete_many({})
        
        # Insert exported documents
        res = db[col_name].insert_many(documents)
        print(f" + Collection '{col_name}': Successfully restored {len(res.inserted_ids)} documents")
        
    print("\nDatabase restoration successfully completed!")

if __name__ == "__main__":
    restore_data()
