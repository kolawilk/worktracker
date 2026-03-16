# Worktracker: Authentication & Database Architecture

> **Dokumenttyp:** Architektur-Spezifikation  
> **Status:** Draft  
> **Letzte Aktualisierung:** 2026-03-16  
> **Autor:** Maya (Architektin)

---

## 1. Tech-Stack Entscheidung

### 1.1 Authentication Provider

| Provider | Priorität | Begründung |
|----------|-----------|------------|
| **GitHub OAuth** | P0 (MVP) | Primäre Zielgruppe (Entwickler), einfache Integration, gut dokumentiert |
| **Apple Sign-In** | P0 (MVP) | iOS/macOS Nutzer, Compliance-Requirement für App Store |
| **Google OAuth** | P1 (Nice-to-have) | Breite Verbreitung, einfacher Onboarding für nicht-Dev Nutzer |

**Empfohlene Library:** [Lucia Auth](https://lucia-auth.com/) oder [NextAuth.js](https://next-auth.js.org/) (falls Next.js genutzt wird)

**Entscheidung:** Lucia Auth
- Framework-agnostic (funktioniert mit FastAPI, Express, etc.)
- Native Unterstützung für OAuth2 Provider
- Session-basiert + JWT für API-Zugriff
- Kein Vendor-Lock-in

### 1.2 Datenbank

| Option | Empfehlung | Begründung |
|--------|------------|------------|
| **PostgreSQL** | ✅ **Empfohlen** | ACID-Compliance, JSONB für Flexibilität, guter ORM-Support, skaliert |
| **SQLite** | ⚠️ MVP-Alternative | Zero-config, file-basiert, gut für lokale Entwicklung |

**Entscheidung:** PostgreSQL für Production, SQLite für lokale Entwicklung (optional)

**ORM:** [Prisma](https://www.prisma.io/) (TypeScript) oder [SQLAlchemy](https://www.sqlalchemy.org/) (Python)
- Prisma bevorzugt bei TypeScript-Stack
- Migration-System integriert
- Type-safe Queries

### 1.3 Gesamt-Stack

```
┌─────────────────────────────────────┐
│           Frontend (React)            │
│    - OAuth Redirect Handling          │
│    - Token Storage (httpOnly cookie)  │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│           Backend (FastAPI)         │
│    - Lucia Auth Integration         │
│    - JWT Middleware                 │
│    - Rate Limiting                  │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│         PostgreSQL + Redis          │
│    - User Data (PG)                 │
│    - Sessions/Rate Limit (Redis)    │
└─────────────────────────────────────┘
```

---

## 2. Datenbank-Schema

### 2.1 Entity Relationship Diagram (ERD)

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│    users    │       │  categories │       │ time_entries│
├─────────────┤       ├─────────────┤       ├─────────────┤
│ id (PK)     │◄──────┤ id (PK)     │◄──────┤ id (PK)     │
│ email       │       │ user_id(FK) │       │ user_id(FK) │
│ provider    │       │ name        │       │ category_id │
│ provider_id │       │ emoji       │       │ start_time  │
│ created_at  │       │ color       │       │ end_time    │
│ updated_at  │       │ created_at  │       │ duration    │
└─────────────┘       │ deleted_at  │       │ created_at  │
                      └─────────────┘       └─────────────┘
                             │
                             │
                      ┌──────▼──────┐
                      │  work_days  │
                      ├─────────────┤
                      │ id (PK)     │
                      │ user_id(FK) │
                      │ date        │
                      │ start_time  │
                      │ end_time    │
                      │ total_dur   │
                      │ created_at  │
                      └─────────────┘
```

### 2.2 SQL Schema (PostgreSQL)

```sql
-- Users Table
-- Speichert OAuth-User-Informationen
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    provider VARCHAR(50) NOT NULL,           -- 'github', 'apple', 'google'
    provider_id VARCHAR(255) NOT NULL,      -- ID vom OAuth Provider
    provider_data JSONB,                     -- Zusätzliche OAuth-Daten
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(provider, provider_id)           -- Ein User pro Provider-Kombination
);

-- Sessions Table (für Lucia Auth)
CREATE TABLE sessions (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Categories Table
-- Zeitkategorien pro User (z.B. "Meeting", "Coding", "Pause")
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    emoji VARCHAR(10),                      -- Unicode Emoji
    color VARCHAR(7) DEFAULT '#3B82F6',     -- Hex-Farbe (Tailwind-Style)
    sort_order INTEGER DEFAULT 0,          -- Für manuelle Sortierung
    is_default BOOLEAN DEFAULT FALSE,       -- System-Default-Kategorien
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,    -- Soft-Delete
    
    UNIQUE(user_id, name)                  -- Keine Duplikate pro User
);

-- Time Entries Table
-- Einzelne Zeiterfassungen
CREATE TABLE time_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,      -- NULL = läuft noch
    duration INTEGER,                       -- Sekunden, berechnet
    note TEXT,                              -- Optionaler Kommentar
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT valid_time_range CHECK (
        end_time IS NULL OR end_time > start_time
    )
);

-- Work Days Table
-- Tägliche Zusammenfassung (optional, für schnelle Statistiken)
CREATE TABLE work_days (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE,    -- Erster Eintrag des Tages
    end_time TIMESTAMP WITH TIME ZONE,      -- Letzter Eintrag des Tages
    total_duration INTEGER DEFAULT 0,       -- Summe aller Einträge (Sekunden)
    break_duration INTEGER DEFAULT 0,       -- Pausenzeit (Sekunden)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, date)
);

-- Indexes für Performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_provider ON users(provider, provider_id);
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_expires ON sessions(expires_at);
CREATE INDEX idx_categories_user_id ON categories(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_time_entries_user_id ON time_entries(user_id);
CREATE INDEX idx_time_entries_category ON time_entries(category_id);
CREATE INDEX idx_time_entries_range ON time_entries(user_id, start_time, end_time);
CREATE INDEX idx_work_days_user_date ON work_days(user_id, date);

-- Trigger für updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_time_entries_updated_at BEFORE UPDATE ON time_entries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_work_days_updated_at BEFORE UPDATE ON work_days
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 2.3 Default-Kategorien (bei User-Registrierung)

Jeder neue User bekommt automatisch:

| Name | Emoji | Farbe |
|------|-------|-------|
| Meeting | 📅 | #F59E0B (Amber) |
| Coding | 💻 | #3B82F6 (Blue) |
| Research | 🔍 | #8B5CF6 (Purple) |
| Break | ☕ | #10B981 (Green) |
| Admin | 📋 | #6B7280 (Gray) |

---

## 3. API-Endpunkte Übersicht

### 3.1 Base URL & Versionierung

```
Base: https://api.worktracker.app/v1
```

### 3.2 Authentication Endpoints

| Methode | Endpoint | Beschreibung | Auth |
|---------|----------|--------------|------|
| `GET` | `/auth/github` | GitHub OAuth Redirect | - |
| `GET` | `/auth/github/callback` | GitHub OAuth Callback | - |
| `GET` | `/auth/apple` | Apple Sign-In Redirect | - |
| `POST` | `/auth/apple/callback` | Apple Sign-In Callback | - |
| `POST` | `/auth/logout` | Logout (Session löschen) | ✅ |
| `GET` | `/auth/session` | Aktuelle Session abrufen | ✅ |
| `POST` | `/auth/refresh` | JWT Token refreshen | ✅ |

### 3.3 User Endpoints

| Methode | Endpoint | Beschreibung | Auth |
|---------|----------|--------------|------|
| `GET` | `/users/me` | Eigene User-Daten | ✅ |
| `PATCH` | `/users/me` | User-Daten aktualisieren | ✅ |
| `DELETE` | `/users/me` | Account löschen (GDPR) | ✅ |

### 3.4 Categories Endpoints

| Methode | Endpoint | Beschreibung | Auth |
|---------|----------|--------------|------|
| `GET` | `/categories` | Alle Kategorien des Users | ✅ |
| `POST` | `/categories` | Neue Kategorie erstellen | ✅ |
| `GET` | `/categories/:id` | Einzelne Kategorie | ✅ |
| `PATCH` | `/categories/:id` | Kategorie aktualisieren | ✅ |
| `DELETE` | `/categories/:id` | Kategorie soft-delete | ✅ |
| `POST` | `/categories/reorder` | Sortierung ändern | ✅ |

### 3.5 Time Entries Endpoints

| Methode | Endpoint | Beschreibung | Auth |
|---------|----------|--------------|------|
| `GET` | `/time-entries` | Einträge mit Filter (Datum, Kategorie) | ✅ |
| `POST` | `/time-entries` | Neuen Eintrag starten | ✅ |
| `GET` | `/time-entries/:id` | Einzelnen Eintrag abrufen | ✅ |
| `PATCH` | `/time-entries/:id` | Eintrag aktualisieren | ✅ |
| `DELETE` | `/time-entries/:id` | Eintrag löschen | ✅ |
| `POST` | `/time-entries/:id/stop` | Laufenden Eintrag stoppen | ✅ |
| `GET` | `/time-entries/running` | Aktuell laufenden Eintrag | ✅ |

**Query Parameters für `/time-entries`:**
- `start_date` (ISO 8601)
- `end_date` (ISO 8601)
- `category_id` (UUID)
- `limit` (default: 50, max: 200)
- `offset` (default: 0)

### 3.6 Work Days Endpoints

| Methode | Endpoint | Beschreibung | Auth |
|---------|----------|--------------|------|
| `GET` | `/work-days` | Tagesübersichten (Range) | ✅ |
| `GET` | `/work-days/:date` | Einzelner Tag | ✅ |
| `GET` | `/work-days/stats` | Statistiken (Woche/Monat) | ✅ |

### 3.7 Response Format

**Success (200):**
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "timestamp": "2026-03-16T10:30:00Z",
    "request_id": "uuid"
  }
}
```

**Error (4xx/5xx):**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Start time must be before end time",
    "field": "end_time",
    "request_id": "uuid"
  }
}
```

---

## 4. Security-Konzept

### 4.1 Authentication Flow

```
┌─────────┐                    ┌─────────┐                    ┌─────────┐
│  User   │───1. Click Login──►│ Frontend│───2. Redirect──────►│  OAuth  │
│         │                    │         │    (GitHub/Apple)  │ Provider│
└─────────┘                    └─────────┘                    └────┬────┘
     ▲                                                               │
     │                                                               │
     │                          3. Auth Success                      │
     │◄───────────────────────────(Callback)───────────────────────────┘
     │
     │  4. Backend validates code
     │  5. Creates/updates user
     │  6. Sets httpOnly session cookie
     │
┌────┴────┐
│ Backend │
│         │◄──7. API Requests with Session Cookie──┐
│  JWT    │                                        │
│  Auth   │───8. Protected Data Response───────────┘
└─────────┘
```

### 4.2 JWT Token Strategy

| Token | Speicherort | Lebensdauer | Zweck |
|-------|-------------|-------------|-------|
| **Session Cookie** | httpOnly, Secure, SameSite=Strict | 7 Tage | Authentifizierung |
| **Access Token** | Memory (Frontend) | 15 Minuten | API-Zugriff |
| **Refresh Token** | httpOnly Cookie | 7 Tage | Token-Renewal |

**Security Headers:**
```
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Content-Security-Policy: default-src 'self'
```

### 4.3 CSRF Protection

- **SameSite=Strict** Cookies (primary defense)
- **CSRF Token** für state-changing Operations (POST/PUT/DELETE)
- **Origin/Referer Header** Validation

### 4.4 Rate Limiting

| Endpoint | Limit | Window |
|----------|-------|--------|
| `/auth/*` | 5 requests | 1 Minute |
| `/auth/login` | 10 requests | 5 Minuten |
| API (authenticated) | 100 requests | 1 Minute |
| API (unauthenticated) | 20 requests | 1 Minute |

**Implementation:** Redis-basiert mit Sliding Window

### 4.5 Input Validation

- **Zod** (TypeScript) oder **Pydantic** (Python) für Schema-Validation
- **SQL Injection:** ORM/Parameterized Queries only
- **XSS:** Output encoding, CSP headers
- **NoSQL Injection:** Keine raw JSON-Queries

### 4.6 OAuth Security

- **PKCE** (Proof Key for Code Exchange) für mobile/SPA flows
- **State Parameter** gegen CSRF bei OAuth
- **Token Validation** (signature, expiry, issuer)
- **Scope Minimization** (nur `user:email` für GitHub)

### 4.7 Data Protection (GDPR)

- **Recht auf Vergessen:** `DELETE /users/me` löscht alle User-Daten
- **Datenexport:** `GET /users/me/export` (JSON Download)
- **Logging:** Keine PII in Logs (nur User-ID)
- **Encryption:**
  - At-rest: PostgreSQL encryption (TDE)
  - In-transit: TLS 1.3

---

## 5. Implementierungs-Roadmap

### Phase 1: Foundation (Woche 1-2)
**Ziel:** Grundlegende Auth & DB funktioniert

- [ ] PostgreSQL Setup (lokal + staging)
- [ ] Lucia Auth Integration
- [ ] GitHub OAuth Implementation
- [ ] Session Management (Cookies)
- [ ] Basis API-Struktur (FastAPI/Express)
- [ ] Datenbank-Migrations-System

**Deliverable:** Login/Logout funktioniert, User wird in DB angelegt

### Phase 2: Core Features (Woche 3-4)
**Ziel:** Zeiterfassung funktioniert

- [ ] Apple Sign-In Integration
- [ ] Categories CRUD API
- [ ] Time Entries CRUD API
- [ ] Running Timer (Start/Stop)
- [ ] Frontend Integration (Login-Flow)
- [ ] JWT Middleware für API

**Deliverable:** User kann Zeit tracken, Kategorien verwalten

### Phase 3: Security Hardening (Woche 5)
**Ziel:** Production-ready Security

- [ ] Rate Limiting implementieren
- [ ] CSRF Protection
- [ ] Security Headers
- [ ] Input Validation (Zod/Pydantic)
- [ ] Error Handling & Logging
- [ ] Security Audit (Dependency Check)

**Deliverable:** Security-Review bestanden

### Phase 4: Polish & Stats (Woche 6)
**Ziel:** Nutzbares MVP

- [ ] Work Days Aggregation
- [ ] Statistik-Endpunkte
- [ ] Google OAuth (optional)
- [ ] Daten-Export (GDPR)
- [ ] Account-Löschung
- [ ] Performance-Optimierung (Indexes)

**Deliverable:** MVP Release-fähig

### Phase 5: Production (Woche 7+)
**Ziel:** Live-Deployment

- [ ] Production DB Setup
- [ ] Redis für Sessions/Rate Limit
- [ ] SSL/TLS Certificates
- [ ] Monitoring & Alerts
- [ ] Backup-Strategie
- [ ] Dokumentation finalisieren

---

## 6. Offene Entscheidungen

| Thema | Optionen | Status |
|-------|----------|--------|
| Backend Framework | FastAPI (Python) vs Express (Node) | ⏳ Pending |
| Frontend Framework | React + Vite vs Next.js | ⏳ Pending |
| Hosting | Vercel + Railway vs Self-hosted | ⏳ Pending |
| Redis | Upstash vs Self-hosted | ⏳ Pending |

---

## 7. Appendix

### 7.1 OAuth Provider URLs

**GitHub:**
- Auth URL: `https://github.com/login/oauth/authorize`
- Token URL: `https://github.com/login/oauth/access_token`
- User Info: `https://api.github.com/user`
- Scopes: `user:email`

**Apple:**
- Auth URL: `https://appleid.apple.com/auth/authorize`
- Token URL: `https://appleid.apple.com/auth/token`
- Client Type: Service ID (not App ID for web)

**Google:**
- Auth URL: `https://accounts.google.com/o/oauth2/v2/auth`
- Token URL: `https://oauth2.googleapis.com/token`
- Scopes: `openid email profile`

### 7.2 Environment Variables

```bash
# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/worktracker"

# OAuth
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""
APPLE_CLIENT_ID=""
APPLE_CLIENT_SECRET=""  # Generated JWT
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# Auth
SESSION_SECRET=""  # 32+ bytes random
JWT_SECRET=""      # 32+ bytes random

# Redis (optional for dev)
REDIS_URL="redis://localhost:6379"

# App
APP_URL="http://localhost:3000"
API_URL="http://localhost:8000"
```

---

**🏗️ Architektur-Review:** Dieses Dokument sollte vor Implementierungs-Start vom Team reviewed werden.

**Nächster Schritt:** Tech-Stack finalisieren (Backend-Framework-Entscheidung) und Phase 1 Tasks erstellen.
