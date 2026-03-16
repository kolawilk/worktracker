# Feature: Kategorie-Farbe als Pflichtfeld

**Status:** 📋 Backlog  
**Priority:** P2  
**Type:** Feature Change

---

## Problem
Die Farbauswahl für Kategorien ist aktuell optional.

## Begründung
Mit den Auswertemöglichkeiten im Analytics-Dashboard (Pie Charts, Bar Charts, etc.) ist eine eindeutige Farbe pro Kategorie wichtig für die Visualisierung.

## Gewünschte Änderung
- Farbauswahl wird **Pflichtfeld**
- Keine Kategorie ohne Farbe erstellen möglich
- Default-Farbe entfernen oder als Vorauswahl anbieten

## Betroffene Komponenten
- `src/components/category/CategoryDialog.tsx`
- `src/types/index.ts` (Category Type)
- Validierung im Dialog

## Akzeptanzkriterien
- [ ] Farbe ist Pflichtfeld im Kategorie-Dialog
- [ ] Speichern ohne Farbe nicht möglich
- [ ] Klare Fehlermeldung wenn keine Farbe gewählt
- [ ] Bestehende Kategorien ohne Farbe behandeln (Migration?)

---

**Created:** 2026-03-16
**Reporter:** larskrachen
