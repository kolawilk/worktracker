# Bug: Nach Tag-Beendigung - Text falsch + Start-Button nicht klickbar

**Status:** ✅ Done  
**Priority:** P1  
**Type:** Bug

---

## Problem 1: Text macht keinen Sinn
Nach Beendigung des Tages steht im Header: "Klicke Start für neuen Tag"

Das ist falsch, weil:
- Wenn man am **gleichen Tag** ist → Tracking sollte für diesen Tag fortgesetzt werden
- Nicht unbedingt ein "neuer Tag"

## Problem 2: Start-Button nicht klickbar
Der Start-Button nach Beendigung des Tages ist nicht klickbar.

## Erwartetes Verhalten
- Klare Unterscheidung: Neuer Tag vs. gleicher Tag fortsetzen
- Start-Button ist klickbar und funktioniert
- Logik für "neuer Tag" vs. "Fortsetzen" ist korrekt

## Betroffene Komponenten
- `src/components/workday/WorkDayControls.tsx`
- `src/components/workday/WorkDayTimer.tsx`
- `src/stores/workDayStore.ts`

## Akzeptanzkriterien
- [x] Text ist korrekt (unterscheidet neu/fortsetzen)
- [x] Start-Button ist klickbar nach Beendigung
- [x] Logik für Tag-Wechsel ist korrekt implementiert

---

**Created:** 2026-03-16
**Reporter:** larskrachen
