"""Check if a user exists in the database."""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

async def check_user(email: str):
    client = AsyncIOMotorClient('mongodb://localhost:27017')
    db = client['intraview_ai']
    
    email_lower = email.lower().strip()
    user = await db['users'].find_one({'email': email_lower})
    
    if user:
        print(f'✅ User found!')
        print(f'   Email: {user.get("email")}')
        print(f'   Role: {user.get("role")}')
        print(f'   Status: {user.get("status")}')
        print(f'   Created: {user.get("created_at")}')
        print(f'   ID: {user.get("_id")}')
        if user.get("profile_info"):
            print(f'   Name: {user.get("profile_info", {}).get("name", "N/A")}')
    else:
        print(f'❌ User not found for email: {email_lower}')
        # Check all users with similar email
        similar = await db['users'].find({'email': {'$regex': email_lower.split('@')[0], '$options': 'i'}}).to_list(length=5)
        if similar:
            print(f'\n   Found {len(similar)} similar emails:')
            for u in similar:
                print(f'   - {u.get("email")} (role: {u.get("role")})')
    
    # Count total candidates
    candidate_count = await db['users'].count_documents({'role': 'candidate'})
    print(f'\n📊 Total candidates in database: {candidate_count}')
    
    client.close()

if __name__ == '__main__':
    import sys
    email = sys.argv[1] if len(sys.argv) > 1 else 'anadeem6301@gmail.com'
    asyncio.run(check_user(email))

