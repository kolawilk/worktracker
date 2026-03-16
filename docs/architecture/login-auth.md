# Login & Authentication Architecture

**Status:** ✅ Architecture Complete  
**Scope:** Social Login-System für WorkTracker

---

## Overview

Passwordless-first Authentication mit Social Logins als primärer Login-Methode. Keine klassische Passwort-Registrierung — nur OAuth/Social Sign-In.

## Supported Providers

| Provider | Use Case | Priority |
|----------|----------|----------|
| **GitHub OAuth** | Dev-Users, primärer Fokus | P1 |
| **Apple Sign-In** | iOS/macOS Users, Privacy | P1 |
| **Google OAuth** | Universal fallback | P2 |

## OAuth 2.0 + PKCE Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Client    │────▶│   Backend   │────▶│   OAuth     │────▶│   User      │
│  (Browser)  │◀────│   (FastAPI) │◀────│   Provider  │◀────│   Auth      │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
      │                   │                   │
      │ 1. /auth/{provider}/login            │
      │─────────────────────────────────────▶│
      │                   │                   │
      │ 2. Redirect to OAuth Provider        │
      │◀─────────────────────────────────────│
      │                   │                   │
      │ 3. User authenticates                │
      │─────────────────────────────────────▶│
      │                   │                   │
      │ 4. Callback with code                │
      │─────────────────────────────────────▶│
      │                   │                   │
      │ 5. Exchange code for tokens          │
      │                   │───────────────────▶│
      │                   │                   │
      │ 6. Provider user info                  │
      │                   │◀───────────────────│
      │                   │                   │
      │ 7. Create/Update user + JWT pair       │
      │◀─────────────────────────────────────│
```

## Token Strategy

### Access Token (JWT)
- **Lifetime:** 15 minutes
- **Storage:** Memory (React Context/Zustand)
- **Contains:** user_id, email, provider, iat, exp
- **Algorithm:** RS256 (asymmetric) oder HS256 (symmetric für MVP)

### Refresh Token
- **Lifetime:** 7 days
- **Storage:** HttpOnly Secure Cookie
- **Database:** Stored hashed (SHA-256) mit user_id + device fingerprint
- **Rotation:** Single-use, neue Refresh Token bei jedem Refresh

### Token Response
```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIs...",
  "token_type": "Bearer",
  "expires_in": 900,
  "refresh_token": "dGhpcyBpcyBhIHJlZnJlc2g..."
}
```

## User Identity Model

```python
class UserIdentity:
    id: UUID                    # Internal ID
    email: str                  # Normalized email
    provider: str               # "github" | "apple" | "google"
    provider_user_id: str       # Provider-specific ID
    provider_data: JSON         # Raw OAuth response (optional)
    created_at: datetime
    last_login_at: datetime
    is_active: bool
```

### Identity Resolution Strategy

1. **Primary Key:** UUID (intern)
2. **Unique Constraint:** (provider, provider_user_id)
3. **Email Handling:** 
   - Same email across providers = separate accounts (keine Auto-Linking)
   - User kann später explizit verbinden (Future Feature)
   - Email-Änderungen: Update auf User, nicht neuer Account

## OAuth Provider Config

### GitHub OAuth
```yaml
authorize_url: https://github.com/login/oauth/authorize
token_url: https://github.com/login/oauth/access_token
userinfo_url: https://api.github.com/user
scopes:
  - read:user
  - user:email
```

### Apple Sign-In
```yaml
authorize_url: https://appleid.apple.com/auth/authorize
token_url: https://appleid.apple.com/auth/token
scopes:
  - name
  - email
# Note: Apple liefert Email nur beim ersten Login!
```

### Google OAuth
```yaml
authorize_url: https://accounts.google.com/o/oauth2/v2/auth
token_url: https://oauth2.googleapis.com/token
userinfo_url: https://www.googleapis.com/oauth2/v2/userinfo
scopes:
  - openid
  - email
  - profile
```

## Security Considerations

### PKCE (Proof Key for Code Exchange)
- **State:** Cryptographically random, 32+ bytes
- **Code Verifier:** 128 chars, stored in session/cookie
- **Code Challenge:** S256(Code Verifier)

### CSRF Protection
- State parameter in OAuth flow
- Double-submit cookie pattern für API calls
- Origin/Referrer validation

### Session Security
- HttpOnly, Secure, SameSite=Strict cookies
- Device fingerprinting (User-Agent + IP Hash)
- Concurrent session limit (optional)

## Error Handling

| Error | HTTP | Response |
|-------|------|----------|
| Invalid code | 400 | `{ "error": "invalid_grant" }` |
| Provider error | 502 | `{ "error": "provider_error" }` |
| Email required | 400 | `{ "error": "email_required" }` |
| Account disabled | 403 | `{ "error": "account_disabled" }` |

## Implementation Notes

### Backend (FastAPI)
- `authlib` für OAuth client management
- `python-jose` für JWT handling
- `itsdangerous` für token signing (optional)

### Frontend (React)
- Popup/Redirect flow für OAuth
- Token refresh on 401
- Automatic logout on refresh failure

### Environment Variables
```bash
# GitHub
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

# Apple
APPLE_CLIENT_ID=
APPLE_TEAM_ID=
APPLE_KEY_ID=
APPLE_PRIVATE_KEY=

# Google
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# JWT
JWT_SECRET_KEY=           # For HS256
JWT_PRIVATE_KEY=          # For RS256 (PEM)
JWT_PUBLIC_KEY=           # For RS256 (PEM)
JWT_ALGORITHM=HS256       # or RS256

# App
FRONTEND_URL=http://localhost:5173
```

## Future Enhancements

- [ ] Account linking (merge same-email accounts)
- [ ] MFA/2FA für sensitive operations
- [ ] Session management UI ("Log out all devices")
- [ ] Magic Link Login (Email-based, passwordless)

---

**Decision:** PKCE + JWT + HttpOnly Refresh Token. Social-only, kein Passwort-Handling nötig.
