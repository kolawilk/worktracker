# Architektur: Soft-Delete für Kategorien

**Status:** 📋 Backlog  
**Priority:** P1 (für Reports wichtig)  
**Parent:** Feature 002

---

## Problem
Gelöschte Kategorien müssen später trotzdem in Reports angezeigt werden.

## Lösung
- Soft-Delete statt Hard-Delete
- `isDeleted` Flag in Category
- Gelöschte Kategorien ausblenden im Grid, aber behalten in DB
- In Reports: Name anzeigen (ggf. mit "(gelöscht)")

## Akzeptanzkriterien
- [ ] Soft-Delete implementiert
- [ ] Gelöschte Kategorien nicht im Grid
- [ ] Zeit-Einträge behalten Kategorie-Referenz
- [ ] Reports zeigen gelöschte Kategorien an

---

**Created:** 2026-03-15
