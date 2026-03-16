# Feature: Analytics - Freie Datumsauswahl (von - bis)

**Status:** 📋 Backlog  
**Priority:** P2  
**Type:** Feature

---

## Problem
Der Zeitbereich im Analytics Dashboard kann nur nach vordefinierten Werten angegeben werden (Heute, Diese Woche, Dieser Monat, etc.).

## Gewünschte Funktion
- Freie Auswahl der Daten: **von - bis**
- Mit **DatePicker** Komponente
- Zusätzlich zu den vordefinierten Optionen

## Betroffene Komponenten
- `src/pages/AnalyticsPage.tsx`
- Zeitbereich-Filter Section
- Neue DatePicker Komponente (shadcn/ui)

## Akzeptanzkriterien
- [ ] DatePicker für "von" und "bis" verfügbar
- [ ] Vordefinierte Optionen bleiben erhalten
- [ ] Charts aktualisieren sich bei Datums-Änderung
- [ ] Intuitive Bedienung

---

**Created:** 2026-03-16
**Reporter:** larskrachen
