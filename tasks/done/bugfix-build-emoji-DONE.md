# Bugfix: Build-Fehler EmojiPicker

**Status:** 📋 Backlog  
**Priority:** P0 (Kritisch)  
**Parent:** ui-emoji-picker-dialog

---

## Problem
Build fehlschlägt wegen fehlendem EmojiPicker:
```
error TS2307: Cannot find module './EmojiPicker'
```

## Lösung
- Entferne EmojiPicker-Import aus CategoryDialog.tsx
- Entferne EmojiPicker-Usage
- Temporär: Nur Emoji-Input Feld (bis richtiger Dialog kommt)

## Akzeptanzkriterien
- [ ] npm run build OHNE FEHLER
- [ ] CategoryDialog funktioniert ohne EmojiPicker
- [ ] Code Review APPROVED

---

**Created:** 2026-03-15
