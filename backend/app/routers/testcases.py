from typing import Any, Dict, List, Optional

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from pydantic import BaseModel

from app.database import get_db
from app.deps import get_current_admin
from app.models import TestCase


router = APIRouter()


def _to_str_id(doc: Any) -> Any:
    if isinstance(doc, dict) and "_id" in doc:
        doc["id"] = str(doc["_id"])
        del doc["_id"]
    return doc


class TestCaseCreate(BaseModel):
    question_id: str
    input: str
    output: str
    is_hidden: bool = False


class TestCaseUpdate(BaseModel):
    input: Optional[str] = None
    output: Optional[str] = None
    is_hidden: Optional[bool] = None


@router.get("/testcases/{question_id}")
async def list_testcases_for_question(
    question_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    admin: dict = Depends(get_current_admin),
) -> List[Dict[str, Any]]:
    if not ObjectId.is_valid(question_id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid question id")

    cursor = db["test_cases"].find({"question_id": str(question_id)})
    items: List[Dict[str, Any]] = []
    async for doc in cursor:
        items.append(_to_str_id(doc))
    return items


@router.post("/testcases", status_code=status.HTTP_201_CREATED)
async def create_testcase(
    payload: TestCaseCreate,
    db: AsyncIOMotorDatabase = Depends(get_db),
    admin: dict = Depends(get_current_admin),
):
    if not ObjectId.is_valid(payload.question_id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid question id")

    tc = TestCase(
        question_id=payload.question_id,
        input=payload.input,
        output=payload.output,
        is_hidden=payload.is_hidden,
    )
    res = await db["test_cases"].insert_one(tc.dict(by_alias=True))
    created = await db["test_cases"].find_one({"_id": res.inserted_id})
    return _to_str_id(created)


@router.put("/testcases/{testcase_id}")
async def update_testcase(
    testcase_id: str,
    payload: TestCaseUpdate,
    db: AsyncIOMotorDatabase = Depends(get_db),
    admin: dict = Depends(get_current_admin),
):
    if not ObjectId.is_valid(testcase_id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid test case id")

    update_data = {k: v for k, v in payload.dict(exclude_unset=True).items()}
    if not update_data:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No fields to update")

    res = await db["test_cases"].update_one({"_id": ObjectId(testcase_id)}, {"$set": update_data})
    if res.matched_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Test case not found")

    doc = await db["test_cases"].find_one({"_id": ObjectId(testcase_id)})
    return _to_str_id(doc)


@router.delete("/testcases/{testcase_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_testcase(
    testcase_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    admin: dict = Depends(get_current_admin),
):
    if not ObjectId.is_valid(testcase_id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid test case id")

    await db["test_cases"].delete_one({"_id": ObjectId(testcase_id)})
    return None


