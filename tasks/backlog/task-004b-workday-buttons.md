# Task B: Arbeitstag-Buttons

**Status:** 📋 Backlog  
**Priority:** P0  
**Parent Feature:** Feature 004 - Arbeitstag-Steuerung
**Depends on:** Task A (WorkDay Store)

---

## Beschreibung
Erstelle die Buttons für Arbeitstag-Steuerung (Start, Pause, Weiter, Ende).

## UI-Komponenten

### WorkDayControls.tsx
- **Start-Button:** Zeigt sich nur wenn kein Tag läuft
- **Pause-Button:** Zeigt sich wenn Tag läuft
- **Weiter-Button:** Zeigt sich wenn pausiert
- **Ende-Button:** Zeigt sich immer wenn Tag gestartet

### Status-Anzeige
- "Arbeitstag nicht gestartet"
- "Arbeitstag läuft" (grün)
- "Pausiert" (gelb)
- "Arbeitstag beendet" (grau)

## Design
- Große, tippbare Buttons (iPad-optimiert)
- Farbcodierung: Grün (läuft), Gelb (pausiert), Grau (beendet)
- shadcn/ui Button Komponenten

## Akzeptanzkriterien
- [ ] Buttons korrekt anzeigen je nach Status
- [ ] Click-Handler funktionieren
- [ ] Status wird visuell korrekt dargestellt
- [ ] Keine TypeScript Fehler

---

**Created:** 2026-03-15  
**Story Points:** 3
