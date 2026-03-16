# 🚨 P0: Analytics zeigt keine Einträge mehr

**Status:** 📋 Backlog  
**Priority:** P0 (Kritisch)  
**Type:** Bug

---

## Problem
Keine der Analysen zeigt die Einträge mehr an. Hat vorher funktioniert, jetzt kaputt.

## Beobachtung
- Analytics Dashboard öffnen
- Keine Daten sichtbar
- Charts leer

## Vermutete Ursache
- Letzte Änderungen haben Analytics kaputt gemacht
- Zeitberechnung geändert?
- Daten-Format inkonsistent?

## Betroffene Dateien
- `src/pages/AnalyticsPage.tsx`
- `src/lib/analytics.ts`
- `src/stores/timeEntryStore.ts`

---

**Created:** 2026-03-16
**Reporter:** larskrachen
