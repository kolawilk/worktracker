# Feature: Wochenübersicht verbessern + Kalenderwoche anzeigen

**Status:** 📋 Backlog  
**Priority:** P2  
**Type:** Feature + UI Improvement

---

## Aktueller Zustand
Es gibt zwei verschiedene Darstellungen der Wochenübersicht.

## Gewünschte Änderungen

### 1. Einheitliche Darstellung
- Zweite Variante bevorzugt (siehe Screenshot)
- Erste Variante entfernen/vereinheitlichen

### 2. Header entfernen
- Header in der Wochenübersicht kann weg
- Platz sparen, cleaner Look

### 3. Kalenderwoche anzeigen
- Titel ergänzen: "Wochen-Auswertung: KW 12"
- KW dynamisch berechnen aus dem angezeigten Zeitraum

## Betroffene Komponenten
- `src/pages/WeeklyReportPage.tsx`
- `src/lib/week.ts` (KW-Berechnung)

## Akzeptanzkriterien
- [ ] Einheitliche Wochenübersicht (zweite Variante)
- [ ] Header entfernt
- [ ] Titel zeigt "Wochen-Auswertung: KW XX"
- [ ] KW wird korrekt berechnet

---

**Created:** 2026-03-16
**Reporter:** larskrachen
