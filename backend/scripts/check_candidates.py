import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

async def check():
    client = AsyncIOMotorClient('mongodb://localhost:27017')
    db = client['intraview_ai']
    
    candidates = await db['users'].find({'role': 'candidate'}).to_list(length=10)
    print(f'Found {len(candidates)} candidates:')
    for c in candidates:
        name = c.get('profile_info', {}).get('name', 'N/A')
        email = c.get('email', 'N/A')
        _id = c.get('_id')
        print(f'  - {name} ({email}) - id: {_id}')
    
    client.close()

if __name__ == '__main__':
    asyncio.run(check())

