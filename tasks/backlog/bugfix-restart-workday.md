# Bugfix: Arbeitstag nach Beenden neu starten

**Status:** 📋 Backlog  
**Priority:** P1  
**Parent:** Feature 004

---

## Problem
Wenn der Arbeitstag beendet wurde (endTime gesetzt), kann er nicht neu gestartet werden. Aber: Es kann sein, dass doch noch ein Anruf kommt und man nochmal an den Rechner muss.

## Lösung
- `startWorkDay()` sollte auch funktionieren wenn ein Tag beendet wurde
- Neuen Tag starten überschreibt/erstellt neu

## Akzeptanzkriterien
- [ ] Nach Beenden kann ein neuer Arbeitstag gestartet werden
- [ ] Zeitberechnung bleibt korrekt
- [ ] Keine TypeScript Fehler

---

**Created:** 2026-03-15
