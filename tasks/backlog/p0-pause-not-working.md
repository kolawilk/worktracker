# 🚨 P0: Pause funktioniert nicht

**Status:** 📋 Backlog  
**Priority:** P0 (Kritisch)  
**Type:** Bug

---

## Problem
Wenn eine Kategorie gestoppt wird (keine Kategorie mehr aktiv), wird die Zeit im Header NICHT pausiert.

## Beobachtung
- Kategorie-Tracking stoppen
- Header-Zeit läuft weiter
- Neue Kategorie starten → Zeit springt (wurde nicht pausiert)

## Erwartet
- Keine aktive Kategorie → Header-Zeit pausiert
- Neue Kategorie → Zeit läuft weiter

## Betroffene Dateien
- `src/stores/syncStore.ts`
- `src/stores/workDayStore.ts`
- `src/stores/trackingStore.ts`

---

**Created:** 2026-03-16
**Reporter:** larskrachen
