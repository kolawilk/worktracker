# Feature: Dashboard mit Tracking-Kacheln

**Status:** 📋 Backlog  
**Priority:** P0 (Kern-Feature)  
**Assignee:** ACP-Subagent

---

## Beschreibung
Haupt-Dashboard zeigt alle Kategorien als große, tippbare Kacheln. Eine aktive Kachel zeigt die laufende Zeit an.

## Akzeptanzkriterien

- [ ] Grid-Layout mit großen Kacheln (2-3 pro Reihe auf iPad)
- [ ] Jede Kachel zeigt: Emoji (groß), Name, aktive Zeit (falls tracking)
- [ ] Kachel-Tap startet Tracking für diese Kategorie
- [ ] Aktive Kachel ist visuell hervorgehoben (Animation/Farbe)
- [ ] Wechsel zu anderer Kategorie stoppt aktives Tracking, startet neues
- [ ] "Keine Kategorie"-Option für unproduktive Zeit

## UI/UX Anforderungen

- Mindestens 120x120px pro Kachel (fette Finger)
- Aktive Kachel: Subtile Pulse-Animation oder Farbwechsel
- Zeit-Anzeige: MM:SS oder HH:MM je nach Dauer
- Übersichtlich auch bei 10+ Kategorien

## Technische Details

- State: `activeCategoryId: string | null`
- Timer: `setInterval` für UI-Update (nicht für Persistenz)
- Zeit wird bei State-Change gespeichert (nicht jede Sekunde)

## Definition of Done
- [ ] Alle Kategorien werden angezeigt
- [ ] Tracking startet/stoppt korrekt
- [ ] Zeit-Anzeige aktualisiert live
- [ ] Screenshots vom UI im PR
- [ ] Code Review bestanden

---

**Created:** 2026-03-15  
**Story Points:** 5
