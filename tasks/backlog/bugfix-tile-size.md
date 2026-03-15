# Bugfix: Kachelgröße konsistent

**Status:** 📋 Backlog  
**Priority:** P1  
**Parent:** Feature 002

---

## Problem
Wenn keine Farbe gewählt wird, ist die Kachel kleiner als mit Farbe. Das Grid verschiebt sich.

## Lösung
- Kachelgröße fixieren (min-height)
- Farb-Indikator sollte nicht die Größe beeinflussen
- Oder: Default-Farbe wenn keine gewählt

## Akzeptanzkriterien
- [ ] Alle Kacheln gleich groß
- [ ] Grid bleibt stabil
- [ ] Kein Verschieben beim Aktivieren/Deaktivieren

---

**Created:** 2026-03-15
