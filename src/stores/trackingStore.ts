import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useTimeEntryStore } from './timeEntryStore'

interface TrackingSession {
  categoryId: string | null
  startTime: string | null
  isRunning: boolean
}

interface TrackingStore {
  session: TrackingSession
  startTracking: (categoryId: string) => void
  stopTracking: () => void
  pauseTracking: () => void
  getCurrentDuration: () => number
}

const STORAGE_KEY = 'worktracker-tracking'

export const useTrackingStore = create<TrackingStore>()(
  persist(
    (set, get) => ({
      session: {
        categoryId: null,
        startTime: null,
        isRunning: false,
      },

      startTracking: (categoryId) => {
        const { session } = get()
        
        // Wenn bereits eine Session läuft, diese erst beenden
        if (session.isRunning && session.startTime && session.categoryId) {
          // ZeitEintrag für die aktuelle Kategorie speichern
          const endTime = new Date()
          const date = endTime.toISOString().split('T')[0]

          // Die Dauer der aktuellen Session berechnen
          const startTimeObj = new Date(session.startTime)
          const duration = endTime.getTime() - startTimeObj.getTime()
          
          // Nur speichern, wenn mindestens 1 Sekunde vergangen ist
          if (duration > 1000) {
            useTimeEntryStore.getState().addTimeEntry({
              categoryId: session.categoryId,
              startTime: session.startTime,
              endTime: endTime.toISOString(),
              date,
            })
          }
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

      stopTracking: () => {
        const { session } = get()
        if (!session.isRunning || !session.startTime || !session.categoryId) {
          return
        }

        // Stoppen der aktuellen Session
        const endTime = new Date()
        const date = new Date().toISOString().split('T')[0]
        
        // Die Dauer berechnen
        const startTimeObj = new Date(session.startTime)
        const duration = endTime.getTime() - startTimeObj.getTime()
        
        // Nur speichern, wenn mindestens 1 Sekunde vergangen ist
        if (duration > 1000) {
          useTimeEntryStore.getState().addTimeEntry({
            categoryId: session.categoryId,
            startTime: session.startTime,
            endTime: endTime.toISOString(),
            date,
          })
        }

        set({
          session: {
            categoryId: null,
            startTime: null,
            isRunning: false,
          },
        })
      },

      pauseTracking: () => {
        const { session } = get()
        if (!session.isRunning || !session.startTime || !session.categoryId) {
          return
        }

        // Session direkt zurücksetzen, OHNE Entry zu speichern
        // Entry wurde bereits in startTracking/stopTracking gespeichert
        set({
          session: {
            categoryId: null,
            startTime: null,
            isRunning: false,
          },
        })
      },

      getCurrentDuration: () => {
        const { session } = get()
        if (!session.isRunning || !session.startTime) {
          return 0
        }
        return Date.now() - new Date(session.startTime).getTime()
      },
    }),
    {
      name: STORAGE_KEY,
      partialize: (state) => ({ session: state.session }),
    }
  )
)
