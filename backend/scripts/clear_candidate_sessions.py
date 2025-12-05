"""Clear all sessions for a specific candidate."""
import asyncio
import sys
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId

async def clear_sessions(email: str = None, user_id: str = None):
    client = AsyncIOMotorClient('mongodb://localhost:27017')
    db = client['intraview_ai']
    
    if email:
        # Find user by email
        user = await db['users'].find_one({'email': email.lower()})
        if not user:
            print(f"❌ User with email {email} not found")
            client.close()
            return
        user_id = user['_id']
        print(f"✅ Found user: {email}, ID: {user_id}")
    elif user_id:
        if not ObjectId.is_valid(user_id):
            print(f"❌ Invalid user_id: {user_id}")
            client.close()
            return
        user_id = ObjectId(user_id)
    else:
        print("❌ Please provide either email or user_id")
        client.close()
        return
    
    # Count sessions before deletion
    all_sessions = await db['sessions'].count_documents({
        "$or": [
            {"candidate_id": user_id},
            {"candidate_id": str(user_id)}
        ]
    })
    
    active_sessions = await db['sessions'].count_documents({
        "$or": [
            {"candidate_id": user_id},
            {"candidate_id": str(user_id)}
        ],
        "status": "active"
    })
    
    completed_sessions = await db['sessions'].count_documents({
        "$or": [
            {"candidate_id": user_id},
            {"candidate_id": str(user_id)}
        ],
        "status": "completed"
    })
    
    print(f"\n📊 Sessions found:")
    print(f"   Total: {all_sessions}")
    print(f"   Active: {active_sessions}")
    print(f"   Completed: {completed_sessions}")
    
    if all_sessions == 0:
        print("\n✅ No sessions to clear")
        client.close()
        return
    
    # Delete all sessions for this candidate
    result = await db['sessions'].delete_many({
        "$or": [
            {"candidate_id": user_id},
            {"candidate_id": str(user_id)}
        ]
    })
    
    print(f"\n✅ Deleted {result.deleted_count} sessions")
    
    # Verify deletion
    remaining = await db['sessions'].count_documents({
        "$or": [
            {"candidate_id": user_id},
            {"candidate_id": str(user_id)}
        ]
    })
    
    if remaining == 0:
        print("✅ All sessions cleared successfully!")
    else:
        print(f"⚠️  Warning: {remaining} sessions still remain")
    
    client.close()

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python -m scripts.clear_candidate_sessions <email>")
        print("   or: python -m scripts.clear_candidate_sessions --user-id <user_id>")
        sys.exit(1)
    
    if sys.argv[1] == '--user-id' and len(sys.argv) > 2:
        asyncio.run(clear_sessions(user_id=sys.argv[2]))
    else:
        asyncio.run(clear_sessions(email=sys.argv[1]))

