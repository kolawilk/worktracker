# Feature: Wochen-Auswertung

**Status:** 📋 Backlog  
**Priority:** P0 (Kern-Feature)  
**Assignee:** ACP-Subagent

---

## Beschreibung
Übersicht über die aktuelle Woche: Zeit pro Kategorie, Gesamtzeit, Visualisierung.

## Akzeptanzkriterien

- [ ] Seite/Tab für Wochen-Auswertung
- [ ] Zeigt aktuelle Woche (Mo-So)
- [ ] Liste aller Kategorien mit Zeit (HH:MM oder Dezimal)
- [ ] Gesamt-Arbeitszeit der Woche
- [ ] Navigation: Vorherige Woche, Nächste Woche
- [ ] Leere Kategorien ausblenden oder grau darstellen

## UI/UX Anforderungen

- Klare Übersicht, nicht überladen
- Fortschrittsbalken oder einfache Balkendiagramme
- Zeit in lesbarem Format (2h 30m statt 2.5)
- Wochen-Navigation einfach (Swipe oder Buttons)

## Technische Details

- Aggregation über `TimeEntry`-Daten
- Wochenberechnung: ISO-Week (Mo = erster Tag)
- Filter: `entry.date >= weekStart && entry.date <= weekEnd`

## Definition of Done
- [ ] Zeiten werden korrekt aggregiert
- [ ] Navigation zwischen Wochen funktioniert
- [ ] Leere Zustände werden schön dargestellt
- [ ] Screenshots vom UI im PR
- [ ] Code Review bestanden

---

**Created:** 2026-03-15  
**Story Points:** 5
