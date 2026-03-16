# Zeit-Tracking Buganalyse

**Datum:** 2026-03-16  
**Branch:** bugfix/p0-time-tracking  
**Severity:** P0 (Kritisch)

---

## Zusammenfassung

Die Zeit-Tracking-Implementierung ist grundlegend fehlerhaft. Es gibt **mehrere Kandidaten für die Root Cause**, die alle zu inkonsistenten Zeiten führen können:

1. **Gesamtzeit springt unerwartet hoch** (Start neuer Kategorie → Zeit springt auf >5:00)
2. **Kategorie-Zeit falsch** (einzelne Kategorien zeigen falsche Zeiten)
3. **Inkonsistentes Verhalten** (Zeit springt bei verschiedenen Aktionen)

---

## Analyse der Stores

### 1. `trackingStore.ts`

#### Problem 1: `getCurrentDuration()` liefert falsche Werte beim Kategorie-Wechsel

```typescript
startTracking: (categoryId) => {
  const { session } = get()
  // Wenn bereits eine Session läuft, diese erst beenden (ohne Zeitverlust!)
  if (session.isRunning && session.startTime && session.categoryId) {
    // ZeitEintrag für die aktuelle Kategorie speichern
    const endTime = new Date()

    // ZeitEintrag speichern
    const date = endTime.toISOString().split('T')[0]
    useTimeEntryStore.getState().addTimeEntry({
      categoryId: session.categoryId,
      startTime: session.startTime,
      endTime: endTime.toISOString(),  // ← Problem: endTime wird gesetzt
      date,
    })
  }

  // NEUE Session starten (ohne Pause dazwischen!)
  set({
    session: {
      categoryId,
      startTime: new Date().toISOString(),  // ← Problem: Neue Zeit wird gesetzt
      isRunning: true,
    },
  })
},
```

**Analyse:**
- Wenn eine Session läuft und man auf eine neue Kategorie klickt, wird die alte Session beendet **UND** eine neue gestartet
- Beide Sessions laufen **ohne Pause dazwischen**
- Die `endTime` der alten Session ist **dieselbe Zeit** wie die `startTime` der neuen Session

**Folge:** Die Zeit wird **doppelt** gezählt für den Übergang!

---

### 2. `workDayStore.ts`

#### Problem 2: `getTotalWorkTime()` berechnet die Zeit falsch

```typescript
getTotalWorkTime: () => {
  const { currentWorkDay } = get()
  if (!currentWorkDay) {
    return 0
  }

  // Zeit-Berechnung:
  // 1. Alle timeEntries addieren (laufende und beendete)
  // 2. Pause abziehen
  
  const { timeEntries } = useTimeEntryStore.getState()
  
  const today = currentWorkDay.date
  const todayEntries = timeEntries.filter(entry => entry.date === today)
  
  // Zähle ALLE timeEntries des heutigen Tages
  let totalTime = todayEntries.reduce((total, entry) => {
    const start = new Date(entry.startTime).getTime()
    const end = entry.endTime ? new Date(entry.endTime).getTime() : Date.now()
    return total + (end - start)
  }, 0)

  // WICHTIG: Wenn KEINE Session läuft, ist totalTime korrekt
  // Wenn eine Session läuft, wurde sie IN den timeEntries gespeichert (siehe startTracking)
  // Deshalb NICHT nochmal addieren!
  
  // Pausenzeit abziehen (inkl. aktuelle Pause falls pausiert)
  let totalPauseMs = currentWorkDay.totalPauseMinutes * 60000
  const pauseStart = currentWorkDay.pauseStart
  if (currentWorkDay.isPaused && pauseStart !== null) {
    totalPauseMs += Date.now() - new Date(pauseStart).getTime()
  }

  const result = totalTime - totalPauseMs
  return result > 0 ? result : 0  // 🔒 Verhindere negative Zeiten
},
```

**Analyse:**
- Der Code Kommentar sagt: "Wenn eine Session läuft, wurde sie IN den timeEntries gespeichert"
- **ABER:** Bei `startTracking()` wird die **laufende Session NICHT in timeEntries gespeichert!**
- Nur bei `stopTracking()` wird der Entry gespeichert

**Folge:** Die aktuell laufende Session wird **nicht** in die Gesamtzeit mit einberechnet!

---

### 3. `syncStore.ts`

#### Problem 3: Doppelte Berechnung bei WorkDay Pause/Resume

```typescript
onWorkDayPause: () => {
  const { session, pauseTracking } = useTrackingStore.getState()
  
  // Wenn Tracking läuft, pausieren (zeitEintrag speichern, aber nicht komplett stoppen)
  if (session.isRunning && session.categoryId) {
    // Save current tracking session
    const endTime = new Date()
    const date = endTime.toISOString().split('T')[0]
    
    // Save the entry for the currently tracked category
    useTimeEntryStore.getState().addTimeEntry({
      categoryId: session.categoryId,
      startTime: session.startTime!,
      endTime: endTime.toISOString(),
      date,
    })
    
    // Store the last active category for resume
    lastActiveCategoryId = session.categoryId
    
    // Session direkt zurücksetzen (pauseTracking() aufrufen, um Doppelzählung zu verhindern!)
    pauseTracking()
  }
},
```

**Analyse:**
- Bei `pauseWorkDay()` wird die aktuelle Session gespeichert
- `pauseTracking()` wird aufgerufen, welches die Session zurücksetzt
- Aber: Die `endTime` wird gesetzt, und bei `resumeWorkDay()` wird die Session NICHT fortgesetzt

**Folge:** Bei Resume wird **keine Session fortgesetzt**, die Zeit wird nicht weitergezählt!

---

#### Problem 4: `onCategoryClick` doppelt speichert Entries

```typescript
onCategoryClick: (categoryId: string) => {
  // ... Arbeitstag starten/resumen ...
  
  // Wenn andere Kategorie angeklickt wird → wechseln
  else if (session.categoryId !== categoryId) {
    // Wenn Tracking läuft, erst current beenden
    if (session.isRunning && session.categoryId) {
      const endTime = new Date()
      const date = endTime.toISOString().split('T')[0]
      
      // ZeitEintrag speichern
      useTimeEntryStore.getState().addTimeEntry({
        categoryId: session.categoryId,
        startTime: session.startTime!,
        endTime: endTime.toISOString(),
        date,
      })
      
      // Session direkt zurücksetzen (pauseTracking() aufrufen, um Doppelzählung zu verhindern!)
      pauseTracking()
    }
    
    // Neue Kategorie starten
    startTracking(categoryId)
  }
},
```

**Analyse:**
- In `onCategoryClick` wird ein Entry gespeichert
- Dann wird `pauseTracking()` aufgerufen
- Dann wird `startTracking(categoryId)` aufgerufen

Aber in `startTracking()` wird wieder ein Entry gespeichert:

```typescript
startTracking: (categoryId) => {
  const { session } = get()
  // Wenn bereits eine Session läuft, diese erst beenden (ohne Zeitverlust!)
  if (session.isRunning && session.startTime && session.categoryId) {
    // ZeitEintrag für die aktuelle Kategorie speichern
    const endTime = new Date()

    // ZeitEintrag speichern  ← DOPPELTE SPEICHERUNG!
    const date = endTime.toISOString().split('T')[0]
    useTimeEntryStore.getState().addTimeEntry({
      categoryId: session.categoryId,
      startTime: session.startTime,
      endTime: endTime.toISOString(),
      date,
    })
  }

  // NEUE Session starten
  set({
    session: {
      categoryId,
      startTime: new Date().toISOString(),
      isRunning: true,
    },
  })
},
```

**Folge:** Beim Kategorie-Wechsel wird **ein Entry doppelt** gespeichert!

---

## Root Cause Zusammenfassung

### PRIMARY BUG: Doppelte Speicherung beim Kategorie-Wechsel

1. In `onCategoryClick` wird ein Entry mit `endTime = Now` gespeichert
2. In `startTracking()` wird **wieder** ein Entry mit **derselben `endTime`** gespeichert
3. Beide Entries haben dieselbe `endTime`, aber unterschiedliche `startTime`
4. **Gesamtzeit springt um die Differenz der Startzeiten!**

### SECONDARY BUG: Laufende Session nicht in Gesamtzeit

- `getTotalWorkTime()` berechnet Zeit aus `timeEntries`
- Die aktuell laufende Session ist **nicht** in `timeEntries`
- **Folge:** Laufende Zeit wird nicht mitgezählt!

### TERTIARY BUG: Pause-Logik inkonsistent

- Bei `pauseWorkDay()` wird die Session gespeichert
- Bei `resumeWorkDay()` wird die Session NICHT fortgesetzt
- **Folge:** Pause-Zeit wird nicht korrekt berechnet

---

## Empfohlene Fixes

### Fix 1: Verhindere doppelte Speicherung

**In `syncStore.ts`:** `onCategoryClick` - NUR Session beenden, Entry NICHT speichern

```typescript
onCategoryClick: (categoryId: string) => {
  // ... Arbeitstag starten/resumen ...
  
  else if (session.categoryId !== categoryId) {
    if (session.isRunning && session.categoryId) {
      // Session beenden, aber Entry NICHT speichern!
      // Entry wird von startTracking() gespeichert
      pauseTracking()
    }
    
    startTracking(categoryId)
  }
},
```

### Fix 2: Gesamtzeit inkl. laufender Session

**In `workDayStore.ts`:** `getTotalWorkTime()` - Laufende Session addieren

```typescript
getTotalWorkTime: () => {
  // ... existing code ...
  
  // Füge laufende Session hinzu (wenn vorhanden)
  const { session } = useTrackingStore.getState()
  if (session.isRunning && session.startTime) {
    const start = new Date(session.startTime).getTime()
    totalTime += Date.now() - start
  }
  
  // Pausenzeit abziehen
  // ... existing code ...
},
```

### Fix 3: Konsistente Pause-Logik

**In `syncStore.ts`:** `onWorkDayPause` - Entry nur speichern, Session nicht zurücksetzen

```typescript
onWorkDayPause: () => {
  const { session, pauseTracking } = useTrackingStore.getState()
  
  if (session.isRunning && session.categoryId) {
    const endTime = new Date()
    const date = endTime.toISOString().split('T')[0]
    
    // Entry speichern
    useTimeEntryStore.getState().addTimeEntry({
      categoryId: session.categoryId,
      startTime: session.startTime!,
      endTime: endTime.toISOString(),
      date,
    })
    
    lastActiveCategoryId = session.categoryId
    
    // Session nicht zurücksetzen!pauseTracking()
  }
},
```

---

## Tests

**Prio 1:** Teste Kategorie-Wechsel ohne Zeit-Sprung  
**Prio 2:** Teste Gesamtzeit = Summe aller Kategorien  
**Prio 3:** Teste Pause-Funktionalität

---

## Status

- [x] Analyse abgeschlossen
- [ ] Fixes implementieren
- [ ] Tests schreiben und durchführen
- [ ] Code Review
- [ ] SUCCESS
