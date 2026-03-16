# Security Concept

**Status:** ✅ Security Architecture Complete  
**Classification:** Internal  
**Review Cycle:** Quarterly

---

## Threat Model

### Assets
1. User data (email, work patterns)
2. OAuth tokens (provider access)
3. Session tokens (JWT + Refresh)
4. Application data (time entries, categories)

### Threats
| Threat | Likelihood | Impact | Mitigation |
|--------|------------|--------|------------|
| Token theft | Medium | High | Short-lived tokens, HttpOnly cookies |
| CSRF | Medium | Medium | SameSite cookies, state validation |
| XSS | Low | High | CSP, input sanitization |
| Brute force | High | Medium | Rate limiting, account lockout |
| OAuth misuse | Low | High | PKCE, state parameter |
| Session hijacking | Low | High | Device fingerprinting, rotation |

---

## Authentication Security

### JWT Configuration

```python
# Access Token
ALGORITHM = "HS256"  # MVP: HS256, Production: RS256
ACCESS_TOKEN_EXPIRE_MINUTES = 15

# Claims
{
  "sub": "user-uuid",           # Subject (user_id)
  "email": "user@example.com",
  "provider": "github",
  "iat": 1710504000,            # Issued at
  "exp": 1710504900,            # Expires (15 min)
  "jti": "unique-token-id"      # JWT ID for revocation
}
```

**Security Properties:**
- Short lifetime (15 min) — reduces blast radius
- No sensitive data in payload (email is ok, no PII)
- `jti` claim for token revocation list (optional)

### Refresh Token Security

```python
# Storage
- HttpOnly cookie (not accessible via JS)
- Secure flag (HTTPS only)
- SameSite=Strict (CSRF protection)
- Path=/api/v1/auth (limited scope)

# Database
- SHA-256 hash stored (not plaintext)
- 7 day expiration
- Single-use (rotation on refresh)
- Device fingerprint (User-Agent + IP hash)
```

**Rotation Flow:**
```
Client                    Server                    DB
  │                         │                         │
  │ POST /auth/refresh      │                         │
  │ + Cookie: refresh=xxx   │                         │
  ├────────────────────────▶│                         │
  │                         │ Validate hash(xxx)        │
  │                         ├────────────────────────▶│
  │                         │◀────────────────────────┤
  │                         │ Mark old as revoked     │
  │                         │ Generate new token        │
  │                         │ Store hash(new)           │
  │                         ├────────────────────────▶│
  │                         │                         │
  │◀────────────────────────┤                         │
  │ Set-Cookie: refresh=new │                         │
  │ { access_token: ... }   │                         │
```

**Theft Detection:**
- If old refresh token used → possible theft
- Revoke all tokens for user
- Force re-authentication
- Log security event

---

## OAuth Security

### PKCE (Proof Key for Code Exchange)

**MUST for all OAuth flows** — prevents authorization code interception.

```python
# 1. Generate PKCE parameters
code_verifier = generate_random(128)  # 128 chars
code_challenge = base64url(sha256(code_verifier))
code_challenge_method = "S256"

# 2. Store code_verifier in session (server-side)
# 3. Send code_challenge to OAuth provider
# 4. Provider returns code
# 5. Exchange code + code_verifier for tokens
```

### State Parameter

```python
# CSRF protection for OAuth callback
state = generate_random(32)  # Cryptographically secure
# Store in session/cookie
# Validate on callback (must match)
```

### Provider-Specific Security

| Provider | Consideration |
|----------|---------------|
| GitHub | `read:user` scope only, no write access |
| Apple | Email only on first login — handle gracefully |
| Google | Verify `hd` (hosted domain) if restricting to org |

---

## Transport Security

### HTTPS Enforcement

```python
# FastAPI middleware
@app.middleware("http")
async def enforce_https(request: Request, call_next):
    if request.url.scheme != "https" and not is_development():
        return RedirectResponse(
            url=str(request.url.replace(scheme="https")),
            status_code=301
        )
    return await call_next(request)
```

### Security Headers

```python
# FastAPI middleware
@app.middleware("http")
async def security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    return response
```

### Content Security Policy (CSP)

```http
Content-Security-Policy: 
  default-src 'self';
  script-src 'self' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  connect-src 'self' https://api.worktracker.app;
  font-src 'self';
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'self';
```

---

## CSRF Protection

### Cookie Configuration

```python
# Refresh token cookie
response.set_cookie(
    key="refresh_token",
    value=token,
    httponly=True,
    secure=True,           # HTTPS only
    samesite="Strict",     # No cross-site requests
    max_age=7*24*60*60,    # 7 days
    path="/api/v1/auth"    # Limited scope
)
```

### Double-Submit Pattern (optional)

For additional API protection:
1. Set `csrf_token` in cookie (not HttpOnly)
2. Client reads cookie, sends in header
3. Server validates cookie == header

---

## Rate Limiting

### Implementation

```python
from fastapi_limiter import FastAPILimiter
import redis.asyncio as redis

# Redis backend for distributed rate limiting
redis_conn = redis.from_url("redis://localhost")
await FastAPILimiter.init(redis_conn)

# Decorator usage
@router.post("/auth/login")
@limiter.limit("10/minute")
async def login(request: Request):
    ...

@router.get("/entries")
@limiter.limit("100/minute")
async def list_entries(request: Request, user: User = Depends(get_current_user)):
    ...
```

### Rate Limit Tiers

| Endpoint | Limit | Window |
|----------|-------|--------|
| `/auth/*` | 10 | 1 minute |
| `/api/v1/*` (auth) | 1000 | 1 hour |
| `/api/v1/*` (anon) | 60 | 1 hour |

### Response Headers

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1710504600
Retry-After: 60  # When limit exceeded
```

---

## Input Validation

### SQL Injection Prevention

```python
# ✅ SQLAlchemy ORM (parameterized queries)
result = await db.execute(
    select(TimeEntry).where(TimeEntry.user_id == user_id)
)

# ❌ Never do this
query = f"SELECT * FROM entries WHERE user_id = '{user_id}'"
```

### XSS Prevention

```python
# ✅ Pydantic validation
class CreateEntryRequest(BaseModel):
    note: str = Field(..., max_length=1000)
    
    @validator('note')
    def sanitize_note(cls, v):
        # Strip HTML tags
        return bleach.clean(v, tags=[], strip=True)

# ✅ Output encoding (React does this by default)
// Automatic escaping in JSX
<div>{userInput}</div>  // Safe
```

### File Upload (if applicable)

```python
# Validate file type, size
ALLOWED_TYPES = {"image/png", "image/jpeg", "image/webp"}
MAX_SIZE = 5 * 1024 * 1024  # 5MB

def validate_upload(file: UploadFile):
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(400, "Invalid file type")
    if file.size > MAX_SIZE:
        raise HTTPException(400, "File too large")
```

---

## Data Protection

### Database Encryption

| Data | Storage | Notes |
|------|---------|-------|
| OAuth tokens | Plaintext | Short-lived, provider tokens |
| Refresh tokens | SHA-256 hash | One-way, verify only |
| Email | Plaintext | Needed for queries, unique constraint |
| Provider data | JSONB | Optional, no sensitive data |

### Backup Encryption

```bash
# Encrypt database backups
gpg --symmetric --cipher-algo AES256 backup.sql
# Store in secure location (S3 with SSE-KMS)
```

### Data Retention

| Data Type | Retention | Action |
|-----------|-----------|--------|
| Time entries | 2 years | Archive to cold storage |
| Refresh tokens | 7 days | Auto-expire |
| Deleted accounts | 30 days | Hard delete after grace period |
| Audit logs | 1 year | Rotate to long-term storage |

---

## Security Monitoring

### Logging

```python
# Security events to log
SECURITY_EVENTS = {
    "auth_failed": "Authentication failure",
    "token_refresh": "Token refresh",
    "token_revoked": "Token revoked",
    "suspicious_activity": "Anomaly detected",
    "rate_limit_hit": "Rate limit exceeded",
    "account_deleted": "User account deleted"
}

# Log format (structured JSON)
{
  "timestamp": "2024-03-15T10:30:00Z",
  "event": "auth_failed",
  "user_id": "uuid-or-null",
  "ip": "192.168.1.1",
  "user_agent": "Mozilla/5.0...",
  "details": {"reason": "invalid_token"}
}
```

### Alerts

| Condition | Severity | Action |
|-----------|----------|--------|
| >100 failed logins/hour | High | Alert + temporary IP block |
| Token reuse detected | Critical | Revoke all sessions + email user |
| Rate limit abuse | Medium | Log + review |

---

## Security Checklist

### Pre-Deployment

- [ ] HTTPS enforced (HSTS)
- [ ] Security headers set
- [ ] Rate limiting configured
- [ ] Input validation complete
- [ ] SQL injection tested (manual + automated)
- [ ] XSS tested
- [ ] Dependency audit (`pip-audit`, `npm audit`)
- [ ] Secrets in environment (not code)
- [ ] Database credentials rotated
- [ ] Backup encryption configured

### Ongoing

- [ ] Weekly dependency updates
- [ ] Monthly security review
- [ ] Quarterly penetration test
- [ ] Annual security audit

---

## Incident Response

### Token Compromise

1. **Detect:** Unusual patterns (token reuse, geo anomalies)
2. **Contain:** Revoke all tokens for affected user(s)
3. **Investigate:** Check logs for breach scope
4. **Notify:** Inform affected users
5. **Improve:** Review and patch vulnerability

### Data Breach

1. **Contain:** Isolate affected systems
2. **Assess:** Determine scope of exposed data
3. **Notify:** Users and authorities (GDPR: 72h)
4. **Remediate:** Patch, rotate credentials
5. **Document:** Post-mortem, lessons learned

---

## References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OAuth 2.0 Security Best Practices](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-security-topics)
- [JWT Best Practices](https://datatracker.ietf.org/doc/html/rfc8725)
- [CSP Quick Reference](https://content-security-policy.com/)

---

**Decision:** Defense in depth — kurzlebige Tokens, HttpOnly Cookies, Rate Limiting, CSP, Input Validation. Keine Shortcuts bei Security.
