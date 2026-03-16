# Bug: Pause-Button ohne Funktion

**Status:** 📋 Backlog  
**Priority:** P1  
**Type:** Bug

---

## Problem
Der Pause-Button im Header ist nicht klickbar/funktioniert nicht.

## Situation
- Kategorie ausgewählt
- Tracking läuft
- Pause-Button lässt sich nicht drücken

## Erwartetes Verhalten

### Bei Pause:
- [ ] Zeit-Tracking wird pausiert
- [ ] Kategorie wird nicht mehr als "aktiv" angezeigt
- [ ] Pause-Button wird zu Play-Symbol
- [ ] Gesamtzeit läuft nicht weiter

### Fortsetzen Option 1 (Neue Kategorie):
- [ ] Nutzer wählt beliebige Kategorie
- [ ] Tracking für gewählte Kategorie startet
- [ ] Vorherige Kategorie wird beendet

### Fortsetzen Option 2 (Selbe Kategorie):
- [ ] Nutzer drückt Play-Button im Header
- [ ] Vorherige Kategorie wird wieder aktiv
- [ ] Tracking wird fortgesetzt

## Tatsächliches Verhalten
- Pause-Button nicht klickbar
- Keine Pause-Funktion verfügbar

## Betroffene Komponenten
- `src/components/workday/WorkDayControls.tsx`
- `src/stores/workDayStore.ts`
- `src/stores/trackingStore.ts`

## Akzeptanzkriterien
- [ ] Pause-Button ist klickbar
- [ ] Pause pausiert Tracking korrekt
- [ ] Play-Button erscheint bei Pause
- [ ] Beide Fortsetzen-Optionen funktionieren

---

**Created:** 2026-03-16
**Reporter:** larskrachen
