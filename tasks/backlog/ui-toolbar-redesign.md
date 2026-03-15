# UI: Arbeitstag-Steuerung in Header integrieren

**Status:** 📋 Backlog  
**Priority:** P1  
**Parent:** P0 ui-workday-toolbar

---

## Problem
Das aktuelle Menüband (sticky header) ist zu aufdringlich. Der Nutzer wollte gar kein Menüband — die Steuerung soll direkt in die Header-Zeile integriert werden.

## Lösung
- **Sticky Header komplett entfernen**
- Steuerung in Header-Zeile integrieren:
  - Links: Titel "Worktracker"
  - **Mitte:** Start/Pause Button + Zeit-Anzeige + Stopp Button
  - Rechts: "Neue Kategorie" Button
- Kompakte Darstellung, harmonisch zu Titel und Button

## Design
- Kein separater Header-Bereich mehr
- Steuerungselemente zwischen Titel und "Neue Kategorie" Button
- Dezente Icons/Buttons (nicht knallig)
- Min 44px Touch-Targets (iPad)
- Zeit-Anzeige: HH:MM:SS, dezente Farbe

## Akzeptanzkriterien
- [ ] Sticky Header entfernt
- [ ] Start/Pause/Stopp in Header-Zeile
- [ ] Zeit-Anzeige zwischen Steuerung
- [ ] Harmoniert mit Titel und "Neue Kategorie" Button
- [ ] iPad-optimiert (Touch-Targets)
- [ ] Kein überflüssiger Platzverbrauch

---

**Created:** 2026-03-15
