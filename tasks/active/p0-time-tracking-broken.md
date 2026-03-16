# 🚨 KRITISCH: Zeit-Tracking komplett fehlerhaft

**Status:** 📋 Backlog  
**Priority:** P0 (Kritisch)  
**Type:** Bug

---

## Problem
Die Zeit-Tracking-Implementierung ist grundlegend fehlerhaft:

1. **Gesamtzeit springt unerwartet hoch**
   - Start einer neuen Kategorie → Zeit springt auf >5:00
   - Keine nachvollziehbare Berechnung

2. **Kategorie-Zeit falsch**
   - Einzelne Kategorien zeigen falsche Zeiten
   - Berechnung nicht verständlich

3. **Inkonsistentes Verhalten**
   - Zeit springt bei verschiedenen Aktionen
   - Keine klare Logik erkennbar

## Mögliche Ursachen
- Zeit-Berechnung in Stores fehlerhaft
- Zeit-Einträge werden doppelt gezählt
- Falsche Zeitstempel (Datum/Zeit-Format)
- Zeit läuft im Hintergrund weiter
- Konflikt zwischen workDayStore und timeEntryStore

## Betroffene Komponenten
- `src/stores/workDayStore.ts` - Gesamte Logik prüfen
- `src/stores/timeEntryStore.ts` - Zeit-Einträge prüfen
- `src/stores/trackingStore.ts` - Tracking-Logik prüfen
- `src/components/workday/WorkDayTimer.tsx` - Anzeige prüfen

## Akzeptanzkriterien
- [ ] Zeit läuft korrekt (1 Sekunde = 1 Sekunde)
- [ ] Gesamtzeit = Summe aller Kategorien
- [ ] Keine unerwarteten Sprünge
- [ ] Pause-Zeit korrekt berechnet
- [ ] Zeit ist nachvollziehbar und verständlich

## Notwendige Maßnahmen
- [ ] Code-Review der gesamten Zeit-Tracking-Logik
- [ ] Unit-Tests für Zeit-Berechnungen
- [ ] Manuelle Tests mit bekannten Zeitwerten
- [ ] Dokumentation der Zeit-Berechnung

---

**Created:** 2026-03-16
**Reporter:** larskrachen
**Priority:** P0 - Muss vor allen anderen Features gefixt werden!
