# Feature: Arbeitstag-Steuerung

**Status:** 📋 Backlog  
**Priority:** P0 (Kern-Feature)  
**Assignee:** ACP-Subagent

---

## Beschreibung
Buttons zum Starten, Pausieren und Beenden des Arbeitstages. Zeigt Gesamt-Arbeitszeit an.

## Akzeptanzkriterien

- [ ] "Arbeitstag starten"-Button (nur wenn noch nicht gestartet)
- [ ] "Pause"-Button (pausiert Tracking, zeigt Pause-Timer)
- [ ] "Weiter"-Button (beendet Pause)
- [ ] "Arbeitstag beenden"-Button (mit Bestätigung)
- [ ] Anzeige: Aktuelle Arbeitszeit (ohne Pausen)
- [ ] Anzeige: Aktuelle Pausenzeit (wenn pausiert)
- [ ] Persistenz: Bei Reload wird aktueller Tag wiederhergestellt

## UI/UX Anforderungen

- Buttons prominent, aber nicht dominant
- Klare Status-Anzeige: "Arbeitstag läuft", "Pausiert", "Beendet"
- Farbcodierung: Grün (läuft), Gelb (pausiert), Grau (beendet)
- Große, tippbare Buttons

## Technische Details

```typescript
interface WorkDay {
  date: string;              // "2026-03-15"
  startTime: string;         // ISO timestamp
  endTime: string | null;    // null = läuft noch
  isPaused: boolean;
  pauseStart: string | null; // ISO timestamp
  totalPauseMinutes: number;
}
```

## Definition of Done
- [ ] Alle Buttons funktionieren korrekt
- [ ] Zeitberechnung ist akkurat
- [ ] Status wird korrekt persistiert
- [ ] Screenshots vom UI im PR
- [ ] Code Review bestanden

---

**Created:** 2026-03-15  
**Story Points:** 5
