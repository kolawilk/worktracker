# REST API Design

**Status:** ✅ API Spec Complete  
**Version:** v1  
**Base URL:** `/api/v1`

---

## Design Principles

1. **Resource-oriented:** Nouns, not verbs (`/entries`, not `/getEntries`)
2. **Consistent patterns:** Same structure across all endpoints
3. **Predictable errors:** Standard error format, proper HTTP codes
4. **Pagination:** Cursor-based für Listen (performance)
5. **Versioning:** URL path (`/api/v1/...`)

---

## Base Response Format

### Success
```json
{
  "data": { ... },           // Resource or array
  "meta": {                  // Optional metadata
    "page": { ... },
    "total": 100
  }
}
```

### Error
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": [
      { "field": "email", "message": "Invalid email format" }
    ]
  }
}
```

---

## Authentication

### Auth Header
```
Authorization: Bearer <access_token>
```

### Auth Endpoints (Public)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/auth/{provider}/login` | Initiate OAuth flow |
| GET | `/auth/{provider}/callback` | OAuth callback handler |
| POST | `/auth/refresh` | Refresh access token |
| POST | `/auth/logout` | Revoke refresh token |
| POST | `/auth/logout-all` | Revoke all user sessions |

### Auth Response
```json
// POST /auth/refresh
{
  "data": {
    "access_token": "eyJhbGciOiJSUzI1NiIs...",
    "token_type": "Bearer",
    "expires_in": 900
  }
}
```

---

## Endpoints

### Users

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/users/me` | ✅ | Get current user |
| PATCH | `/users/me` | ✅ | Update current user |
| DELETE | `/users/me` | ✅ | Delete account |

```json
// GET /users/me
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "provider": "github",
    "created_at": "2024-01-15T10:30:00Z",
    "last_login_at": "2024-03-15T08:00:00Z"
  }
}

// PATCH /users/me
{
  "email": "new@example.com"  // Optional, requires re-verification
}
```

---

### Categories

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/categories` | ✅ | List all categories |
| POST | `/categories` | ✅ | Create category |
| GET | `/categories/{id}` | ✅ | Get category |
| PATCH | `/categories/{id}` | ✅ | Update category |
| DELETE | `/categories/{id}` | ✅ | Soft delete category |
| POST | `/categories/reorder` | ✅ | Bulk reorder |

```json
// GET /categories
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "name": "Coding",
      "emoji": "💻",
      "color": "#3B82F6",
      "sort_order": 0,
      "is_default": true,
      "created_at": "2024-01-15T10:30:00Z"
    }
  ]
}

// POST /categories
{
  "name": "Meeting",
  "emoji": "🗣️",
  "color": "#10B981",
  "sort_order": 1
}

// POST /categories/reorder
{
  "category_ids": [
    "uuid-1",  // sort_order: 0
    "uuid-2",  // sort_order: 1
    "uuid-3"   // sort_order: 2
  ]
}
```

---

### Time Entries

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/entries` | ✅ | List entries |
| POST | `/entries` | ✅ | Create entry |
| GET | `/entries/{id}` | ✅ | Get entry |
| PATCH | `/entries/{id}` | ✅ | Update entry |
| DELETE | `/entries/{id}` | ✅ | Delete entry |
| POST | `/entries/start` | ✅ | Start timer |
| POST | `/entries/stop` | ✅ | Stop running timer |
| GET | `/entries/running` | ✅ | Get running entry |

```json
// GET /entries?from=2024-03-01&to=2024-03-31&category=uuid
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440002",
      "category": {
        "id": "...",
        "name": "Coding",
        "emoji": "💻",
        "color": "#3B82F6"
      },
      "start_time": "2024-03-15T09:00:00Z",
      "end_time": "2024-03-15T12:30:00Z",
      "duration": 12600,  // seconds
      "note": "Working on API design",
      "is_running": false,
      "created_at": "2024-03-15T09:00:00Z"
    }
  ],
  "meta": {
    "total": 42,
    "page": { "cursor": "eyJpZCI6I...", "has_more": true }
  }
}

// POST /entries
{
  "category_id": "uuid-optional",
  "start_time": "2024-03-15T09:00:00Z",
  "end_time": "2024-03-15T12:30:00Z",  // Optional for running
  "note": "Working on API design"
}

// POST /entries/start
{
  "category_id": "uuid-optional"
}
// Response: 201 Created or 409 Conflict (if already running)

// POST /entries/stop
// No body needed, stops current user's running timer
// Response: 200 OK with updated entry or 404 if none running
```

**Query Parameters for GET /entries:**
- `from`, `to`: ISO 8601 dates (inclusive)
- `category`: Filter by category UUID
- `running`: `true` to get only running entries
- `cursor`: Pagination cursor
- `limit`: Max items (default: 50, max: 100)

---

### Work Days (Summary)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/work-days` | ✅ | List daily summaries |
| GET | `/work-days/{date}` | ✅ | Get specific day |
| GET | `/work-days/stats` | ✅ | Aggregated stats |

```json
// GET /work-days?from=2024-03-01&to=2024-03-31
{
  "data": [
    {
      "date": "2024-03-15",
      "start_time": "09:00:00",
      "end_time": "17:30:00",
      "total_duration": 28800,      // 8 hours
      "break_duration": 3600,       // 1 hour
      "entry_count": 5
    }
  ]
}

// GET /work-days/stats?from=2024-03-01&to=2024-03-31
{
  "data": {
    "total_days": 20,
    "total_hours": 160,
    "avg_hours_per_day": 8.0,
    "by_category": [
      { "category_id": "...", "name": "Coding", "hours": 100 },
      { "category_id": "...", "name": "Meeting", "hours": 60 }
    ]
  }
}
```

---

## HTTP Status Codes

| Code | Usage |
|------|-------|
| 200 | GET, PATCH success |
| 201 | POST created |
| 204 | DELETE success (no body) |
| 400 | Bad request, validation error |
| 401 | Unauthorized (missing/invalid token) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Resource not found |
| 409 | Conflict (e.g., timer already running) |
| 422 | Unprocessable (business logic violation) |
| 429 | Rate limit exceeded |
| 500 | Server error |

---

## Error Codes

| Code | HTTP | Description |
|------|------|-------------|
| `UNAUTHORIZED` | 401 | Missing or invalid token |
| `TOKEN_EXPIRED` | 401 | Access token expired |
| `FORBIDDEN` | 403 | Not allowed to access resource |
| `NOT_FOUND` | 404 | Resource doesn't exist |
| `VALIDATION_ERROR` | 400 | Request body invalid |
| `CONFLICT` | 409 | Resource conflict (e.g., duplicate) |
| `RATE_LIMITED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |

---

## Rate Limiting

**Headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1710504000
```

**Limits:**
- Authenticated: 1000 requests/hour
- Unauthenticated: 60 requests/hour
- Auth endpoints: 10 requests/minute (brute force protection)

---

## OpenAPI/Swagger

**Auto-generated via FastAPI:**
- Docs UI: `/docs` (Swagger UI)
- OpenAPI JSON: `/openapi.json`

---

## FastAPI Implementation Pattern

```python
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

router = APIRouter(prefix="/api/v1")

# Dependency injection
async def get_current_user(token: str = Depends(oauth2_scheme)) -> User:
    ...

async def get_db() -> AsyncSession:
    ...

# Routes
@router.get("/entries", response_model=PaginatedResponse[TimeEntryResponse])
async def list_entries(
    from_date: datetime | None = None,
    to_date: datetime | None = None,
    cursor: str | None = None,
    limit: int = Query(50, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List time entries for current user."""
    ...

@router.post("/entries/start", response_model=TimeEntryResponse, status_code=201)
async def start_timer(
    data: StartTimerRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Start a new timer. Returns 409 if timer already running."""
    # Check for running entry
    running = await get_running_entry(db, current_user.id)
    if running:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={"code": "TIMER_RUNNING", "entry_id": str(running.id)}
        )
    ...
```

---

## CORS Configuration

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "https://worktracker.app"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
    max_age=600
)
```

---

## API Versioning Strategy

1. **URL Versioning:** `/api/v1/...` (current)
2. **Breaking Changes:** New version `/api/v2/...`
3. **Deprecation:** 6 months notice before v1 sunset
4. **Feature Flags:** For gradual rollout (optional)

---

**Decision:** RESTful API mit URL-Versioning, cursor-basierte Pagination, konsistente Response-Formate. FastAPI auto-generiert OpenAPI-Docs.
