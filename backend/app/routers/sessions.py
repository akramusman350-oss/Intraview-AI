from datetime import datetime
from typing import Any, Dict, List, Optional

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, Query, status
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.database import get_db
from app.deps import get_current_admin


router = APIRouter()


def _to_str_id(doc: Any) -> Any:
    if isinstance(doc, dict):
        # Convert _id to id
        if "_id" in doc:
            doc["id"] = str(doc["_id"])
            del doc["_id"]
        # Convert all ObjectId fields to strings
        for key, value in list(doc.items()):
            if isinstance(value, ObjectId):
                doc[key] = str(value)
    return doc


@router.get("/admin/sessions/live")
async def get_live_sessions(
    db: AsyncIOMotorDatabase = Depends(get_db),
    admin: dict = Depends(get_current_admin),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=50),
):
    """Get active/live interview sessions."""
    try:
        skip = (page - 1) * limit
        query = {"status": "active"}
        
        total = await db["sessions"].count_documents(query)
        print(f"[Sessions API] Live sessions query: {query}, total: {total}, page: {page}, limit: {limit}")
        cursor = db["sessions"].find(query).sort("created_at", -1).skip(skip).limit(limit)
        
        items: List[Dict[str, Any]] = []
        async for doc in cursor:
            try:
                print(f"[Sessions API] Processing live session: {doc.get('_id')}, candidate: {doc.get('candidate_name')}")
                
                # Handle created_at
                created_at = doc.get("created_at")
                if not created_at:
                    created_at = datetime.utcnow()
                
                # Calculate duration
                try:
                    if isinstance(created_at, datetime):
                        duration_seconds = int((datetime.utcnow() - created_at).total_seconds())
                    else:
                        # If it's a string or other type, use a default
                        duration_seconds = 0
                    minutes = duration_seconds // 60
                    seconds = duration_seconds % 60
                    duration_str = f"{minutes}:{seconds:02d}"
                except (TypeError, AttributeError) as e:
                    print(f"[Sessions API] Error calculating duration: {e}")
                    duration_str = "0:00"
                
                # Calculate progress
                current_q = doc.get("current_question", 1)
                total_q = doc.get("total_questions", 10)
                progress = int((current_q / total_q) * 100) if total_q > 0 else 0
                
                # Format start time (Windows-compatible)
                try:
                    if isinstance(created_at, datetime) and hasattr(created_at, "strftime"):
                        try:
                            start_time = created_at.strftime("%-I:%M %p")
                        except ValueError:
                            start_time = created_at.strftime("%I:%M %p").lstrip("0")
                    else:
                        start_time = "N/A"
                except Exception as e:
                    print(f"[Sessions API] Error formatting start time: {e}")
                    start_time = "N/A"
                
                doc = _to_str_id(doc)
                doc["duration"] = duration_str
                doc["progress"] = progress
                doc["start_time"] = start_time
                doc["question"] = f"Question {current_q}/{total_q}" if doc.get("interview_type") != "Coding" else "Running tests"
                
                items.append(doc)
            except Exception as e:
                print(f"[Sessions API] Error processing live session {doc.get('_id')}: {e}")
                import traceback
                traceback.print_exc()
                continue
    
        print(f"[Sessions API] Returning {len(items)} live sessions")
        
        return {"items": items, "total": total, "page": page, "limit": limit}
    except Exception as e:
        print(f"[Sessions API] Error in get_live_sessions: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error fetching live sessions: {str(e)}")


@router.get("/admin/sessions/history")
async def get_session_history(
    db: AsyncIOMotorDatabase = Depends(get_db),
    admin: dict = Depends(get_current_admin),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=50),
):
    """Get completed/cancelled interview sessions."""
    try:
        skip = (page - 1) * limit
        query = {"status": {"$in": ["completed", "cancelled"]}}
        
        total = await db["sessions"].count_documents(query)
        print(f"[Sessions API] History query: {query}, total: {total}, page: {page}, limit: {limit}")
        cursor = db["sessions"].find(query).sort("created_at", -1).skip(skip).limit(limit)
        
        items: List[Dict[str, Any]] = []
        async for doc in cursor:
            try:
                print(f"[Sessions API] Processing history session: {doc.get('_id')}, candidate: {doc.get('candidate_name')}")
                
                # Handle created_at
                created_at = doc.get("created_at")
                if not created_at:
                    created_at = datetime.utcnow()
                
                # Format date (Windows-compatible)
                try:
                    if isinstance(created_at, datetime) and hasattr(created_at, "strftime"):
                        try:
                            date_str = created_at.strftime("%b %d, %-I%p")
                        except ValueError:
                            hour = created_at.strftime("%I").lstrip("0")
                            date_str = created_at.strftime(f"%b %d, {hour}%p")
                    else:
                        date_str = "N/A"
                except Exception as e:
                    print(f"[Sessions API] Error formatting date: {e}")
                    date_str = "N/A"
                
                # Get duration
                duration_min = doc.get("duration_minutes", 0)
                duration_str = f"{duration_min} min" if duration_min > 0 else "N/A"
                
                # Get score
                scores = doc.get("scores", {})
                score = scores.get("overall", 0)
                score_str = f"{int(score)}%" if score > 0 else "N/A"
                
                doc = _to_str_id(doc)
                doc["date"] = date_str
                doc["duration"] = duration_str
                doc["score"] = score_str
                
                items.append(doc)
            except Exception as e:
                print(f"[Sessions API] Error processing history session {doc.get('_id')}: {e}")
                import traceback
                traceback.print_exc()
                continue
    
        print(f"[Sessions API] Returning {len(items)} history sessions")
        
        return {"items": items, "total": total, "page": page, "limit": limit}
    except Exception as e:
        print(f"[Sessions API] Error in get_session_history: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error fetching session history: {str(e)}")

