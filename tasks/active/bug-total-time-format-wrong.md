# Bug: Gesamtzeit-Format falsch (MM:SS statt HH:MM)

**Status:** 📋 Backlog  
**Priority:** P1  
**Type:** Bug

---

## Problem
Die Gesamtzeit-Anzeige zeigt **MM:SS** (Minuten:Sekunden) statt **HH:MM** (Stunden:Minuten).

Das erklärt das "Springen" — 2:01 bedeutet 2 Minuten 1 Sekunde, nicht 2 Stunden 1 Minute!

## Erwartetes Verhalten
- Gesamtzeit: **HH:MM** (z.B. 2:01 = 2 Stunden 1 Minute)
- Oder: **HH:MM:SS** für mehr Präzision
- Nie: MM:SS für Gesamtzeit (verwirrend)

## Tatsächliches Verhalten
- Gesamtzeit zeigt MM:SS
- 2:01 wird als 2 Minuten interpretiert
- Verwirrend für Nutzer

## Betroffene Komponenten
- `src/components/workday/WorkDayTimer.tsx`
- `src/lib/utils.ts` oder Formatierungs-Funktionen

## Akzeptanzkriterien
- [ ] Gesamtzeit zeigt HH:MM oder HH:MM:SS
- [ ] Format ist konsistent und verständlich
- [ ] Keine Verwechslung Minuten/Stunden

---

**Created:** 2026-03-16
**Reporter:** larskrachen
