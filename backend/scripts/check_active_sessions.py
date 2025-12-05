"""Check and optionally clear active sessions."""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

async def check_and_clear():
    client = AsyncIOMotorClient('mongodb://localhost:27017')
    db = client['intraview_ai']
    
    count = await db['sessions'].count_documents({'status': 'active'})
    print(f'Active sessions: {count}')
    
    if count > 0:
        # Show a few examples
        samples = await db['sessions'].find({'status': 'active'}).limit(3).to_list(length=3)
        print(f'\nSample active sessions:')
        for s in samples:
            print(f"  ID: {s.get('_id')}, Candidate: {s.get('candidate_name', 'N/A')}, Created: {s.get('created_at')}")
        
        # Clear all active sessions older than 1 hour
        from datetime import datetime, timedelta
        one_hour_ago = datetime.utcnow() - timedelta(hours=1)
        result = await db['sessions'].update_many(
            {
                'status': 'active',
                'created_at': {'$lt': one_hour_ago}
            },
            {'$set': {'status': 'completed'}}
        )
        print(f'\nCleared {result.modified_count} old active sessions (older than 1 hour)')
    
    client.close()

if __name__ == '__main__':
    asyncio.run(check_and_clear())

