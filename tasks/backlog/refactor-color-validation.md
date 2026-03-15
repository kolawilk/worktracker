# Feature: Farb-Validation

**Status:** 📋 Backlog  
**Priority:** P2 (nice-to-have)  
**Assignee:** TBD

---

## Beschreibung
Füge Regex-Validation für den Farb-Input im CategoryDialog hinzu.

## Aktueller Code
Farbe wird als beliebiger String akzeptiert.

## Verbesserung
```typescript
const isValidColor = (color: string): boolean => {
  return /^#[0-9A-Fa-f]{6}$/.test(color)
}
```

## UI-Verhalten
- Input zeigt Fehler-Status bei ungültiger Farbe
- Speichern-Button disabled bei ungültiger Farbe
- Optional: Color Picker statt Text-Input

## Akzeptanzkriterien
- [ ] Regex-Validation implementiert
- [ ] Fehler-Status in UI angezeigt
- [ ] Nur valide Farben werden gespeichert

---

**Created:** 2026-03-15  
**Story Points:** 2
