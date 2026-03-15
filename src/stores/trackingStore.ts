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
        // Wenn bereits eine Session läuft, diese erst stoppen
        if (session.isRunning && session.startTime && session.categoryId) {
          // ZeitEintrag für die aktuelle Kategorie speichern
          const endTime = new Date()

          // ZeitEintrag speichern
          const date = endTime.toISOString().split('T')[0]
          useTimeEntryStore.getState().addTimeEntry({
            categoryId: session.categoryId,
            startTime: session.startTime,
            endTime: endTime.toISOString(),
            date,
          })
        }

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

        const endTime = new Date().toISOString()
        
        // ZeitEintrag speichern
        const date = new Date().toISOString().split('T')[0]
        useTimeEntryStore.getState().addTimeEntry({
          categoryId: session.categoryId,
          startTime: session.startTime,
          endTime,
          date,
        })

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
        return Math.floor((Date.now() - new Date(session.startTime).getTime()) / 1000)
      },
    }),
    {
      name: STORAGE_KEY,
      partialize: (state) => ({ session: state.session }),
    }
  )
)
