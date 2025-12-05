"""Check candidate sessions."""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

async def check():
    client = AsyncIOMotorClient('mongodb://localhost:27017')
    db = client['intraview_ai']
    
    candidates = [
        'abdullahnadeem66500@gmail.com',
        'akramusmanecv@gmail.com',
        'mtalha@ciitwah.edu.pk',
        'akramusman350@gmail.com'
    ]
    
    for email in candidates:
        user = await db['users'].find_one({'email': email.lower()})
        if user:
            user_id = user['_id']
            # Count completed sessions
            completed_sessions = await db['sessions'].find({
                'candidate_id': user_id,
                'status': 'completed'
            }).to_list(length=100)
            
            # Count all sessions
            all_sessions = await db['sessions'].find({
                'candidate_id': user_id
            }).to_list(length=100)
            
            print(f'\n{email}:')
            print(f'  User ID: {user_id}')
            print(f'  All sessions: {len(all_sessions)}')
            print(f'  Completed sessions: {len(completed_sessions)}')
            
            if completed_sessions:
                scores = [s.get('scores', {}).get('overall') for s in completed_sessions if s.get('scores', {}).get('overall') is not None]
                if scores:
                    avg = sum(scores) / len(scores)
                    print(f'  Avg score: {avg:.1f}%')
                else:
                    print(f'  Avg score: N/A (no scores)')
        else:
            print(f'\n{email}: User not found')
    
    client.close()

if __name__ == '__main__':
    asyncio.run(check())

