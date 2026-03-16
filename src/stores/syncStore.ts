import { create } from 'zustand'
import { useTrackingStore } from './trackingStore'
import { useTimeEntryStore } from './timeEntryStore'
import { useWorkDayStore } from './workDayStore'

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
    
    // Wenn Tracking läuft, beenden ( Entry speichern!)
    if (session.isRunning && session.categoryId) {
      // Speichere Entry mit aktueller Zeit als endTime
      const endTime = new Date()
      const date = endTime.toISOString().split('T')[0]
      
      useTimeEntryStore.getState().addTimeEntry({
        categoryId: session.categoryId,
        startTime: session.startTime!,
        endTime: endTime.toISOString(),
        date,
      })
      
      // Store the last active category for resume
      lastActiveCategoryId = session.categoryId
      
      // Session stoppen (nicht pauseTracking!)
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
    
    // 🔥 FIX: Arbeitstag automatisch starten/resumen, wenn nicht gestartet
    const { currentWorkDay, startWorkDay, resumeWorkDay, resumeEndedWorkDay } = useWorkDayStore.getState()
    
    // Wenn kein Arbeitstag existiert → starten
    if (!currentWorkDay) {
      startWorkDay()
    } 
    // Wenn Arbeitstag pausiert ist → fortsetzen
    else if (currentWorkDay.isPaused) {
      resumeWorkDay()
    }
    // Wenn Arbeitstag beendet ist → fortsetzen (neuer Arbeitstag an demselben Tag)
    else if (currentWorkDay.endTime !== null) {
      resumeEndedWorkDay()
    }
    
    // Wenn keine Session läuft, Kategorie direkt starten
    if (!session.isRunning) {
      startTracking(categoryId)
      return
    }
    
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
        
        // ZeitEintrag speichern
        useTimeEntryStore.getState().addTimeEntry({
          categoryId: session.categoryId,
          startTime: session.startTime!,
          endTime: endTime.toISOString(),
          date,
        })
        
        // Session stoppen
        stopTracking()
      }
      
      // Neue Kategorie starten
      startTracking(categoryId)
    }
  },
}))
