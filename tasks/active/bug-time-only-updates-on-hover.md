# Bug: Zeit aktualisiert nur bei Hover

**Status:** 📋 Backlog  
**Priority:** P1  
**Type:** Bug

---

## Problem
Die Zeitanzeige in den Kategorien aktualisiert sich nur, wenn man mit der Maus über den Kategorie-Button hovert. Ohne Hover wird die Zeit nicht aktualisiert.

## Zusätzliche Frage
- Format ist MM:SS — was passiert beim Übergang zu Stunden?
- Sollte dann HH:MM:SS werden?

## Erwartetes Verhalten
- Zeit aktualisiert sich automatisch jede Sekunde
- Keine Benutzer-Interaktion nötig
- Klares Format (MM:SS oder HH:MM:SS)

## Tatsächliches Verhalten
- Zeit steht still ohne Hover
- Nur bei Mouse-Over wird aktualisiert

## Betroffene Komponenten
- `src/components/category/CategoryCard.tsx`
- `src/stores/trackingStore.ts` - Aktualisierungs-Logik
- Eventuell: Timer/Interval nicht korrekt implementiert

## Akzeptanzkriterien
- [ ] Zeit aktualisiert sich automatisch (jede Sekunde)
- [ ] Kein Hover nötig
- [ ] Format ist konsistent (MM:SS oder HH:MM:SS)
- [ ] Übergang zu Stunden ist definiert

---

**Created:** 2026-03-16
**Reporter:** larskrachen
