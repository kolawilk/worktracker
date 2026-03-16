# UI: Analytics Dashboard - Redundante Zeit-Anzeige

**Status:** 📋 Backlog  
**Priority:** P3  
**Type:** UI Improvement

---

## Problem
Die tabellarische Übersicht im Analytics Dashboard enthält redundante Angaben:
- **Rechts groß in schwarz**: Zeit angezeigt
- **Darunter klein in grau**: Die gleiche Zeit nochmal

Das ist überflüssig und verwirrend.

## Gewünschte Änderung
- Eine der beiden Anzeigen entfernen
- Oder: Unterschiedliche Informationen anzeigen (z.B. groß = Gesamtzeit, klein = Durchschnitt)

## Betroffene Komponenten
- `src/pages/AnalyticsPage.tsx`
- Tabellarische Übersicht Section

## Akzeptanzkriterien
- [ ] Keine redundante Zeit-Anzeige
- [ ] Übersichtlich und klar

---

**Created:** 2026-03-16
**Reporter:** larskrachen
