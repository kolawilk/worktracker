# Bug: Gesamtzeit-Anzeige verwirrend / zeigt falsche Werte

**Status:** 📋 Backlog  
**Priority:** P1  
**Type:** Bug

---

## Problem
Die Gesamtzeit-Anzeige ist unklar oder zeigt falsche Werte. Beim ersten Start des Tages wurde sofort "00:04" (4 Minuten) angezeigt, obwohl gerade erst gestartet wurde.

## Mögliche Ursachen
- Verbindung zu vorherigem Bug: Kategorie-Tracking startet Arbeitstag im Hintergrund, aber UI zeigt es nicht
- Gesamtzeit berechnet sich aus falschen/alten Daten
- Zeit wird doppelt gezählt

## Erwartetes Verhalten
- Gesamtzeit zeigt korrekt die Zeit seit Arbeitstag-Start
- Bei frischem Start: 00:00
- Zeit läuft synchron mit Timer

## Tatsächliches Verhalten
- Zeigt sofort 00:04 beim Start
- Unklar, worauf sich die Zeit bezieht

## Betroffene Komponenten
- `src/components/workday/WorkDayTimer.tsx`
- `src/stores/workDayStore.ts`
- `src/stores/timeEntryStore.ts`

## Akzeptanzkriterien
- [ ] Gesamtzeit ist nachvollziehbar
- [ ] Bei Start: 00:00
- [ ] Zeit läuft korrekt mit
- [ ] Keine mysteriösen Sprünge

---

**Created:** 2026-03-16
**Reporter:** larskrachen
**Related:** bug-category-tracking-no-auto-start.md
