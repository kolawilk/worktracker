import { create } from 'zustand'
import { useTrackingStore } from './trackingStore'
import { useTimeEntryStore } from './timeEntryStore'

// Temporary storage for last active category during pause
let lastActiveCategoryId: string | null = null

interface SyncStore {
  // Actions that get called by WorkDayStore
  onWorkDayPause: () => void
  onWorkDayResume: () => void
  onWorkDayEnd: () => void
  
  // Actions that get called by CategoryCard
  onCategoryClick: (categoryId: string) => void
}

export const useSyncStore = create<SyncStore>()(() => ({
  onWorkDayPause: () => {
    const { session, stopTracking } = useTrackingStore.getState()
    
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
      
      // Stop tracking (reset session)
      stopTracking()
    }
  },

  onWorkDayResume: () => {
    const { session, startTracking } = useTrackingStore.getState()
    
    // Wenn Tracking nicht läuft und wir haben eine letzte Kategorie, diese fortsetzen
    if (!session.isRunning && lastActiveCategoryId) {
      startTracking(lastActiveCategoryId)
    }
  },

  onWorkDayEnd: () => {
    const { session, stopTracking } = useTrackingStore.getState()
    
    // Wenn Tracking läuft, beenden
    if (session.isRunning) {
      stopTracking()
    }
    
    // Reset last active category
    lastActiveCategoryId = null
  },

  onCategoryClick: (categoryId: string) => {
    const { session, startTracking, stopTracking } = useTrackingStore.getState()
    
    // Wenn dieselbe Kategorie angeklickt wird und sie aktiv ist → stoppen
    if (session.categoryId === categoryId && session.isRunning) {
      stopTracking()
    } 
    // Wenn andere Kategorie angeklickt wird → wechseln
    else if (session.categoryId !== categoryId) {
      // Wenn Tracking läuft, erst current beenden
      if (session.isRunning && session.categoryId) {
        const endTime = new Date()
        const date = endTime.toISOString().split('T')[0]
        
        useTimeEntryStore.getState().addTimeEntry({
          categoryId: session.categoryId,
          startTime: session.startTime!,
          endTime: endTime.toISOString(),
          date,
        })
      }
      
      // Neue Kategorie starten
      startTracking(categoryId)
    }
  },
}))
