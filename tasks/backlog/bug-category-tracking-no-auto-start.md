# Bug: Kategorie-Tracking startet Arbeitstag nicht automatisch

**Status:** 📋 Backlog  
**Priority:** P1  
**Type:** Bug

---

## Problem
Wenn man eine Kategorie antippt (ohne vorher den Arbeitstag über das Play-Symbol gestartet zu haben), startet der Arbeitstag nicht automatisch mit.

## Erwartetes Verhalten
- Antippen einer Kategorie sollte automatisch den Arbeitstag starten (falls nicht bereits gestartet)
- Zeit-Tracking für die Kategorie beginnt sofort

## Tatsächliches Verhalten
- Arbeitstag startet nicht automatisch
- Kategorie-Tracking beginnt möglicherweise nicht oder funktioniert nicht korrekt

## Betroffene Komponenten
- `src/components/category/CategoryCard.tsx`
- `src/stores/trackingStore.ts`
- `src/stores/workDayStore.ts`

## Akzeptanzkriterien
- [ ] Antippen einer Kategorie startet Arbeitstag automatisch (falls nicht gestartet)
- [ ] Zeit wird korrekt für beides getrackt
- [ ] Keine doppelte Zeit-Erfassung

---

**Created:** 2026-03-16
**Reporter:** larskrachen
