# IntraView AI - Backend & Database Documentation

## Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Database Connection](#database-connection)
4. [Backend File Structure](#backend-file-structure)
5. [API Endpoints](#api-endpoints)
6. [Data Models](#data-models)
7. [Frontend-Backend Integration](#frontend-backend-integration)
8. [Security & Authentication](#security--authentication)
9. [Scripts & Utilities](#scripts--utilities)

---

## Overview

The IntraView AI backend is built using **FastAPI** (Python) and **MongoDB** as the database. It provides a RESTful API for the Next.js frontend application, handling authentication, user management, question management, interview sessions, and test cases.

### Technology Stack
- **Framework**: FastAPI 0.115.0
- **Database**: MongoDB (via Motor - async MongoDB driver)
- **Authentication**: JWT (JSON Web Tokens) with OAuth2
- **Password Hashing**: PBKDF2-SHA256
- **AI Integration**: Google Gemini API for question generation
- **Email Service**: SMTP (Gmail)

---

## Architecture

### High-Level Architecture

```
┌─────────────────┐
│   Next.js       │
│   Frontend      │
└────────┬────────┘
         │ HTTP/REST API
         │ (Bearer Token Auth)
         ▼
┌─────────────────┐
│   FastAPI       │
│   Backend       │
│   (Port 8000)   │
└────────┬────────┘
         │
         │ Motor (Async MongoDB Driver)
         ▼
┌─────────────────┐
│   MongoDB       │
│   Database      │
│   (Port 27017)  │
└─────────────────┘
```

### Request Flow

1. **Frontend** makes HTTP request to backend API
2. **Backend** validates JWT token (if protected route)
3. **Backend** queries MongoDB database
4. **Backend** returns JSON response
5. **Frontend** processes and displays data

---

## Database Connection

### Connection Setup

The database connection is managed in `backend/app/database.py`:

**Key Components:**
- **Database Class**: Wraps Motor's AsyncIOMotorClient and database selection
- **get_database()**: Singleton function that creates and caches the database connection
- **get_db()**: FastAPI dependency that returns the database instance

**Environment Variables:**
- `MONGODB_URI`: MongoDB connection string (default: `mongodb://localhost:27017`)
- `MONGODB_DB_NAME`: Database name (default: `intraview_ai`)

**Connection Pattern:**
```python
# Singleton pattern with LRU cache
@lru_cache(maxsize=1)
def get_database() -> Database:
    uri = os.getenv(MONGODB_URI_ENV, "mongodb://localhost:27017")
    db_name = os.getenv(MONGODB_DB_NAME_ENV, "intraview_ai")
    return Database(uri=uri, db_name=db_name)
```

### Database Collections

The MongoDB database uses the following collections:

1. **users** - User accounts (candidates and admins)
2. **questions** - Interview questions (Coding, Behavioral, System Design)
3. **test_cases** - Test cases for coding questions
4. **sessions** - Interview sessions
5. **activity_logs** - Admin activity tracking
6. **password_reset_otps** - OTP codes for password reset
7. **invited_candidates** - Candidate invitations

---

## Backend File Structure

### Core Application Files

#### `app/main.py`
**Purpose**: FastAPI application entry point and configuration

**Key Features:**
- Initializes FastAPI application
- Configures CORS middleware for frontend communication
- Registers all API routers
- Custom validation error handler
- Startup event to initialize database connection
- Health check endpoint (`/health`)

**Routers Registered:**
- `/auth` - Authentication endpoints
- `/users` - User management
- `/questions` - Question management
- `/testcases` - Test case management
- `/sessions` - Interview session management
- `/admin` - Admin-specific endpoints

#### `app/database.py`
**Purpose**: MongoDB database connection management

**Key Functions:**
- `Database` class: Wraps Motor client and database
- `get_database()`: Creates singleton database instance
- `get_db()`: FastAPI dependency for database access

**Usage in Routes:**
```python
async def my_endpoint(db: AsyncIOMotorDatabase = Depends(get_db)):
    result = await db["collection_name"].find_one({...})
```

#### `app/core/config.py`
**Purpose**: Application configuration and settings

**Settings:**
- `JWT_SECRET_KEY`: Secret key for JWT token signing
- `JWT_ALGORITHM`: Algorithm for JWT (HS256)
- `ACCESS_TOKEN_EXPIRE_MINUTES`: Token expiration (24 hours)
- `BACKEND_CORS_ORIGINS`: Allowed frontend origins

#### `app/core/security.py`
**Purpose**: Security utilities for authentication

**Key Functions:**
- `verify_password()`: Verifies plain password against hash
- `get_password_hash()`: Hashes password using PBKDF2-SHA256
- `create_access_token()`: Creates JWT token with user ID and metadata
- `decode_access_token()`: Decodes and validates JWT token

**Password Hashing:**
- Uses `passlib` with `pbkdf2_sha256` scheme
- Pure Python implementation (no bcrypt dependency issues)

#### `app/core/email_service.py`
**Purpose**: Email sending functionality

**Functions:**
- `send_invitation_email()`: Sends candidate invitation emails
- `send_password_reset_otp_email()`: Sends password reset OTP

**Configuration:**
- SMTP server from environment variables
- Supports HTML and plain text emails
- Uses Gmail SMTP by default

#### `app/deps.py`
**Purpose**: FastAPI dependencies for authentication

**Key Dependencies:**
- `get_current_user()`: Validates JWT token and returns user from database
- `get_current_admin()`: Ensures user has admin role

**OAuth2 Integration:**
- Uses `OAuth2PasswordBearer` for token extraction
- Token extracted from `Authorization: Bearer <token>` header

#### `app/models/__init__.py`
**Purpose**: Pydantic models for data validation

**Models Defined:**
1. **User**: User account with email, password hash, role, profile
2. **Question**: Interview question with category, difficulty, description
3. **TestCase**: Test case for coding questions
4. **Rubric**: Evaluation rubric
5. **Session**: Interview session
6. **ActivityLog**: Admin activity tracking
7. **InvitedCandidate**: Candidate invitation records

**PyObjectId**: Custom type for MongoDB ObjectId conversion

---

### Router Files

#### `app/routers/auth.py`
**Purpose**: Authentication and user registration

**Endpoints:**
- `POST /auth/signup` - Register new candidate
- `POST /auth/login` - Login and get JWT token
- `GET /auth/check-email` - Check if email exists
- `POST /auth/forgot-password` - Request password reset OTP
- `POST /auth/verify-reset-otp` - Verify OTP
- `POST /auth/reset-password` - Reset password with OTP

**Features:**
- Password validation (8+ chars, uppercase, lowercase, number, special char)
- Case-insensitive email handling
- OTP-based password reset (6-digit, 5-minute expiry)
- User status checking (banned users cannot login)

#### `app/routers/users.py`
**Purpose**: User profile management

**Endpoints:**
- `GET /users/me` - Get current user profile
- `PUT /users/me` - Update current user profile
- `GET /users/{user_id}` - Get user by ID (admin)
- `PUT /users/{user_id}` - Update user (admin)
- `DELETE /users/{user_id}` - Delete user (admin)

**Features:**
- Profile information management
- File uploads (CV, photos)
- User status management (active/banned)

#### `app/routers/questions.py`
**Purpose**: Question management (admin only)

**Endpoints:**
- `GET /questions` - List questions with pagination and filters
- `GET /questions/{question_id}` - Get question details
- `POST /questions` - Create new question
- `PUT /questions/{question_id}` - Update question
- `DELETE /questions/{question_id}` - Delete question
- `POST /questions/generate` - Generate questions using Gemini AI
- `GET /questions/programming-subcategories` - Get subcategories

**Features:**
- Search and filtering (category, difficulty, subcategory)
- Pagination support
- AI-powered question generation
- Activity logging for admin actions
- Programming subcategory support

**Question Categories:**
- **Coding** (maps to "Programming" in frontend)
- **Behavioral**
- **System Design**

#### `app/routers/testcases.py`
**Purpose**: Test case management for coding questions

**Endpoints:**
- `GET /testcases/{question_id}` - List test cases for question
- `POST /testcases` - Create test case
- `PUT /testcases/{testcase_id}` - Update test case
- `DELETE /testcases/{testcase_id}` - Delete test case

**Features:**
- Hidden test case support
- Input/output validation
- Question association

#### `app/routers/sessions.py`
**Purpose**: Interview session management

**Endpoints:**
- `GET /admin/sessions/live` - Get active interview sessions
- `GET /admin/sessions` - List all sessions with pagination
- `GET /admin/sessions/{session_id}` - Get session details
- `POST /sessions` - Create new interview session
- `PUT /sessions/{session_id}` - Update session
- `DELETE /sessions/{session_id}` - Delete session

**Features:**
- Live session tracking
- Session status management (active, completed, cancelled)
- Progress calculation
- Duration tracking

#### `app/routers/admin.py`
**Purpose**: Admin-specific operations

**Endpoints:**
- `GET /admin/candidates` - List all candidates
- `GET /admin/analytics` - Get analytics data
- `GET /admin/activity` - Get activity logs
- `POST /admin/invite` - Invite candidate
- `PUT /admin/users/{user_id}/ban` - Ban/unban user

**Features:**
- Candidate management
- Analytics and statistics
- Activity log viewing
- User banning/unbanning

---

## API Endpoints

### Base URL
- Development: `http://localhost:8000`
- Production: Set via `NEXT_PUBLIC_API_URL` environment variable

### Authentication
Most endpoints require JWT authentication:
```
Authorization: Bearer <token>
```

### Response Format
- Success: JSON object with data
- Error: JSON object with `detail` field
- Status codes: 200 (OK), 201 (Created), 400 (Bad Request), 401 (Unauthorized), 403 (Forbidden), 404 (Not Found), 500 (Internal Server Error)

### Example Request
```javascript
// Frontend API call
const response = await api.get('/questions', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

---

## Data Models

### User Model
```python
{
  "_id": ObjectId,
  "email": "user@example.com",
  "password_hash": "hashed_password",
  "role": "candidate" | "admin",
  "created_at": datetime,
  "profile_info": {
    "name": "John Doe",
    "phone": "...",
    "skills": [...],
    ...
  },
  "status": "active" | "banned"
}
```

### Question Model
```python
{
  "_id": ObjectId,
  "title": "Question Title",
  "category": "Coding" | "Behavioral" | "System Design",
  "difficulty": "Easy" | "Medium" | "Hard",
  "description": "Full question description",
  "programming_subcategory": "Python" | "Java" | ... (optional),
  "topics": ["array", "string"],
  "examples": [...],
  "constraints": [...],
  "hints": [...],
  "code_snippets": {...},
  "created_at": datetime
}
```

### TestCase Model
```python
{
  "_id": ObjectId,
  "question_id": ObjectId,
  "input": "test input",
  "output": "expected output",
  "is_hidden": boolean
}
```

### Session Model
```python
{
  "_id": ObjectId,
  "candidate_id": ObjectId,
  "status": "active" | "completed" | "cancelled",
  "scores": {...},
  "created_at": datetime,
  "interview_type": "Coding" | "Behavioral" | ...,
  "current_question": 1,
  "total_questions": 10
}
```

---

## Frontend-Backend Integration

### API Client (`intraviewaiproject3/lib/api.ts`)

**Base Configuration:**
- API URL from `NEXT_PUBLIC_API_URL` or defaults to `http://localhost:8000`
- Automatic token injection from `localStorage.getItem("authToken")`
- Automatic JSON parsing
- Error handling with redirects for 401/403

**API Methods:**
```typescript
api.get<T>(endpoint)
api.post<T>(endpoint, body)
api.put<T>(endpoint, body)
api.patch<T>(endpoint, body)
api.delete<T>(endpoint)
```

### Authentication Flow

1. **Login:**
   ```typescript
   const response = await api.post('/auth/login', {
     username: email,
     password: password
   });
   // Store token in localStorage
   localStorage.setItem('authToken', response.access_token);
   ```

2. **Protected Requests:**
   ```typescript
   // Token automatically added to headers
   const questions = await api.get('/questions');
   ```

3. **Token Expiration:**
   - Frontend checks for 401/403 responses
   - Automatically clears auth data
   - Redirects to login page

### CORS Configuration

Backend allows requests from:
- `http://localhost:3000`
- `http://127.0.0.1:3000`
- `http://localhost:3001`
- `http://127.0.0.1:3001`

Configured in `app/core/config.py` via `BACKEND_CORS_ORIGINS`.

---

## Security & Authentication

### JWT Token Structure
```json
{
  "sub": "user_id",
  "email": "user@example.com",
  "role": "candidate",
  "exp": 1234567890
}
```

### Password Security
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character (!@#$%^&*)
- Hashed using PBKDF2-SHA256

### OAuth2 Flow
1. User submits credentials to `/auth/login`
2. Backend validates credentials
3. Backend generates JWT token
4. Frontend stores token
5. Frontend includes token in `Authorization` header for protected routes

### Admin Protection
- Admin routes require `get_current_admin` dependency
- Checks user role is "admin"
- Returns 403 if not admin

---

## Scripts & Utilities

### Import Scripts (`backend/scripts/`)

#### `import_python_questions.py`
- Imports Python questions from CSV
- Sets category to "Coding"
- Sets programming_subcategory to "Python"
- Batch insertion for performance

#### `import_newcode_questions.py`
- Imports questions from `newcode.csv`
- Maps `problem_name` to `title`
- Maps `problem_statement` to `description`
- Random difficulty assignment

#### `import_software_questions.py`
- Imports software engineering questions
- Handles various categories and subcategories

#### `move_python_to_coding.py`
- Migrates questions from "Programming" to "Coding" category

### Utility Scripts

#### `check_python_questions.py`
- Verifies imported questions
- Counts questions by category/subcategory

#### `seed_data.py`
- Creates admin account
- Imports initial questions
- Sets up test data

#### `check_user.py`, `check_sessions.py`
- Database inspection utilities
- Debugging and verification tools

### Running Scripts
```bash
cd backend
python -m scripts.script_name
```

---

## Environment Variables

### Required Variables
```bash
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB_NAME=intraview_ai
JWT_SECRET_KEY=your_secret_key_here
```

### Optional Variables
```bash
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
NODEMAILER_EMAIL=your_email@gmail.com
NODEMAILER_PASSWORD=your_app_password
GEMINI_API_KEY=your_gemini_api_key
```

---

## Running the Backend

### Development
```bash
cd backend
python -m venv .venv
.venv\Scripts\activate  # Windows
source .venv/bin/activate  # Linux/Mac
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Production
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### Health Check
```bash
curl http://localhost:8000/health
# Response: {"status": "ok"}
```

---

## Database Operations

### Common Patterns

**Find One:**
```python
user = await db["users"].find_one({"_id": ObjectId(user_id)})
```

**Find Many:**
```python
cursor = db["questions"].find({"category": "Coding"})
async for doc in cursor:
    process(doc)
```

**Insert:**
```python
result = await db["questions"].insert_one(question_dict)
question_id = result.inserted_id
```

**Update:**
```python
await db["users"].update_one(
    {"_id": ObjectId(user_id)},
    {"$set": {"status": "banned"}}
)
```

**Delete:**
```python
await db["questions"].delete_one({"_id": ObjectId(question_id)})
```

**Aggregation:**
```python
pipeline = [
    {"$match": {"category": "Coding"}},
    {"$group": {"_id": "$difficulty", "count": {"$sum": 1}}}
]
cursor = db["questions"].aggregate(pipeline)
```

---

## Error Handling

### Validation Errors
- Custom handler in `main.py`
- Returns 400 with detailed error messages
- Formats field paths and validation messages

### Authentication Errors
- 401: Invalid or missing token
- 403: Insufficient permissions (not admin)

### Database Errors
- Handled with try-except blocks
- Returns 500 with error details
- Logs errors for debugging

---

## Best Practices

1. **Always use async/await** for database operations
2. **Validate input** using Pydantic models
3. **Use dependencies** for authentication and database access
4. **Log activities** for admin actions
5. **Handle errors gracefully** with appropriate status codes
6. **Use ObjectId validation** before database queries
7. **Convert ObjectId to string** in API responses
8. **Use pagination** for list endpoints
9. **Filter and search** efficiently with MongoDB queries
10. **Cache database connection** using singleton pattern

---

## Conclusion

This backend provides a robust, scalable API for the IntraView AI platform. It handles authentication, data management, and integrates with AI services for question generation. The architecture is modular, making it easy to extend and maintain.

For questions or issues, refer to the code comments or contact the development team.

---

**Document Version**: 1.0  
**Last Updated**: 2024  
**Maintained By**: IntraView AI Development Team

