# UI: Analytics Dashboard - X-Achsen Text zu gequetscht

**Status:** 📋 Backlog  
**Priority:** P2  
**Type:** UI Improvement

---

## Problem
Die Darstellung des Textes auf den X-Achsen im Analytics Dashboard ist sehr gequetscht/squeezed.

## Gewünschte Änderung
- Komplexere Graphe über die **gesamte Breite** darstellen
- Statt Grid aus 2 Elementen → volle Breite für bessere Lesbarkeit
- X-Achsen-Beschriftungen haben mehr Platz

## Betroffene Komponenten
- `src/pages/AnalyticsPage.tsx`
- Chart-Layout (Grid → Full Width)

## Akzeptanzkriterien
- [ ] X-Achsen-Text ist gut lesbar (nicht gequetscht)
- [ ] Komplexe Charts nutzen volle Breite
- [ ] Layout ist übersichtlich und nicht überladen

---

**Created:** 2026-03-16
**Reporter:** larskrachen
