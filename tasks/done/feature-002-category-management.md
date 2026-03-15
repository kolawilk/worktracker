# Feature: Kategorie-Verwaltung

**Status:** 📋 Backlog  
**Priority:** P0 (Kern-Feature)  
**Assignee:** ACP-Subagent

---

## Beschreibung
Nutzer können Kategorien anlegen, bearbeiten und löschen. Jede Kategorie hat einen Namen, ein Emoji und optional eine Farbe.

## Akzeptanzkriterien

- [ ] UI für Kategorie-Liste (Grid-Layout)
- [ ] "Neue Kategorie"-Button öffnet Dialog
- [ ] Dialog mit Formular: Name (required), Emoji-Picker, Farbe (optional)
- [ ] Kategorie bearbeiten (Dialog mit vorbelegten Werten)
- [ ] Kategorie löschen mit Bestätigung
- [ ] Daten persistieren in LocalStorage
- [ ] Emoji-Picker integriert (native oder lightweight lib)

## UI/UX Anforderungen

- Große, tippbare Kacheln (iPad-optimiert)
- Klare visuelle Hierarchie
- Emoji zentriert, Name darunter
- Bearbeiten/Löschen über Context-Menu oder Swipe (iPad: Long-Press)

## Technische Details

```typescript
interface Category {
  id: string;        // crypto.randomUUID()
  name: string;      // max 30 chars
  emoji: string;     // single emoji
  color?: string;    // Tailwind color class
  createdAt: string; // ISO date
}
```

## Definition of Done
- [ ] Alle CRUD-Operationen funktionieren
- [ ] Daten überleben Page-Reload
- [ ] Screenshots vom UI im PR
- [ ] Code Review bestanden

---

**Created:** 2026-03-15  
**Story Points:** 5
