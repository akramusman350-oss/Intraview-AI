from datetime import datetime
from typing import Any, Dict, List, Optional
import secrets
import os
import shutil
import re
from pathlib import Path

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from motor.motor_asyncio import AsyncIOMotorDatabase
from pydantic import BaseModel, EmailStr

from app.database import get_db
from app.deps import get_current_admin, get_current_user
from app.models import ActivityLog, InvitedCandidate
from app.core.email_service import send_invitation_email
from app.core.security import get_password_hash


router = APIRouter()


class UserUpdate(BaseModel):
    profile_info: Optional[Dict[str, Any]] = None
    status: Optional[str] = None
    password: Optional[str] = None
    email: Optional[EmailStr] = None


class PasswordChangeRequest(BaseModel):
    current_password: str
    new_password: str
    confirm_password: str


class EmailUpdateRequest(BaseModel):
    new_email: EmailStr


class DeleteAccountRequest(BaseModel):
    reason: str


def validate_password_requirements(password: str) -> list[str]:
    """Validate password and return list of error messages."""
    errors = []
    
    if len(password) < 8:
        errors.append("Password must be at least 8 characters long")
    
    if not any(c.isupper() for c in password):
        errors.append("Password must contain at least one uppercase letter (A-Z)")
    
    if not any(c.islower() for c in password):
        errors.append("Password must contain at least one lowercase letter (a-z)")
    
    if not any(c.isdigit() for c in password):
        errors.append("Password must contain at least one number (0-9)")
    
    if not any(c in "!@#$%^&*" for c in password):
        errors.append("Password must contain at least one special character (!@#$%^&*)")
    
    return errors


@router.get("/users/me")
async def get_current_user_profile(
    db: AsyncIOMotorDatabase = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    """Get current user's own profile information."""
    doc = await db["users"].find_one({"_id": user["_id"]}, {"password_hash": 0})
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return _to_str_id(doc)


@router.put("/users/me")
async def update_current_user_profile(
    payload: UserUpdate,
    db: AsyncIOMotorDatabase = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    """Update current user's own profile information."""
    user_id = user["_id"]
    
    def validate_password_requirements(password: str) -> list[str]:
        """Validate password and return list of error messages."""
        errors = []
        
        if len(password) < 8:
            errors.append("Password must be at least 8 characters long")
        
        if not any(c.isupper() for c in password):
            errors.append("Password must contain at least one uppercase letter (A-Z)")
        
        if not any(c.islower() for c in password):
            errors.append("Password must contain at least one lowercase letter (a-z)")
        
        if not any(c.isdigit() for c in password):
            errors.append("Password must contain at least one number (0-9)")
        
        if not any(c in "!@#$%^&*" for c in password):
            errors.append("Password must contain at least one special character (!@#$%^&*)")
        
        return errors

    update_data: Dict[str, Any] = {}
    if payload.profile_info is not None:
        update_data["profile_info"] = payload.profile_info
    if payload.status is not None:
        update_data["status"] = payload.status
    if payload.password is not None:
        password_errors = validate_password_requirements(payload.password)
        if password_errors:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=password_errors[0]
            )
        update_data["password_hash"] = get_password_hash(payload.password)

    if not update_data:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No fields to update")

    res = await db["users"].update_one({"_id": user_id}, {"$set": update_data})
    if res.matched_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    doc = await db["users"].find_one({"_id": user_id}, {"password_hash": 0})
    return _to_str_id(doc)


@router.post("/users/me/change-password")
async def change_password(
    payload: PasswordChangeRequest,
    db: AsyncIOMotorDatabase = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    """Change user password. Requires current password verification."""
    from app.core.security import verify_password
    
    user_id = user["_id"]
    
    # Validate new password requirements
    password_errors = validate_password_requirements(payload.new_password)
    if password_errors:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=password_errors[0]
        )
    
    if payload.new_password != payload.confirm_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password and confirm password do not match"
        )
    
    # Get current user from database
    user_doc = await db["users"].find_one({"_id": user_id})
    if not user_doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    # Verify current password
    stored_hash = user_doc.get("password_hash")
    if not stored_hash or not verify_password(payload.current_password, stored_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect"
        )
    
    # Update password
    new_password_hash = get_password_hash(payload.new_password)
    await db["users"].update_one(
        {"_id": user_id},
        {"$set": {"password_hash": new_password_hash}}
    )
    
    return {"status": "ok", "message": "Password changed successfully"}


@router.post("/users/me/update-email")
async def update_email(
    payload: EmailUpdateRequest,
    db: AsyncIOMotorDatabase = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    """Update user email address."""
    user_id = user["_id"]
    
    # Check if email already exists
    existing = await db["users"].find_one({"email": payload.new_email.lower()})
    if existing and existing["_id"] != user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Update email
    await db["users"].update_one(
        {"_id": user_id},
        {"$set": {"email": payload.new_email.lower()}}
    )
    
    return {"status": "ok", "message": "Email updated successfully"}


@router.post("/users/me/upload-photo")
async def upload_profile_photo(
    file: UploadFile = File(...),
    db: AsyncIOMotorDatabase = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    """Upload profile photo for current user."""
    user_id = user["_id"]
    
    # Validate file type
    allowed_extensions = {".jpg", ".jpeg", ".png", ".gif", ".webp"}
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in allowed_extensions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type. Allowed types: JPG, JPEG, PNG, GIF, WEBP"
        )
    
    # Validate file size (max 5MB)
    file_content = await file.read()
    if len(file_content) > 5 * 1024 * 1024:  # 5MB
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File size exceeds 5MB limit"
        )
    
    # Create uploads directory if it doesn't exist
    upload_dir = Path("uploads/photos")
    upload_dir.mkdir(parents=True, exist_ok=True)
    
    # Generate unique filename
    file_id = secrets.token_urlsafe(16)
    filename = f"{user_id}_{file_id}{file_ext}"
    file_path = upload_dir / filename
    
    # Save file
    with open(file_path, "wb") as f:
        f.write(file_content)
    
    # Get old photo filename if exists to delete it later
    user_doc = await db["users"].find_one({"_id": user_id})
    old_photo = None
    if user_doc and user_doc.get("profile_info") and user_doc["profile_info"].get("photo_filename"):
        old_photo = user_doc["profile_info"]["photo_filename"]
    
    # Update user profile with photo info
    profile_info = user_doc.get("profile_info", {}) if user_doc else {}
    profile_info["photo_filename"] = filename
    profile_info["photo_original_name"] = file.filename
    profile_info["photo_uploaded_at"] = datetime.utcnow().isoformat()
    
    await db["users"].update_one(
        {"_id": user_id},
        {"$set": {"profile_info": profile_info}}
    )
    
    # Delete old photo file if it exists
    if old_photo:
        old_file_path = upload_dir / old_photo
        if old_file_path.exists():
            try:
                old_file_path.unlink()
            except Exception as e:
                print(f"Warning: Failed to delete old photo file: {e}")
    
    return {
        "message": "Photo uploaded successfully",
        "filename": filename,
        "original_name": file.filename
    }


@router.post("/users/me/remove-photo")
async def remove_profile_photo(
    db: AsyncIOMotorDatabase = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    """Remove profile photo for current user."""
    user_id = user["_id"]
    
    user_doc = await db["users"].find_one({"_id": user_id})
    if not user_doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    profile_info = user_doc.get("profile_info", {})
    photo_filename = profile_info.get("photo_filename")
    
    if photo_filename:
        # Delete photo file
        photo_path = Path("uploads/photos") / photo_filename
        if photo_path.exists():
            try:
                photo_path.unlink()
            except Exception as e:
                print(f"Warning: Failed to delete photo file: {e}")
        
        # Remove photo info from profile
        profile_info.pop("photo_filename", None)
        profile_info.pop("photo_original_name", None)
        profile_info.pop("photo_uploaded_at", None)
        
        await db["users"].update_one(
            {"_id": user_id},
            {"$set": {"profile_info": profile_info}}
        )
    
    return {"message": "Photo removed successfully"}


@router.get("/users/me/photo")
async def get_profile_photo(
    db: AsyncIOMotorDatabase = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    """Get current user's profile photo."""
    from fastapi.responses import FileResponse
    
    user_id = user["_id"]
    user_doc = await db["users"].find_one({"_id": user_id})
    
    if not user_doc or not user_doc.get("profile_info") or not user_doc["profile_info"].get("photo_filename"):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Photo not found"
        )
    
    filename = user_doc["profile_info"]["photo_filename"]
    file_path = Path("uploads/photos") / filename
    
    if not file_path.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Photo file not found on server"
        )
    
    return FileResponse(
        path=str(file_path),
        media_type="image/jpeg"
    )


@router.post("/users/me/delete-account")
async def delete_own_account(
    payload: DeleteAccountRequest,
    db: AsyncIOMotorDatabase = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    """Delete current user's own account."""
    user_id = user["_id"]
    
    # Get user document before deletion
    user_doc = await db["users"].find_one({"_id": user_id})
    if not user_doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    # Delete user's profile photo if exists
    profile_info = user_doc.get("profile_info", {})
    photo_filename = profile_info.get("photo_filename")
    if photo_filename:
        photo_path = Path("uploads/photos") / photo_filename
        if photo_path.exists():
            try:
                photo_path.unlink()
            except Exception as e:
                print(f"Warning: Failed to delete photo file: {e}")
    
    # Delete user's CV if exists
    cv_filename = profile_info.get("cv_filename")
    if cv_filename:
        cv_path = Path("uploads/cv") / cv_filename
        if cv_path.exists():
            try:
                cv_path.unlink()
            except Exception as e:
                print(f"Warning: Failed to delete CV file: {e}")
    
    # Delete all sessions associated with this user
    await db["sessions"].delete_many({"candidate_id": user_id})
    
    # Delete user account
    await db["users"].delete_one({"_id": user_id})
    
    # Log account deletion (optional - for analytics)
    try:
        await db["activity_logs"].insert_one({
            "action": "delete_account",
            "user_id": str(user_id),
            "user_email": user_doc.get("email", ""),
            "reason": payload.reason,
            "timestamp": datetime.utcnow(),
        })
    except Exception as e:
        print(f"Warning: Failed to log account deletion: {e}")
    
    return {"status": "ok", "message": "Account deleted successfully"}


def extract_text_from_pdf(file_path: Path) -> str:
    """Extract text from PDF file."""
    try:
        import PyPDF2
        text = ""
        with open(file_path, "rb") as f:
            pdf_reader = PyPDF2.PdfReader(f)
            for page in pdf_reader.pages:
                text += page.extract_text() + "\n"
        return text
    except Exception as e:
        print(f"Error extracting PDF text: {e}")
        return ""


def extract_text_from_docx(file_path: Path) -> str:
    """Extract text from DOCX file."""
    try:
        from docx import Document
        doc = Document(file_path)
        text = "\n".join([paragraph.text for paragraph in doc.paragraphs])
        return text
    except Exception as e:
        print(f"Error extracting DOCX text: {e}")
        return ""


def parse_cv_text(text: str) -> Dict[str, Any]:
    """Parse CV text and extract structured information."""
    
    parsed_data = {
        "name": "",
        "email": "",
        "phone": "",
        "location": "",
        "linkedin": "",
        "github": "",
        "bio": "",
        "education": [],
        "work_experience": [],
        "projects": [],
        "skills": [],
    }
    
    lines = text.split("\n")
    current_section = None
    
    # Extract email
    email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
    emails = re.findall(email_pattern, text)
    if emails:
        parsed_data["email"] = emails[0]
    
    # Extract phone
    phone_patterns = [
        r'\+?\d{1,3}[-.\s]?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9}',
        r'\d{3}[-.\s]?\d{3}[-.\s]?\d{4}',
        r'\d{10,}',
    ]
    for pattern in phone_patterns:
        phones = re.findall(pattern, text)
        if phones:
            parsed_data["phone"] = phones[0]
            break
    
    # Extract LinkedIn and GitHub URLs
    linkedin_pattern = r'linkedin\.com/in/[\w-]+'
    github_pattern = r'github\.com/[\w-]+'
    linkedin_matches = re.findall(linkedin_pattern, text, re.IGNORECASE)
    github_matches = re.findall(github_pattern, text, re.IGNORECASE)
    if linkedin_matches:
        parsed_data["linkedin"] = f"https://{linkedin_matches[0]}"
    if github_matches:
        parsed_data["github"] = f"https://{github_matches[0]}"
    
    # Extract name (usually first line or before email)
    for i, line in enumerate(lines[:10]):
        line = line.strip()
        if line and not re.search(email_pattern, line) and not re.search(r'phone|email|contact', line, re.IGNORECASE):
            if len(line.split()) <= 4 and line[0].isupper():
                parsed_data["name"] = line
                break
    
    # Extract location (look for common location patterns)
    location_patterns = [
        r'([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*),\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)',
        r'(Islamabad|Karachi|Lahore|Rawalpindi|Faisalabad|Multan|Peshawar|Quetta|Hyderabad)',
        r'(Pakistan|USA|United States|UK|United Kingdom)',
    ]
    for line in lines[:30]:
        for pattern in location_patterns:
            match = re.search(pattern, line, re.IGNORECASE)
            if match:
                parsed_data["location"] = line.strip()
                break
        if parsed_data["location"]:
            break
    
    # Extract sections
    section_keywords = {
        "education": ["education", "educational", "academic"],
        "experience": ["experience", "work experience", "employment", "employment history"],
        "projects": ["projects", "project", "portfolio"],
        "skills": ["skills", "technical skills", "competencies", "expertise"],
        "summary": ["summary", "about", "profile", "objective", "professional summary"],
    }
    
    for i, line in enumerate(lines):
        line_lower = line.lower().strip()
        for section, keywords in section_keywords.items():
            if any(keyword in line_lower for keyword in keywords) and len(line.split()) < 5:
                current_section = section
                break
        
        if current_section == "summary" and line.strip() and not any(kw in line.lower() for kw in ["summary", "about", "profile"]):
            parsed_data["bio"] += line.strip() + " "
        elif current_section == "skills" and line.strip():
            # Extract skills (comma-separated or bullet points)
            skills_line = re.split(r'[,•\-\*]', line)
            for skill in skills_line:
                skill = skill.strip()
                if skill and len(skill) > 2:
                    parsed_data["skills"].append(skill)
        elif current_section == "education" and line.strip():
            # Enhanced education extraction
            line_lower = line.lower()
            if any(word in line_lower for word in ["university", "college", "institute", "school"]):
                # Try to extract dates
                date_pattern = r'(\w+\s+\d{4})\s*-\s*(\w+\s+\d{4}|Present|Ongoing)'
                dates = re.search(date_pattern, line, re.IGNORECASE)
                start_date = dates.group(1) if dates else ""
                end_date = dates.group(2) if dates else ""
                
                # Extract degree and field
                degree_match = re.search(r'(Bachelor|Master|PhD|Doctorate|Diploma|Certificate)', line, re.IGNORECASE)
                degree = degree_match.group(0) if degree_match else ""
                
                # Extract field of study
                field_match = re.search(r'(?:in|of|,)\s*([A-Z][^,]+)', line)
                field = field_match.group(1).strip() if field_match else ""
                
                institution = line.split(",")[0].strip() if "," in line else line.strip()
                
                parsed_data["education"].append({
                    "institution": institution,
                    "degree": degree,
                    "field": field,
                    "start_date": start_date,
                    "end_date": end_date,
                })
        elif current_section == "experience" and line.strip():
            # Enhanced experience extraction
            line_lower = line.lower()
            if any(word in line_lower for word in ["developer", "engineer", "analyst", "manager", "intern", "developer", "solutions", "company"]):
                # Try to extract dates
                date_pattern = r'(\w+\s+\d{4})\s*-\s*(\w+\s+\d{4}|Present|Current)'
                dates = re.search(date_pattern, line, re.IGNORECASE)
                start_date = dates.group(1) if dates else ""
                end_date = dates.group(2) if dates else ""
                
                # Extract title and company
                parts = line.split("•")
                if len(parts) >= 2:
                    title = parts[0].strip()
                    company = parts[1].strip() if len(parts) > 1 else ""
                else:
                    # Try to extract from common patterns
                    title_match = re.search(r'([A-Z][a-z]+\s+(?:Developer|Engineer|Analyst|Manager|Intern))', line)
                    title = title_match.group(0) if title_match else ""
                    company = line.replace(title, "").strip()
                
                parsed_data["work_experience"].append({
                    "company": company or line.strip(),
                    "title": title,
                    "description": "",
                    "start_date": start_date,
                    "end_date": end_date,
                    "location": "",
                })
        elif current_section == "projects" and line.strip():
            # Enhanced project extraction
            line_lower = line.lower()
            if any(word in line_lower for word in ["project", "dashboard", "system", "application", "api", "geocoder", "management"]):
                # Extract GitHub URL if present
                github_match = re.search(r'github\.com/[\w/-]+', line, re.IGNORECASE)
                github_url = f"https://{github_match.group(0)}" if github_match else ""
                
                # Extract dates
                date_pattern = r'(\w+\s+\d{4})\s*-\s*(\w+\s+\d{4})'
                dates = re.search(date_pattern, line, re.IGNORECASE)
                start_date = dates.group(1) if dates else ""
                end_date = dates.group(2) if dates else ""
                
                title = line.split("•")[0].strip() if "•" in line else line.strip()
                
                parsed_data["projects"].append({
                    "title": title,
                    "description": "",
                    "technologies": "",
                    "github_url": github_url,
                    "start_date": start_date,
                    "end_date": end_date,
                })
    
    # Clean up bio
    parsed_data["bio"] = parsed_data["bio"].strip()
    
    # Remove duplicates from skills
    parsed_data["skills"] = list(dict.fromkeys(parsed_data["skills"]))[:20]  # Limit to 20 skills
    
    return parsed_data


@router.post("/users/me/upload-cv")
async def upload_cv(
    file: UploadFile = File(...),
    parse: bool = False,
    db: AsyncIOMotorDatabase = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    """Upload CV/Resume for current user. Optionally parse and extract information."""
    user_id = user["_id"]
    
    # Validate file type
    allowed_extensions = {".pdf", ".doc", ".docx"}
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in allowed_extensions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type. Allowed types: PDF, DOC, DOCX"
        )
    
    # Validate file size (max 10MB)
    file_content = await file.read()
    if len(file_content) > 10 * 1024 * 1024:  # 10MB
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File size exceeds 10MB limit"
        )
    
    # Create uploads directory if it doesn't exist
    upload_dir = Path("uploads/cv")
    upload_dir.mkdir(parents=True, exist_ok=True)
    
    # Generate unique filename
    file_id = secrets.token_urlsafe(16)
    filename = f"{user_id}_{file_id}{file_ext}"
    file_path = upload_dir / filename
    
    # Save file
    with open(file_path, "wb") as f:
        f.write(file_content)
    
    # Get old CV filename if exists to delete it later
    user_doc = await db["users"].find_one({"_id": user_id})
    old_cv = None
    if user_doc and user_doc.get("profile_info") and user_doc["profile_info"].get("cv_filename"):
        old_cv = user_doc["profile_info"]["cv_filename"]
    
    # Update user profile with CV info
    profile_info = user_doc.get("profile_info", {}) if user_doc else {}
    profile_info["cv_filename"] = filename
    profile_info["cv_original_name"] = file.filename
    profile_info["cv_uploaded_at"] = datetime.utcnow().isoformat()
    
    # Parse CV if requested
    parsed_data = None
    if parse:
        try:
            # Extract text from file
            if file_ext == ".pdf":
                text = extract_text_from_pdf(file_path)
            elif file_ext == ".docx":
                text = extract_text_from_docx(file_path)
            else:
                text = ""
            
            if text:
                parsed_data = parse_cv_text(text)
                # Merge parsed data into profile_info (don't overwrite existing data)
                if parsed_data.get("name") and not profile_info.get("name"):
                    profile_info["name"] = parsed_data["name"]
                if parsed_data.get("phone") and not profile_info.get("phone"):
                    profile_info["phone"] = parsed_data["phone"]
                if parsed_data.get("location") and not profile_info.get("location"):
                    profile_info["location"] = parsed_data["location"]
                if parsed_data.get("linkedin") and not profile_info.get("linkedin"):
                    profile_info["linkedin"] = parsed_data["linkedin"]
                if parsed_data.get("github") and not profile_info.get("github"):
                    profile_info["github"] = parsed_data["github"]
                if parsed_data.get("bio") and not profile_info.get("bio"):
                    profile_info["bio"] = parsed_data["bio"]
                if parsed_data.get("education") and not profile_info.get("education"):
                    profile_info["education"] = parsed_data["education"]
                if parsed_data.get("work_experience") and not profile_info.get("work_experience"):
                    profile_info["work_experience"] = parsed_data["work_experience"]
                if parsed_data.get("projects") and not profile_info.get("projects"):
                    profile_info["projects"] = parsed_data["projects"]
                if parsed_data.get("skills"):
                    existing_skills = profile_info.get("skills", [])
                    new_skills = [s for s in parsed_data["skills"] if s not in existing_skills]
                    profile_info["skills"] = existing_skills + new_skills
        except Exception as e:
            print(f"Error parsing CV: {e}")
            parsed_data = None
    
    await db["users"].update_one(
        {"_id": user_id},
        {"$set": {"profile_info": profile_info}}
    )
    
    # Delete old CV file if it exists
    if old_cv:
        old_file_path = upload_dir / old_cv
        if old_file_path.exists():
            try:
                old_file_path.unlink()
            except Exception as e:
                print(f"Warning: Failed to delete old CV file: {e}")
    
    return {
        "message": "CV uploaded successfully",
        "filename": filename,
        "original_name": file.filename,
        "parsed": parsed_data is not None,
        "parsed_data": parsed_data
    }


@router.get("/users/me/download-cv")
async def download_cv(
    db: AsyncIOMotorDatabase = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    """Download current user's CV/Resume."""
    from fastapi.responses import FileResponse
    
    user_id = user["_id"]
    user_doc = await db["users"].find_one({"_id": user_id})
    
    if not user_doc or not user_doc.get("profile_info") or not user_doc["profile_info"].get("cv_filename"):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="CV not found"
        )
    
    filename = user_doc["profile_info"]["cv_filename"]
    original_name = user_doc["profile_info"].get("cv_original_name", filename)
    file_path = Path("uploads/cv") / filename
    
    if not file_path.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="CV file not found on server"
        )
    
    return FileResponse(
        path=str(file_path),
        filename=original_name,
        media_type="application/octet-stream"
    )


@router.get("/users/me/stats")
async def get_current_user_stats(
    db: AsyncIOMotorDatabase = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    """Get current candidate's dashboard statistics."""
    user_id = user["_id"]
    
    # Ensure user_id is ObjectId for proper matching
    if not isinstance(user_id, ObjectId):
        user_id = ObjectId(user_id)
    
    print(f"[CANDIDATE STATS] Fetching stats for user_id: {user_id}, type: {type(user_id)}")
    
    # Count upcoming (active) sessions - match both ObjectId and string formats
    upcoming_count = await db["sessions"].count_documents({
        "$or": [
            {"candidate_id": user_id},
            {"candidate_id": str(user_id)}
        ],
        "status": "active"
    })
    
    # Count completed sessions
    completed_count = await db["sessions"].count_documents({
        "$or": [
            {"candidate_id": user_id},
            {"candidate_id": str(user_id)}
        ],
        "status": "completed"
    })
    
    print(f"[CANDIDATE STATS] Upcoming: {upcoming_count}, Completed: {completed_count}")
    
    # Calculate success rate (average score from completed sessions)
    completed_sessions = await db["sessions"].find({
        "$or": [
            {"candidate_id": user_id},
            {"candidate_id": str(user_id)}
        ],
        "status": "completed"
    }).to_list(length=1000)
    
    scores = []
    for session in completed_sessions:
        if session.get("scores") and session["scores"].get("overall") is not None:
            scores.append(session["scores"]["overall"])
    
    success_rate = round(sum(scores) / len(scores), 0) if scores else 0
    
    # Get recent activity (last 5 completed or active sessions)
    recent_activity = []
    recent_sessions = await db["sessions"].find({
        "$or": [
            {"candidate_id": user_id},
            {"candidate_id": str(user_id)}
        ],
        "status": {"$in": ["completed", "active"]}
    }).sort("created_at", -1).limit(5).to_list(length=5)
    
    print(f"[CANDIDATE STATS] Found {len(recent_sessions)} recent sessions")
    
    for session in recent_sessions:
        session_type = session.get("interview_type", "Combined")
        if session_type == "Coding":
            session_type = "Programming"
        elif session_type == "Programming":
            session_type = "Technical"
        
        created_at = session.get("created_at")
        if isinstance(created_at, datetime):
            time_ago = datetime.utcnow() - created_at
            if time_ago.total_seconds() < 3600:  # Less than 1 hour
                time_str = f"{int(time_ago.total_seconds() / 60)} minutes ago"
            elif time_ago.total_seconds() < 86400:  # Less than 1 day
                time_str = f"{int(time_ago.total_seconds() / 3600)} hours ago"
            elif time_ago.total_seconds() < 604800:  # Less than 1 week
                time_str = f"{int(time_ago.total_seconds() / 86400)} days ago"
            else:
                time_str = created_at.strftime("%B %d, %Y")
        else:
            time_str = "Recently"
        
        score = None
        if session.get("status") == "completed" and session.get("scores") and session["scores"].get("overall") is not None:
            score = f"{int(session['scores']['overall'])}%"
        
        recent_activity.append({
            "title": f"{session_type} Interview",
            "status": "Completed" if session.get("status") == "completed" else "Upcoming",
            "time": time_str,
            "score": score
        })
    
    result = {
        "upcoming_interviews": upcoming_count,
        "completed_interviews": completed_count,
        "success_rate": int(success_rate),
        "recent_activity": recent_activity
    }
    
    print(f"[CANDIDATE STATS] Returning: {result}")
    return result


def _to_str_id(doc: Any) -> Any:
    if isinstance(doc, dict):
        if "_id" in doc:
            doc["id"] = str(doc["_id"])
            del doc["_id"]
        # Also handle if id already exists but is ObjectId
        if "id" in doc and not isinstance(doc["id"], str):
            doc["id"] = str(doc["id"])
    return doc


@router.get("/admin/candidates")
async def list_candidates(
    db: AsyncIOMotorDatabase = Depends(get_db),
    admin: dict = Depends(get_current_admin),
) -> List[dict]:
    """
    Return all users with role=candidate and a sessionsCount field.
    """
    # First, check how many candidates exist
    total_count = await db["users"].count_documents({"role": "candidate"})
    print(f"Total candidates in database: {total_count}")
    
    # Get a sample to see what they look like
    sample = await db["users"].find_one({"role": "candidate"})
    if sample:
        print(f"Sample candidate: email={sample.get('email')}, role={sample.get('role')}, _id={sample.get('_id')}")
    else:
        print("No candidates found in database")
    
    pipeline = [
        {"$match": {"role": "candidate"}},
        {
            "$lookup": {
                "from": "sessions",
                "localField": "_id",
                "foreignField": "candidate_id",
                "as": "all_sessions",
            }
        },
        {
            "$addFields": {
                # Filter to only completed sessions
                "completed_sessions": {
                    "$filter": {
                        "input": "$all_sessions",
                        "as": "session",
                        "cond": {"$eq": ["$$session.status", "completed"]}
                    }
                }
            }
        },
        {
            "$addFields": {
                # Count only completed sessions
                "sessionsCount": {"$size": "$completed_sessions"},
                # Get last interview from completed sessions only
                "lastInterview": {
                    "$cond": {
                        "if": {"$gt": [{"$size": "$completed_sessions"}, 0]},
                        "then": {"$max": "$completed_sessions.created_at"},
                        "else": None
                    }
                },
                # Extract scores from completed sessions that have scores
                "scores_array": {
                    "$filter": {
                        "input": {
                            "$map": {
                                "input": "$completed_sessions",
                                "as": "session",
                                "in": "$$session.scores.overall"
                            }
                        },
                        "as": "score",
                        "cond": {
                            "$and": [
                                {"$ne": ["$$score", None]},
                                {"$ne": [{"$type": "$$score"}, "missing"]}
                            ]
                        }
                    }
                }
            }
        },
        {
            "$addFields": {
                "avgScore": {
                    "$cond": {
                        "if": {"$gt": [{"$size": {"$ifNull": ["$scores_array", []]}}, 0]},
                        "then": {"$avg": "$scores_array"},
                        "else": None
                    }
                }
            }
        },
        {
            "$project": {
                "scores_array": 0,
            }
        },
        {
            "$project": {
                "all_sessions": 0,
                "completed_sessions": 0,
                "scores_array": 0,
                "password_hash": 0,
            }
        },
    ]
    try:
        cursor = db["users"].aggregate(pipeline)
        results = []
        doc_count = 0
        async for doc in cursor:
            doc_count += 1
            print(f"Processing candidate {doc_count}: email={doc.get('email')}, _id={doc.get('_id')}")
            
            # Ensure we have a valid _id before processing
            if "_id" not in doc or doc["_id"] is None:
                print(f"Warning: Skipping document without _id: {doc.get('email', 'unknown')}")
                continue
            
            # Convert _id to id string using the helper function
            doc = _to_str_id(doc)
            
            # Double-check id field exists and is valid
            if "id" not in doc or not doc["id"]:
                # Try to get _id if id is missing (shouldn't happen after _to_str_id, but just in case)
                if "_id" in doc and doc["_id"]:
                    doc["id"] = str(doc["_id"])
                else:
                    print(f"Warning: Skipping document without valid id: {doc.get('email', 'unknown')}")
                    continue
            
            # Ensure id is a string and not "None"
            doc["id"] = str(doc["id"]).strip()
            if not doc["id"] or doc["id"] == "None" or doc["id"].lower() == "none":
                print(f"Warning: Skipping document with invalid id: {doc.get('email', 'unknown')}, id='{doc.get('id')}'")
                continue
            
            # Ensure all required fields exist
            if "email" not in doc:
                print(f"Warning: Skipping document without email: id={doc.get('id')}")
                continue
            
            # Convert ObjectId candidate_id in sessions if needed
            results.append(doc)
            print(f"  -> Added to results: id={doc.get('id')}, email={doc.get('email')}, role={doc.get('role')}")
        
        print(f"Returning {len(results)} candidates (processed {doc_count} documents from aggregation)")
        return results
    except Exception as e:
        print(f"Error in list_candidates: {type(e).__name__}: {e}")
        import traceback
        traceback.print_exc()
        # Fallback: try simple find
        print("Attempting fallback: simple find query")
        simple_results = []
        async for doc in db["users"].find({"role": "candidate"}, {"password_hash": 0}):
            doc = _to_str_id(doc)
            if "id" in doc and doc["id"]:
                doc["sessionsCount"] = 0
                doc["avgScore"] = None
                doc["lastInterview"] = None
                simple_results.append(doc)
        print(f"Fallback returned {len(simple_results)} candidates")
        return simple_results


class StatusUpdate(BaseModel):
    status: str


async def _log_activity(db: AsyncIOMotorDatabase, admin_email: str, action: str, metadata: Dict[str, Any]):
    log = ActivityLog(action=action, admin_email=admin_email, timestamp=datetime.utcnow(), metadata=metadata)
    await db["activity_logs"].delete_many({"_id": None})
    await db["activity_logs"].insert_one(log.dict(by_alias=True, exclude_none=True))


@router.patch("/users/{user_id}/status")
async def update_user_status(
    user_id: str,
    payload: StatusUpdate,
    db: AsyncIOMotorDatabase = Depends(get_db),
    admin: dict = Depends(get_current_admin),
):
    if not ObjectId.is_valid(user_id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid user id")

    res = await db["users"].update_one({"_id": ObjectId(user_id)}, {"$set": {"status": payload.status}})
    if res.matched_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    await _log_activity(
        db,
        admin_email=admin["email"],
        action="update_user_status",
        metadata={"user_id": user_id, "status": payload.status},
    )
    return {"status": "ok"}


@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    admin: dict = Depends(get_current_admin),
):
    if not ObjectId.is_valid(user_id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid user id")

    await db["users"].delete_one({"_id": ObjectId(user_id)})
    await _log_activity(
        db,
        admin_email=admin["email"],
        action="delete_user",
        metadata={"user_id": user_id},
    )
    return None


@router.get("/users/{user_id}")
async def get_user(
    user_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    admin: dict = Depends(get_current_admin),
):
    if not ObjectId.is_valid(user_id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid user id")

    doc = await db["users"].find_one({"_id": ObjectId(user_id)}, {"password_hash": 0})
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return _to_str_id(doc)


@router.get("/admin/users/{user_id}/photo")
async def get_user_photo(
    user_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    admin: dict = Depends(get_current_admin),
):
    """Get user's profile photo (admin only)."""
    from fastapi.responses import FileResponse
    
    if not ObjectId.is_valid(user_id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid user id")
    
    user_doc = await db["users"].find_one({"_id": ObjectId(user_id)})
    
    if not user_doc or not user_doc.get("profile_info") or not user_doc["profile_info"].get("photo_filename"):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Photo not found"
        )
    
    filename = user_doc["profile_info"]["photo_filename"]
    file_path = Path("uploads/photos") / filename
    
    if not file_path.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Photo file not found on server"
        )
    
    return FileResponse(
        path=str(file_path),
        media_type="image/jpeg"
    )


@router.put("/users/{user_id}")
async def update_user(
    user_id: str,
    payload: UserUpdate,
    db: AsyncIOMotorDatabase = Depends(get_db),
    admin: dict = Depends(get_current_admin),
):
    if not ObjectId.is_valid(user_id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid user id")

    def validate_password_requirements(password: str) -> list[str]:
        """Validate password and return list of error messages."""
        errors = []
        
        if len(password) < 8:
            errors.append("Password must be at least 8 characters long")
        
        if not any(c.isupper() for c in password):
            errors.append("Password must contain at least one uppercase letter (A-Z)")
        
        if not any(c.islower() for c in password):
            errors.append("Password must contain at least one lowercase letter (a-z)")
        
        if not any(c.isdigit() for c in password):
            errors.append("Password must contain at least one number (0-9)")
        
        if not any(c in "!@#$%^&*" for c in password):
            errors.append("Password must contain at least one special character (!@#$%^&*)")
        
        return errors

    update_data: Dict[str, Any] = {}
    if payload.profile_info is not None:
        update_data["profile_info"] = payload.profile_info
    if payload.status is not None:
        update_data["status"] = payload.status
    if payload.password is not None:
        password_errors = validate_password_requirements(payload.password)
        if password_errors:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=password_errors[0]  # Return first error message
            )
        update_data["password_hash"] = get_password_hash(payload.password)

    if not update_data:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No fields to update")

    res = await db["users"].update_one({"_id": ObjectId(user_id)}, {"$set": update_data})
    if res.matched_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    doc = await db["users"].find_one({"_id": ObjectId(user_id)}, {"password_hash": 0})
    await _log_activity(
        db,
        admin_email=admin["email"],
        action="update_user",
        metadata={"user_id": user_id, "fields": list(update_data.keys())},
    )
    return _to_str_id(doc)


class InviteCandidateRequest(BaseModel):
    email: EmailStr
    name: str
    
    class Config:
        # Allow extra fields but ignore them
        extra = "forbid"


@router.post("/admin/invite-candidate")
async def invite_candidate(
    payload: InviteCandidateRequest,
    db: AsyncIOMotorDatabase = Depends(get_db),
    admin: dict = Depends(get_current_admin),
):
    """
    Invite a candidate by sending them an email with a signup link.
    """
    print(f"[INVITE] Received invitation request: email={payload.email}, name={payload.name}")
    
    # Check if user already exists
    existing_user = await db["users"].find_one({"email": payload.email})
    if existing_user:
        print(f"[INVITE] User already exists: {payload.email}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"This email ({payload.email}) is already registered as a candidate. You cannot invite an existing user.",
        )

    # Check if already invited
    existing_invite = await db["invited_candidates"].find_one({"email": payload.email})
    if existing_invite:
        print(f"[INVITE] Email already invited: {payload.email}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This email has already been invited",
        )
    
    print(f"[INVITE] Proceeding with invitation for: {payload.email}")

    # Generate invitation token
    invitation_token = secrets.token_urlsafe(32)
    landing_page_url = "http://localhost:3001"  # Frontend landing page

    # Create invitation record
    invited = InvitedCandidate(
        email=payload.email,
        name=payload.name,
        invited_by=admin["email"],
        invitation_token=invitation_token,
        status="pending",
    )

    await db["invited_candidates"].insert_one(invited.dict(by_alias=True, exclude_none=True))

    # Send invitation email
    invitation_link = f"{landing_page_url}/signup?invite={invitation_token}&email={payload.email}"
    try:
        email_sent = send_invitation_email(
            recipient_email=payload.email,
            recipient_name=payload.name,
            invitation_link=invitation_link,
        )

        if email_sent:
            # Update status to "successful" after email is sent
            await db["invited_candidates"].update_one(
                {"email": payload.email},
                {"$set": {"status": "successful"}}
            )
        else:
            # Update status to "failed" if email failed
            await db["invited_candidates"].update_one(
                {"email": payload.email},
                {"$set": {"status": "failed"}}
            )
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to send invitation email. Please check email configuration (NODEMAILER_EMAIL and NODEMAILER_PASSWORD environment variables).",
            )
    except HTTPException:
        raise
    except Exception as e:
        # Update status to "failed" if email failed
        await db["invited_candidates"].update_one(
            {"email": payload.email},
            {"$set": {"status": "failed"}}
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to send invitation email: {str(e)}",
        )

    await _log_activity(
        db,
        admin_email=admin["email"],
        action="invite_candidate",
        metadata={"email": payload.email, "name": payload.name},
    )

    return {
        "message": "Invitation sent successfully",
        "email": payload.email,
        "name": payload.name,
    }


@router.get("/admin/invited-candidates")
async def list_invited_candidates(
    db: AsyncIOMotorDatabase = Depends(get_db),
    admin: dict = Depends(get_current_admin),
) -> List[dict]:
    """
    List all invited candidates.
    """
    cursor = db["invited_candidates"].find({}).sort("invited_at", -1)
    results = []
    async for doc in cursor:
        doc = _to_str_id(doc)
        # Check if candidate has registered
        user = await db["users"].find_one({"email": doc.get("email")})
        if user:
            doc["status"] = "accepted"
            await db["invited_candidates"].update_one(
                {"_id": ObjectId(doc["id"])}, {"$set": {"status": "accepted"}}
            )
        results.append(doc)
    return results


@router.delete("/admin/invited-candidates/{invite_id}")
async def delete_invitation(
    invite_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    admin: dict = Depends(get_current_admin),
):
    """
    Delete an invitation.
    """
    if not ObjectId.is_valid(invite_id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid invitation id")

    res = await db["invited_candidates"].delete_one({"_id": ObjectId(invite_id)})
    if res.deleted_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invitation not found")

    await _log_activity(
        db,
        admin_email=admin["email"],
        action="delete_invitation",
        metadata={"invite_id": invite_id},
    )

    return {"status": "ok"}


