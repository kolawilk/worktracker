# 🚨 P0: Zeit im Header springt falsch

**Status:** 📋 Backlog  
**Priority:** P0 (Kritisch)  
**Type:** Bug

---

## Problem
Die Zeit im Header ist während des Trackings auf 0:23 gesprungen, obwohl noch unter 1 Minute getracked wurde.

## Beobachtung
- Tracking läuft (< 1 Min)
- Header zeigt plötzlich 0:23
- Nach Stop der Kategorie: Header zeigt korrekte Zeit (1:20)

## Vermutete Ursache
- Zeitberechnung im Header hat Bug
- Millisekunden/Sekunden Konversion?
- State-Update-Problem?

## Betroffene Dateien
- `src/components/workday/WorkDayTimer.tsx`
- `src/stores/workDayStore.ts`

---

**Created:** 2026-03-16
**Reporter:** larskrachen
