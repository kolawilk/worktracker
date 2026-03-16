# Bug: Tagesübersicht-Zeit stimmt nicht mit Gesamtzeit überein

**Status:** 📋 Backlog  
**Priority:** P1  
**Type:** Bug

---

## Problem
Die in der Tagesübersicht angezeigte Zeit stimmt nicht mit der dargestellten Gesamtzeit überein.

## Vermutung
Teil des größeren Zeit-Tracking-Problems (siehe p0-time-tracking-broken.md).

## Mögliche Ursachen
- Verschiedene Berechnungsmethoden
- Zeit-Einträge werden unterschiedlich aggregiert
- Rundungsfehler
- Zeitzone-Probleme

## Betroffene Komponenten
- Tagesübersicht-Page
- `src/stores/timeEntryStore.ts`
- `src/stores/workDayStore.ts`
- Zeit-Berechnungs-Logik

## Akzeptanzkriterien
- [ ] Tagesübersicht-Zeit = Gesamtzeit
- [ ] Konsistente Berechnung überall
- [ ] Einzelne Kategorie-Zeiten summieren sich zur Gesamtzeit

## Abhängigkeiten
- Blockiert von: p0-time-tracking-broken.md (muss zuerst gefixt werden)

---

**Created:** 2026-03-16
**Reporter:** larskrachen
**Related:** p0-time-tracking-broken.md
