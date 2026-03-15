# Task A: WorkDay Store erstellen

**Status:** 📋 Backlog → Active  
**Priority:** P0  
**Parent Feature:** Feature 004 - Arbeitstag-Steuerung

---

## Beschreibung
Erstelle den Zustand-Store für Arbeitstage mit Start, Pause, Ende und Pausenzeit.

## Anforderungen

### Datenmodell (WorkDay)
```typescript
interface WorkDay {
  date: string;              // "2026-03-15"
  startTime: string | null;  // ISO timestamp
  endTime: string | null;    // null = läuft noch
  isPaused: boolean;
  pauseStart: string | null; // ISO timestamp
  totalPauseMinutes: number;
}
```

### Store-Funktionen
- `startWorkDay()` — Startet neuen Arbeitstag
- `pauseWorkDay()` — Pausiert den Tag
- `resumeWorkDay()` — Setzt fort
- `endWorkDay()` — Beendet den Tag
- `getCurrentWorkDay()` — Gibt aktuellen Tag zurück
- `getTotalWorkTime()` — Berechnet Gesamtzeit (ohne Pausen)
- `getPauseTime()` — Berechnet Pausenzeit

### Persistenz
- LocalStorage mit Zustand persist middleware
- Key: `worktracker-workday`

## Akzeptanzkriterien
- [ ] Store erstellt mit allen Funktionen
- [ ] TypeScript strict mode, keine `any`
- [ ] LocalStorage Persistenz funktioniert
- [ ] Zeitberechnung ist korrekt
- [ ] npm run build ohne Fehler

---

**Created:** 2026-03-15  
**Story Points:** 3
