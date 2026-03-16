# Bug: Zeit springt plötzlich hoch + Pause nicht erkennbar

**Status:** 📋 Backlog  
**Priority:** P1  
**Type:** Bug + Feature Request

---

## Bug: Zeit springt plötzlich

### Problem
Nach Stoppen einer Kategorie (nach wenigen Minuten) springt die Gesamtzeit-Anzeige plötzlich auf 2:01 — viel mehr als tatsächlich vergangen.

### Mögliche Ursachen
- Zeit wird falsch berechnet
- Alte Zeit-Einträge werden mitgezählt
- Zeit läuft im Hintergrund weiter

## Feature: Pause-Indikator

### Problem
Wenn keine Kategorie aktiv ist:
- Unklar, ob Pause läuft oder Tag beendet
- Play-Button erscheint nicht (oder unklar wann)
- Keine visuelle Rückmeldung

### Gewünschtes Verhalten
- Pause-Indikator im Header (z.B. ⏸️ oder 🕐 Emoji)
- Play-Button sichtbar wenn pausiert
- Klare Unterscheidung: Pause vs. Tag beendet

## Betroffene Komponenten
- `src/components/workday/WorkDayTimer.tsx`
- `src/components/workday/WorkDayControls.tsx`
- `src/stores/workDayStore.ts`

## Akzeptanzkriterien
- [ ] Zeit springt nicht unerwartet hoch
- [ ] Pause wird visuell angezeigt (Emoji/Icon)
- [ ] Play-Button erscheint bei Pause
- [ ] Klare Unterscheidung Pause/Beendet

---

**Created:** 2026-03-16
**Reporter:** larskrachen
