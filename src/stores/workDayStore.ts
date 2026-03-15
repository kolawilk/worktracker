import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { WorkDay } from '@/types'
import { useSyncStore } from './syncStore'

interface WorkDayStore {
  currentWorkDay: WorkDay | null
  startWorkDay: () => void
  pauseWorkDay: () => void
  resumeWorkDay: () => void
  endWorkDay: () => void
  getCurrentWorkDay: () => WorkDay | null
  getTotalWorkTime: () => number
  getPauseTime: () => number
}

const STORAGE_KEY = 'worktracker-workday'

export const useWorkDayStore = create<WorkDayStore>()(
  persist(
    (set, get) => ({
      currentWorkDay: null,

      startWorkDay: () => {
        const { currentWorkDay } = get()
        const today = new Date()
        const date = today.toISOString().split('T')[0]
        
        // Wenn bereits ein Tag existiert und beendet wurde (endTime != null),
        // diesen als beendet markieren, bevor ein neuer Tag startet
        if (currentWorkDay && currentWorkDay.endTime !== null) {
          // Tag ist bereits beendet, nichts zu tun - einfach neuen Tag starten
          // (der alte Tag bleibt im Store, wird aber überschrieben)
        }
        
        set({
          currentWorkDay: {
            date,
            startTime: today.toISOString(),
            endTime: null,
            isPaused: false,
            pauseStart: null,
            totalPauseMinutes: 0,
          },
        })
      },

      pauseWorkDay: () => {
        const { currentWorkDay } = get()
        if (!currentWorkDay || currentWorkDay.isPaused || currentWorkDay.endTime) {
          return
        }

        // Sync: Pausiere auch das Kategory-Tracking
        useSyncStore.getState().onWorkDayPause()

        set({
          currentWorkDay: {
            ...currentWorkDay,
            isPaused: true,
            pauseStart: new Date().toISOString(),
          },
        })
      },

      resumeWorkDay: () => {
        const { currentWorkDay } = get()
        if (!currentWorkDay || !currentWorkDay.isPaused || !currentWorkDay.pauseStart) {
          return
        }

        const pauseEnd = new Date()
        const pauseStart = new Date(currentWorkDay.pauseStart)
        const pauseDurationMinutes = Math.floor((pauseEnd.getTime() - pauseStart.getTime()) / 60000)

        // Sync: Setze Kategory-Tracking fort
        useSyncStore.getState().onWorkDayResume()

        set({
          currentWorkDay: {
            ...currentWorkDay,
            isPaused: false,
            pauseStart: null,
            totalPauseMinutes: currentWorkDay.totalPauseMinutes + pauseDurationMinutes,
          },
        })
      },

      endWorkDay: () => {
        const { currentWorkDay } = get()
        if (!currentWorkDay || currentWorkDay.endTime) {
          return
        }

        // Sync: Beende auch das Kategory-Tracking
        useSyncStore.getState().onWorkDayEnd()

        set({
          currentWorkDay: {
            ...currentWorkDay,
            endTime: new Date().toISOString(),
          },
        })
      },

      getCurrentWorkDay: () => {
        return get().currentWorkDay
      },

      getTotalWorkTime: () => {
        const { currentWorkDay } = get()
        if (!currentWorkDay) {
          return 0
        }

        const start = new Date(currentWorkDay.startTime).getTime()
        const end = currentWorkDay.endTime 
          ? new Date(currentWorkDay.endTime).getTime() 
          : Date.now()
        
        const grossTime = end - start
        const pauseTimeMs = currentWorkDay.totalPauseMinutes * 60000
        
        return grossTime - pauseTimeMs
      },

      getPauseTime: () => {
        const { currentWorkDay } = get()
        if (!currentWorkDay) {
          return 0
        }

        let totalPause = currentWorkDay.totalPauseMinutes * 60000

        // Add current paused time if currently paused
        if (currentWorkDay.isPaused && currentWorkDay.pauseStart) {
          const pauseStart = new Date(currentWorkDay.pauseStart).getTime()
          totalPause += Date.now() - pauseStart
        }

        return totalPause
      },
    }),
    {
      name: STORAGE_KEY,
      partialize: (state) => ({ currentWorkDay: state.currentWorkDay }),
    }
  )
)
