import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { useTrackingStore } from './trackingStore'
import { useTimeEntryStore } from './timeEntryStore'

describe('Zeit-Tracking Logik', () => {
  beforeEach(() => {
    // Reset stores vor jedem Test
    useTrackingStore.setState({
      session: { categoryId: null, startTime: null, isRunning: false }
    })
    useTimeEntryStore.setState({ timeEntries: [] })
    
    // Mock Date.now für konsistente Tests
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-03-16T10:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('trackingStore.getCurrentDuration()', () => {
    it('sollte Millisekunden zurückgeben (nicht Sekunden)', () => {
      const store = useTrackingStore.getState()
      
      // Session starten
      store.startTracking('test-category')
      
      // 5 Sekunden vorrücken
      vi.advanceTimersByTime(5000)
      
      // Duration sollte ~5000ms sein (nicht 5)
      const duration = store.getCurrentDuration()
      expect(duration).toBeGreaterThanOrEqual(5000)
      expect(duration).toBeLessThan(6000) // Mit etwas Toleranz
    })

    it('sollte 0 zurückgeben wenn keine Session läuft', () => {
      const store = useTrackingStore.getState()
      const duration = store.getCurrentDuration()
      expect(duration).toBe(0)
    })
  })

  describe('timeEntryStore.getTotalTimeByCategory()', () => {
    it('sollte Millisekunden zurückgeben', () => {
      const store = useTimeEntryStore.getState()
      
      // Eintrag hinzufügen (5 Sekunden)
      store.addTimeEntry({
        categoryId: 'test-cat',
        startTime: '2026-03-16T10:00:00.000Z',
        endTime: '2026-03-16T10:00:05.000Z',
        date: '2026-03-16'
      })
      
      const totalTime = store.getTotalTimeByCategory('test-cat')
      expect(totalTime).toBe(5000) // 5000ms, nicht 5
    })
  })

  describe('Konsistenz zwischen Stores', () => {
    it('sollte konsistente Zeiteinheiten verwenden', () => {
      // Session starten
      useTrackingStore.getState().startTracking('test-cat')
      vi.advanceTimersByTime(3000)
      
      // Eintrag hinzufügen
      useTimeEntryStore.getState().addTimeEntry({
        categoryId: 'test-cat',
        startTime: '2026-03-16T10:00:00.000Z',
        endTime: '2026-03-16T10:00:03.000Z',
        date: '2026-03-16'
      })
      
      // Alle Zeiten sollten in Millisekunden sein
      const trackingDuration = useTrackingStore.getState().getCurrentDuration()
      const entryTime = useTimeEntryStore.getState().getTotalTimeByCategory('test-cat')
      
      // Beide sollten ~3000 sein (nicht 3)
      expect(trackingDuration).toBeGreaterThanOrEqual(3000)
      expect(entryTime).toBe(3000)
    })
  })
})