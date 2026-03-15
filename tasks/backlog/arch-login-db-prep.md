# Architektur: Login & Datenbank Vorbereitung

**Status:** 📋 Backlog  
**Priority:** P3 (Vorbereitung)  
**Parent:** Infrastructure

---

## Ziel
Technische und architektonische Voraussetzungen für Login-System und Datenbank schaffen — **noch nicht implementieren**, nur vorbereiten.

## Anforderungen

### Social Logins
- GitHub OAuth
- Apple Sign-In
- Evtl. Google OAuth

### Security Best Practices
- JWT Tokens mit Refresh
- HTTPS enforced
- CSRF Protection
- Rate Limiting
- Passwordless/Social first

### Datenbank
- PostgreSQL (empfohlen) oder SQLite für MVP
- Schema-Design für:
  - Users (id, email, provider, provider_id, created_at)
  - Categories (id, user_id, name, emoji, color, created_at, deleted_at)
  - TimeEntries (id, user_id, category_id, start_time, end_time, duration)
  - WorkDays (id, user_id, date, start_time, end_time, total_duration)

### API Design
- RESTful API
- Versionierung (v1/)
- Authentication Middleware
- Error Handling

## Akzeptanzkriterien (Vorbereitung)
- [ ] Architektur-Dokumentation erstellt
- [ ] Datenbank-Schema designed
- [ ] API-Endpunkte geplant
- [ ] Security-Konzept dokumentiert
- [ ] Tech-Stack entschieden (Auth-Provider, DB, etc.)

**NICHT implementieren** — nur vorbereiten!

---

**Created:** 2026-03-15
