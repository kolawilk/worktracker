# 🚨 KRITISCH: Tagesübersicht Endlosschleife bei abgeschlossenem Tag

**Status:** 📋 Backlog  
**Priority:** P0 (Kritisch)  
**Type:** Bug

---

## Problem
Wenn ein Tag abgeschlossen ist und man die Webapp neu aufruft:
1. Tagesübersicht wird angezeigt
2. Man kann sie schließen
3. Sie öffnet sich sofort wieder (Endlosschleife)

## Vermutete Ursache
- Auto-Redirect oder Auto-Open Logik fehlerhaft
- Prüft nicht korrekt, ob Übersicht bereits angezeigt wurde
- LocalStorage-Flag fehlt oder wird nicht gesetzt

## Betroffene Komponenten
- Tagesübersicht-Dialog
- Auto-Open Logik
- LocalStorage/State Management

## Akzeptanzkriterien
- [ ] Tagesübersicht öffnet sich nur EINMAL nach Tag-Abschluss
- [ ] Bei Neuladen: Keine automatische Wiederanzeige
- [ ] Manuelles Öffnen ist weiterhin möglich

---

**Created:** 2026-03-16
**Reporter:** larskrachen
