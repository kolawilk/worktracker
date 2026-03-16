# Bugfix: Arbeitstag nach Beenden neu starten

**Status:** ✅ DONE  
**Priority:** P1  
**Parent:** Feature 004

---

## Problem
Wenn der Arbeitstag beendet wurde (endTime gesetzt), kann er nicht neu gestartet werden. Aber: Es kann sein, dass doch noch ein Anruf kommt und man nochmal an den Rechner muss.

## Lösung
- `startWorkDay()` sollte auch funktionieren wenn ein Tag beendet wurde
- Neuen Tag starten überschreibt/erstellt neu

## Akzeptanzkriterien
- [x] Nach Beenden kann ein neuer Arbeitstag gestartet werden
- [x] Zeitberechnung bleibt korrekt
- [x] Keine TypeScript Fehler

## Ergebnis
- `startWorkDay()` prüft jetzt auf `endTime !== null`
- Wenn beendet: Alter Tag wird zur History hinzugefügt, neuer Tag wird erstellt
- Build erfolgreich, keine TypeScript Fehler
