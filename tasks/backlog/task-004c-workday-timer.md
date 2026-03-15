# Task C: Zeit-Anzeige Komponente

**Status:** 📋 Backlog  
**Priority:** P0  
**Parent Feature:** Feature 004 - Arbeitstag-Steuerung
**Depends on:** Task A (WorkDay Store)

---

## Beschreibung
Erstelle die Anzeige für Gesamt-Arbeitszeit und Pausenzeit.

## UI-Komponenten

### WorkDayTimer.tsx
- **Gesamtzeit:** HH:MM:SS Format
- **Pausenzeit:** MM:SS Format (nur wenn > 0)
- **Aktive Zeit:** Gesamtzeit minus Pausenzeit
- Live-Update jede Sekunde

### Anzeige-Format
- Große, gut lesbare Zahlen
- Icons für Zeittypen (⏱️ Gesamt, ☕ Pause)
- Responsive für iPad

## Akzeptanzkriterien
- [ ] Zeit wird live aktualisiert
- [ ] Format ist lesbar (HH:MM:SS)
- [ ] Pausenzeit wird korrekt berechnet
- [ ] Keine TypeScript Fehler

---

**Created:** 2026-03-15  
**Story Points:** 2
