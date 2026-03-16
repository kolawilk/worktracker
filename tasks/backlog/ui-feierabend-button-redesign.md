# UI-Verbesserung: Feierabend-Button redesign

**Status:** 📋 Backlog  
**Priority:** P2  
**Type:** UI/UX Improvement

---

## Problem
Die Darstellung des "Feierabend" Buttons sieht nicht gut aus:
- Text "Feierabend" ist überflüssig
- Checkbox-Icon passt nicht zum Kontext

## Screenshot
Siehe Discord-Anhang (feierabend-button-ui.png)

## Gewünschte Änderung
- Text "Feierabend" entfernen
- Stattdessen: Dezenter **Stop-Button** (🔴 oder ⏹️)
- Farbe: Dezentes Rot (nicht zu auffällig)
- Position: Rechts neben der Zeit

## Erwartetes Ergebnis
- Sauberer, minimalistischer Look
- Intuitiv verständlich (Stop = Arbeitstag beenden)
- Weniger visueller Clutter

## Betroffene Komponenten
- `src/components/workday/WorkDayControls.tsx`
- `src/components/workday/FeierabendDialog.tsx` (Trigger)

## Akzeptanzkriterien
- [ ] Text "Feierabend" entfernt
- [ ] Stop-Button (Icon) in dezentem Rot
- [ ] Button ist intuitiv verständlich
- [ ] Passt zum restlichen Design

---

**Created:** 2026-03-16
**Reporter:** larskrachen
