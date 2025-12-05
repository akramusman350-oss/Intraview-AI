from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, EmailStr, Field


class PyObjectId(str):
    """
    Lightweight ObjectId-compatible type for Pydantic models.

    We keep it as a string in the API surface but document that it maps to
    MongoDB ObjectId under the hood.
    """

    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v: Any) -> "PyObjectId":
        if isinstance(v, cls):
            return v
        return cls(str(v))


class User(BaseModel):
    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    email: EmailStr
    password_hash: str
    role: str = "candidate"
    created_at: datetime = Field(default_factory=datetime.utcnow)
    profile_info: Dict[str, Any] = Field(default_factory=dict)
    status: str = "active"

    class Config:
        allow_population_by_field_name = True
        json_encoders = {PyObjectId: str, datetime: lambda v: v.isoformat()}


class Question(BaseModel):
    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    title: str
    category: str  # Coding / Behavioral / System Design
    difficulty: str = "Medium"
    description: str
    topics: Optional[List[str]] = None
    examples: Optional[List[Dict[str, Any]]] = None
    constraints: Optional[List[str]] = None
    hints: Optional[List[str]] = None
    code_snippets: Optional[Dict[str, str]] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        allow_population_by_field_name = True
        json_encoders = {PyObjectId: str, datetime: lambda v: v.isoformat()}


class TestCase(BaseModel):
    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    question_id: PyObjectId
    input: str
    output: str
    is_hidden: bool = False

    class Config:
        allow_population_by_field_name = True
        json_encoders = {PyObjectId: str}


class Rubric(BaseModel):
    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    category: str
    criteria: List[str]
    weights: List[float]

    class Config:
        allow_population_by_field_name = True
        json_encoders = {PyObjectId: str}


class Session(BaseModel):
    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    candidate_id: PyObjectId
    status: str
    scores: Dict[str, float] = Field(default_factory=dict)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        allow_population_by_field_name = True
        json_encoders = {PyObjectId: str, datetime: lambda v: v.isoformat()}


class ActivityLog(BaseModel):
    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    action: str
    admin_email: EmailStr
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    metadata: Dict[str, Any] = Field(default_factory=dict)

    class Config:
        allow_population_by_field_name = True
        json_encoders = {PyObjectId: str, datetime: lambda v: v.isoformat()}


class InvitedCandidate(BaseModel):
    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    email: EmailStr
    name: str
    invited_by: EmailStr  # Admin email who sent the invitation
    invited_at: datetime = Field(default_factory=datetime.utcnow)
    status: str = "pending"  # pending, accepted, expired
    invitation_token: Optional[str] = None

    class Config:
        allow_population_by_field_name = True
        json_encoders = {PyObjectId: str, datetime: lambda v: v.isoformat()}


