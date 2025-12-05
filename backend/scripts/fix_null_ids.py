import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId

async def fix():
    client = AsyncIOMotorClient('mongodb://localhost:27017')
    db = client['intraview_ai']
    
    # Find all users with _id: None
    users_with_null_id = await db['users'].find({'_id': None}).to_list(length=100)
    print(f'Found {len(users_with_null_id)} users with _id: None')
    
    for user in users_with_null_id:
        email = user.get('email', 'unknown')
        print(f'Fixing user: {email}')
        
        # Remove the old document with _id: None
        await db['users'].delete_one({'_id': None, 'email': email})
        
        # Create a new document with a proper _id
        user['_id'] = ObjectId()
        await db['users'].insert_one(user)
        print(f'  -> Created new document with _id: {user["_id"]}')
    
    # Also check for any other documents with _id: None in other collections
    collections = ['questions', 'testcases', 'sessions', 'activity_logs', 'invited_candidates']
    for coll_name in collections:
        count = await db[coll_name].count_documents({'_id': None})
        if count > 0:
            print(f'Found {count} documents with _id: None in {coll_name}, deleting...')
            await db[coll_name].delete_many({'_id': None})
    
    client.close()
    print('Done!')

if __name__ == '__main__':
    asyncio.run(fix())

