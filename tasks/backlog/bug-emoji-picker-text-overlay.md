# Bug: Emoji Picker - Text überlappt Lupen-Symbol

**Status:** 📋 Backlog  
**Priority:** P2  
**Type:** Bug

---

## Problem
Im Emoji Picker Dialog überlappt der Text "Emojis durchsuchen..." das Lupen-Symbol (Such-Icon).

## Screenshot
Siehe Discord-Anhang (emoji-picker-ui-bug.png)

## Erwartetes Verhalten
- Text sollte rechts vom Icon sein
- Keine Überlappung

## Tatsächliches Verhalten
- Text liegt über dem Icon
- Schlechte Lesbarkeit

## Betroffene Komponenten
- `src/components/ui/emoji-picker-dialog.tsx` oder
- `src/components/category/CategoryDialog.tsx`

## Akzeptanzkriterien
- [ ] Text und Icon sind klar getrennt
- [ ] Suchfeld ist gut lesbar
- [ ] Keine Überlappung im Emoji Picker

---

**Created:** 2026-03-16
**Reporter:** larskrachen
