# Database Schema

**Status:** ✅ Schema Complete  
**Database:** PostgreSQL 15+  
**ORM:** SQLAlchemy 2.0 (async)

---

## Schema Overview

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│    users    │◀────│  categories │◀────│ time_entries│     │  work_days  │
│             │     │             │     │             │     │             │
│  id (PK)    │     │  id (PK)    │     │  id (PK)    │     │  id (PK)    │
│  email      │     │  user_id FK │     │  user_id FK │     │  user_id FK │
│  provider   │     │  name       │     │  category_id│     │  date       │
│  created_at │     │  emoji      │     │  start_time │     │  start_time │
└─────────────┘     │  color      │     │  end_time   │     │  end_time   │
                    │  deleted_at │     │  duration   │     │  duration   │
                    └─────────────┘     │  note       │     └─────────────┘
                                          └─────────────┘
                           ┌─────────────┐
                           │refresh_tokens│
                           │             │
                           │ id (PK)     │
                           │ user_id FK  │
                           │ token_hash  │
                           │ expires_at  │
                           │ created_at  │
                           └─────────────┘
```

---

## Tables

### users

Core user identity table. Eine Zeile pro Social-Login-Kombination.

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL,
    provider VARCHAR(50) NOT NULL CHECK (provider IN ('github', 'apple', 'google')),
    provider_user_id VARCHAR(255) NOT NULL,
    provider_data JSONB DEFAULT NULL,  -- Raw OAuth response, optional
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_login_at TIMESTAMPTZ,
    
    CONSTRAINT uq_provider_user UNIQUE (provider, provider_user_id)
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_provider ON users(provider);
```

**Rationale:**
- `provider_user_id` als String — Provider-IDs variieren in Format
- `provider_data` als JSONB — flexible Speicherung, GIN-Index möglich
- Kein `password_hash` — Social-only, kein Passwort

---

### refresh_tokens

Refresh Token Storage für JWT Rotation.

```sql
CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(64) NOT NULL,  -- SHA-256 hash
    device_fingerprint VARCHAR(64),   -- Optional: User-Agent + IP hash
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    revoked_at TIMESTAMPTZ,           -- NULL = active
    replaced_by UUID REFERENCES refresh_tokens(id)  -- Token rotation chain
);

CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_hash ON refresh_tokens(token_hash);
CREATE INDEX idx_refresh_tokens_expires ON refresh_tokens(expires_at) 
    WHERE revoked_at IS NULL;
```

**Rationale:**
- Token wird gehasht gespeichert (nicht plaintext)
- `device_fingerprint` für Security-Monitoring
- `replaced_by` für Audit-Trail bei Rotation

---

### categories

Zeiterfassungs-Kategorien pro User (z.B. "Meeting", "Coding", "Pause").

```sql
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    emoji VARCHAR(10) DEFAULT '⏱️',   -- Unicode emoji
    color VARCHAR(7) DEFAULT '#3B82F6', -- Hex color (#RRGGBB)
    sort_order INTEGER DEFAULT 0,
    is_default BOOLEAN DEFAULT FALSE,  -- Eine Default-Kategorie pro User
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ             -- Soft delete
);

CREATE INDEX idx_categories_user ON categories(user_id);
CREATE INDEX idx_categories_user_sort ON categories(user_id, sort_order) 
    WHERE deleted_at IS NULL;

-- Constraint: Nur eine Default-Kategorie pro User
CREATE UNIQUE INDEX idx_categories_user_default ON categories(user_id) 
    WHERE is_default = TRUE;
```

**Rationale:**
- Soft delete statt Hard delete — referentielle Integrität für alte Entries
- `sort_order` für UI-Drag-Drop-Reihenfolge
- `is_default` für neue TimeEntries ohne explizite Kategorie

---

### time_entries

Einzelne Zeiterfassungs-Einträge.

```sql
CREATE TABLE time_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ,               -- NULL = running
    duration INTEGER,                   -- Sekunden, berechnet
    note TEXT,                          -- Optional description
    is_running BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_time_entries_user ON time_entries(user_id);
CREATE INDEX idx_time_entries_user_time ON time_entries(user_id, start_time);
CREATE INDEX idx_time_entries_running ON time_entries(user_id) 
    WHERE is_running = TRUE;
CREATE INDEX idx_time_entries_category ON time_entries(category_id);
```

**Rationale:**
- `duration` als Integer (Sekunden) — einfache Berechnung, keine Zeitzone-Probleme
- `is_running` Flag für aktive Timer — max. einer pro User
- `end_time` NULL = Timer läuft noch

---

### work_days

Tägliche Zusammenfassung (optional, für schnelle Reports).

```sql
CREATE TABLE work_days (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    start_time TIMESTAMPTZ,             -- Erster Entry des Tages
    end_time TIMESTAMPTZ,               -- Letzter Entry des Tages
    total_duration INTEGER DEFAULT 0,   -- Summe aller Entries (Sekunden)
    break_duration INTEGER DEFAULT 0,   -- Pausen (manuell oder berechnet)
    entry_count INTEGER DEFAULT 0,      -- Anzahl TimeEntries
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT uq_work_days_user_date UNIQUE (user_id, date)
);

CREATE INDEX idx_work_days_user ON work_days(user_id);
CREATE INDEX idx_work_days_user_date ON work_days(user_id, date);
```

**Rationale:**
- Materialized View-Alternative — wird via Trigger aktualisiert
- Ermöglicht schnelle Dashboard-Queries ohne Aggregation
- `break_duration` für Compliance (z.B. 30min Pause bei 6h+)

---

## Constraints & Business Rules

### Check Constraints

```sql
-- TimeEntries: end_time muss nach start_time sein
ALTER TABLE time_entries ADD CONSTRAINT chk_time_order 
    CHECK (end_time IS NULL OR end_time > start_time);

-- WorkDays: end_time muss nach start_time sein (wenn beide gesetzt)
ALTER TABLE work_days ADD CONSTRAINT chk_workday_time_order 
    CHECK (end_time IS NULL OR start_time IS NULL OR end_time >= start_time);

-- Categories: Valid hex color format
ALTER TABLE categories ADD CONSTRAINT chk_hex_color 
    CHECK (color ~ '^#[0-9A-Fa-f]{6}$');
```

### Triggers

```sql
-- Auto-update updated_at
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

-- WorkDays: Auto-aggregate from TimeEntries
CREATE OR REPLACE FUNCTION update_work_day_summary()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert or update work_days for the affected date
    INSERT INTO work_days (user_id, date, start_time, end_time, total_duration, entry_count)
    SELECT 
        user_id,
        DATE(start_time) as date,
        MIN(start_time) as start_time,
        MAX(end_time) as end_time,
        COALESCE(SUM(duration), 0) as total_duration,
        COUNT(*) as entry_count
    FROM time_entries
    WHERE user_id = NEW.user_id AND DATE(start_time) = DATE(NEW.start_time)
    GROUP BY user_id, DATE(start_time)
    ON CONFLICT (user_id, date) DO UPDATE SET
        start_time = EXCLUDED.start_time,
        end_time = EXCLUDED.end_time,
        total_duration = EXCLUDED.total_duration,
        entry_count = EXCLUDED.entry_count,
        updated_at = NOW();
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_work_day_after_entry 
    AFTER INSERT OR UPDATE OR DELETE ON time_entries
    FOR EACH ROW EXECUTE FUNCTION update_work_day_summary();
```

---

## SQLAlchemy Models (Reference)

```python
from sqlalchemy import (
    Column, String, DateTime, Boolean, Integer, 
    ForeignKey, Text, Date, Index, UniqueConstraint
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import declarative_base, relationship
from sqlalchemy.sql import func
import uuid

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), nullable=False, index=True)
    provider = Column(String(50), nullable=False)
    provider_user_id = Column(String(255), nullable=False)
    provider_data = Column(JSONB)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    last_login_at = Column(DateTime(timezone=True))
    
    # Relationships
    categories = relationship("Category", back_populates="user", cascade="all, delete-orphan")
    time_entries = relationship("TimeEntry", back_populates="user", cascade="all, delete-orphan")
    refresh_tokens = relationship("RefreshToken", back_populates="user", cascade="all, delete-orphan")
    
    __table_args__ = (
        UniqueConstraint('provider', 'provider_user_id', name='uq_provider_user'),
    )

class RefreshToken(Base):
    __tablename__ = "refresh_tokens"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    token_hash = Column(String(64), nullable=False, index=True)
    device_fingerprint = Column(String(64))
    expires_at = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    revoked_at = Column(DateTime(timezone=True))
    replaced_by = Column(UUID(as_uuid=True), ForeignKey("refresh_tokens.id"))
    
    user = relationship("User", back_populates="refresh_tokens")

class Category(Base):
    __tablename__ = "categories"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(100), nullable=False)
    emoji = Column(String(10), default='⏱️')
    color = Column(String(7), default='#3B82F6')
    sort_order = Column(Integer, default=0)
    is_default = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    deleted_at = Column(DateTime(timezone=True))
    
    user = relationship("User", back_populates="categories")
    time_entries = relationship("TimeEntry", back_populates="category")
    
    __table_args__ = (
        Index('idx_categories_user_sort', 'user_id', 'sort_order', 
              postgresql_where=Column('deleted_at').is_(None)),
    )

class TimeEntry(Base):
    __tablename__ = "time_entries"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    category_id = Column(UUID(as_uuid=True), ForeignKey("categories.id", ondelete="SET NULL"))
    start_time = Column(DateTime(timezone=True), nullable=False)
    end_time = Column(DateTime(timezone=True))
    duration = Column(Integer)  # seconds
    note = Column(Text)
    is_running = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    user = relationship("User", back_populates="time_entries")
    category = relationship("Category", back_populates="time_entries")
    
    __table_args__ = (
        Index('idx_time_entries_running', 'user_id', 
              postgresql_where=Column('is_running').is_(True)),
        CheckConstraint('end_time IS NULL OR end_time > start_time', 
                       name='chk_time_order'),
    )

class WorkDay(Base):
    __tablename__ = "work_days"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    date = Column(Date, nullable=False)
    start_time = Column(DateTime(timezone=True))
    end_time = Column(DateTime(timezone=True))
    total_duration = Column(Integer, default=0)
    break_duration = Column(Integer, default=0)
    entry_count = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    user = relationship("User")
    
    __table_args__ = (
        UniqueConstraint('user_id', 'date', name='uq_work_days_user_date'),
    )
```

---

## Migration Strategy

**Tool:** Alembic (SQLAlchemy migrations)

```bash
# Initial setup
alembic init migrations

# Create migration
alembic revision --autogenerate -m "create initial schema"

# Apply
alembic upgrade head

# Rollback
alembic downgrade -1
```

---

## Performance Considerations

1. **Indexes:** Alle Foreign Keys + häufige Query-Patterns
2. **Partitioning:** `time_entries` kann später by `user_id` oder `start_time` partitioniert werden
3. **Archivierung:** Alte Entries (>2 Jahre) können in separate Tabelle verschoben werden
4. **Connection Pooling:** `asyncpg` mit `pool_size=20` für Production

---

**Decision:** PostgreSQL mit SQLAlchemy 2.0 async. Soft deletes für Categories, materialized WorkDays für schnelle Reports.
