# 🏗️ Worktracker — Architecture Decision Records

## ADR-001: Tech-Stack Auswahl

**Status:** ✅ Accepted  
**Date:** 2026-03-15

### Context
Web-App für iPad, AlwaysOn, minimaler Energieverbrauch. Chef möchte shadcn/ui.

### Decision
- **Framework:** React 18+ mit TypeScript (strict mode)
- **Build Tool:** Vite (schneller HMR, optimiertes Bundle)
- **Styling:** Tailwind CSS (utility-first, konsistent)
- **UI Library:** shadcn/ui (vom Chef gewünscht, gute DX)
- **State Management:** Zustand (leichtgewichtig, persistierbar)
- **Storage (MVP):** LocalStorage (einfach, offline-fähig)

### Consequences
- ✅ Schnelle Entwicklung durch shadcn/ui
- ✅ Type-Safety durch TypeScript
- ✅ Einfacher Wechsel zu Server-Storage später möglich
- ⚠️ LocalStorage hat 5MB Limit (für MVP ausreichend)

---

## ADR-002: State Management Strategie

**Status:** ✅ Accepted  
**Date:** 2026-03-15

### Context
Mehrere Zustände: Kategorien, aktive Tracking-Session, Zeit-Einträge, UI-Preferences.

### Decision
- **Zustand** für globalen State mit Persistence-Middleware
- **React Context** nur für Theme (Dark/Light/System)
- **LocalStorage** als Persistenz-Layer (MVP)

### State Slices
1. `categories` — Kategorie-Definitionen (Name, Emoji, Farbe)
2. `tracking` — Aktive Session, aktuelle Kategorie, Pausen-Status
3. `entries` — Zeit-Einträge (Start, Ende, Kategorie-ID)
4. `settings` — Theme, Wochenstart, etc.

---

## ADR-003: Datenmodell

**Status:** ✅ Accepted  
**Date:** 2026-03-15

### Category
```typescript
interface Category {
  id: string;           // UUID
  name: string;         // "Produktive Arbeit"
  emoji: string;        // "💻"
  color?: string;       // Tailwind color class
  createdAt: Date;
}
```

### TimeEntry
```typescript
interface TimeEntry {
  id: string;           // UUID
  categoryId: string;   // Ref zu Category
  startTime: Date;      // ISO String
  endTime: Date | null; // null = läuft noch
  date: string;         // "2026-03-15" für einfache Queries
}
```

### WorkDay
```typescript
interface WorkDay {
  date: string;         // "2026-03-15"
  startTime: Date;
  endTime: Date | null;
  isPaused: boolean;
  pauseStart: Date | null;
  totalPauseMinutes: number;
}
```

---

## ADR-004: iPad & AlwaysOn Optimierungen

**Status:** ✅ Accepted  
**Date:** 2026-03-15

### Context
App soll immer an sein, aber Batterie schonen.

### Decision
- **No Sleep:** `noSleep.js` oder Screen Wake Lock API
- **Minimal Re-Renders:** React.memo für Kacheln
- **Keine Animationen:** Subtile Transitions nur bei State-Change
- **Dark Mode Default:** Spart Energie auf OLED-iPads
- **Kein Polling:** Event-driven Updates statt Interval

---

## ADR-005: Theme-System

**Status:** ✅ Accepted  
**Date:** 2026-03-15

### Decision
- **Three Modes:** Light | Dark | System
- **shadcn/ui** CSS Variables für konsistente Farben
- **LocalStorage** für Theme-Preference
- **System-Detection:** `prefers-color-scheme` Media Query

---

## ADR-006: Build & Deployment

**Status:** ✅ Accepted  
**Date:** 2026-03-15

### Decision
- **Vite** für Development & Production Build
- **GitHub Pages** für MVP-Hosting (kostenlos, einfach)
- **GitHub Actions** für Auto-Deploy bei Push auf main
- **PWA** später (Service Worker, Manifest)

---

## Offene Entscheidungen

- [ ] Charting Library für Auswertungen (Recharts? Chart.js?)
- [ ] Date-Funktionen (date-fns vs dayjs vs native)
- [ ] Testing Strategy (Vitest + React Testing Library?)
