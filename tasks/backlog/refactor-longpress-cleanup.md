# Feature: LongPress Timer Cleanup

**Status:** 📋 Backlog  
**Priority:** P2 (nice-to-have)  
**Assignee:** TBD

---

## Beschreibung
Verbessere den Cleanup des LongPress Timers in CategoryCard.tsx, um Memory Leaks zu vermeiden.

## Aktueller Code
```typescript
const longPressTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null)
```

## Verbesserung
```typescript
React.useEffect(() => {
  return () => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current)
  }
}, [])
```

## Akzeptanzkriterien
- [ ] Cleanup in useEffect implementiert
- [ ] Keine TypeScript Fehler
- [ ] Funktionalität bleibt erhalten

---

**Created:** 2026-03-15  
**Story Points:** 1
