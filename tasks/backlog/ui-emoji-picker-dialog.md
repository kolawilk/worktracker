# UI: Emoji Picker als Dialog mit voller Auswahl

**Status:** 📋 Backlog  
**Priority:** P1 (Fix)  
**Parent:** bugfix-emoji-picker

---

## Problem
Aktuelle Implementierung:
- Fragezeichen-Button ist unfunktional
- Emoji-Grid ist zu groß, macht Dialog unbrauchbar
- Nur begrenzte Emoji-Auswahl

## Lösung
1. **Fragezeichen-Button** öffnet Emoji-Picker-Dialog
2. **Emoji-Picker als Dialog** (nicht inline im Haupt-Dialog)
3. **Volle Emoji-Auswahl** mit allen Emojis (via `emoji-picker-react` oder ähnlich)

## Design
- Fragezeichen-Button in CategoryDialog
- Klick öffnet Emoji-Picker-Dialog
- Dialog enthält: Suchfeld + Grid mit allen Emojis
- Auswahl schließt Dialog und setzt Emoji
- iPad-optimiert (große Touch-Targets)

## Akzeptanzkriterien
- [ ] Fragezeichen-Button öffnet Emoji-Picker
- [ ] Emoji-Picker als separater Dialog
- [ ] Alle Emojis verfügbar (via Library)
- [ ] Suchfunktion im Emoji-Picker
- [ ] iPad-optimiert
- [ ] Keine TypeScript Fehler

---

**Created:** 2026-03-15
