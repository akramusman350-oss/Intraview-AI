from typing import Annotated

from bson import ObjectId
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from motor.motor_asyncio import AsyncIOMotorDatabase

from .core.security import decode_access_token
from .database import get_db


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


async def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)],
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    print(f"[AUTH] Received token: {token[:20]}...")
    payload = decode_access_token(token)
    if not payload:
        print("[AUTH] Failed to decode token")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid authentication credentials")

    user_id = payload.get("sub")
    if not user_id:
        print(f"[AUTH] No user_id in payload: {payload}")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid authentication credentials")

    print(f"[AUTH] User ID from token: {user_id}")
    filter_id = ObjectId(user_id) if ObjectId.is_valid(user_id) else user_id
    user = await db["users"].find_one({"_id": filter_id})
    if not user:
        print(f"[AUTH] User not found in database: {user_id}")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

    print(f"[AUTH] User found: email={user.get('email')}, role={user.get('role')}")
    return user


async def get_current_admin(user=Depends(get_current_user)):
    user_role = user.get("role")
    print(f"[AUTH] Checking admin access: role={user_role}")
    if user_role != "admin":
        print(f"[AUTH] Access denied: user role is '{user_role}', expected 'admin'")
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    print(f"[AUTH] Admin access granted: {user.get('email')}")
    return user


