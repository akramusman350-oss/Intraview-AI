import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

async def check():
    client = AsyncIOMotorClient('mongodb://localhost:27017')
    db = client['intraview_ai']
    
    live = await db['sessions'].count_documents({'status': 'active'})
    history = await db['sessions'].count_documents({'status': {'$in': ['completed', 'cancelled']}})
    
    print(f'Live sessions: {live}')
    print(f'History sessions: {history}')
    
    if live > 0:
        sample = await db['sessions'].find_one({'status': 'active'})
        print(f'\nSample live session:')
        print(f'  ID: {sample.get("_id")}')
        print(f'  Candidate name: {sample.get("candidate_name")}')
        print(f'  Interview type: {sample.get("interview_type")}')
        print(f'  Created at: {sample.get("created_at")}')
    
    if history > 0:
        sample = await db['sessions'].find_one({'status': {'$in': ['completed', 'cancelled']}})
        print(f'\nSample history session:')
        print(f'  ID: {sample.get("_id")}')
        print(f'  Candidate name: {sample.get("candidate_name")}')
        print(f'  Status: {sample.get("status")}')
        print(f'  Created at: {sample.get("created_at")}')
    
    client.close()

if __name__ == '__main__':
    asyncio.run(check())

