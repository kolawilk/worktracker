# Feature: Dark Mode

**Status:** 📋 Backlog  
**Priority:** P1 (wichtig, aber nicht blocker)  
**Assignee:** ACP-Subagent

---

## Beschreibung
Drei Theme-Optionen: Light, Dark, System. Persistiert die Auswahl.

## Akzeptanzkriterien

- [ ] Theme-Switcher UI (Dropdown oder Toggle-Group)
- [ ] Optionen: Hell, Dunkel, System
- [ ] System-Option folgt `prefers-color-scheme`
- [ ] Theme wird in LocalStorage gespeichert
- [ ] shadcn/ui Komponenten reagieren auf Theme-Wechsel
- [ ] Kein FOUC (Flash of Unstyled Content) beim Laden

## UI/UX Ankorderungen

- Theme-Switcher in Settings oder Header
- Icons für die Modi (☀️/🌙/⚙️)
- Übergangsanimation beim Wechsel (subtil)

## Technische Details

- shadcn/ui `ThemeProvider` verwenden
- CSS-Variablen für Farben
- `class` Strategy (nicht `data-attribute`)

## Definition of Done
- [ ] Alle drei Modi funktionieren
- [ ] System-Erkennung funktioniert
- [ ] Persistenz über Reload
- [ ] Screenshots aller drei Modi im PR
- [ ] Code Review bestanden

---

**Created:** 2026-03-15  
**Story Points:** 3
