# Bug: Nach Tag-Beendigung können Kategorien getrackt werden

**Status:** 📋 Backlog  
**Priority:** P1  
**Type:** Bug

---

## Problem
Wenn der Tag beendet ist, können trotzdem noch Kategorien getrackt werden.

## Erwartetes Verhalten
- **Tag beendet** = Kein Tracking mehr möglich
- Kategorien sind nicht klickbar oder Tracking startet nicht
- Wenn weitergearbeitet werden soll:
  - Explizit "Tag fortsetzen" über Header
  - Dann erst wieder Tracking möglich

## Tatsächliches Verhalten
- Tag ist beendet
- Aber Kategorien können trotzdem angetippt/getrackt werden
- Inkonsistenter Zustand

## Betroffene Komponenten
- `src/components/category/CategoryCard.tsx`
- `src/stores/trackingStore.ts`
- `src/stores/workDayStore.ts`
- Synchronisation zwischen Stores

## Akzeptanzkriterien
- [ ] Bei beendetem Tag: Kein Kategorie-Tracking möglich
- [ ] Kategorien sind visuell als "nicht verfügbar" markiert
- [ ] Nur nach "Fortsetzen" wieder Tracking möglich
- [ ] Klare Unterscheidung: Beendet vs. Pausiert vs. Aktiv

---

**Created:** 2026-03-16
**Reporter:** larskrachen
**Related:** bug-after-day-end-text-and-button.md
