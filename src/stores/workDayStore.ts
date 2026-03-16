import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { WorkDay } from '@/types'
import { useSyncStore } from './syncStore'
import { useTrackingStore } from './trackingStore'
import { playStartSound, playPauseSound, playResumeSound, playEndSound } from '@/lib/sounds'
import { useSettingsStore } from './settingsStore'
import { useTimeEntryStore } from './timeEntryStore'

// Hilfsfunktionen für localStorage-Flags
// WICHTIG: clearDayOverviewFlag ist absichtlich entfernt worden, da das Flag
// nur beim Start eines NEUEN Tages gesetzt wird (nicht gelöscht werden soll)

interface WorkDayStore {
  currentWorkDay: WorkDay | null
  history: WorkDay[]
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
      history: [],

      startWorkDay: () => {
        const { currentWorkDay, history } = get()
        const today = new Date()
        const date = today.toISOString().split('T')[0]
        
        // Wenn bereits ein Tag existiert und beendet wurde (endTime != null),
        // diesen zur History hinzufügen, bevor ein neuer Tag startet
        if (currentWorkDay && currentWorkDay.endTime !== null) {
          // Füge den beendeten Tag zur History hinzu (nicht überschreiben!)
          history.push(currentWorkDay)
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
          history,
        })
        
        // Sound Feedback
        if (useSettingsStore.getState().soundEnabled) {
          playStartSound()
        }
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
        
        // Sound Feedback
        if (useSettingsStore.getState().soundEnabled) {
          playPauseSound()
        }
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
        
        // Sound Feedback
        if (useSettingsStore.getState().soundEnabled) {
          playResumeSound()
        }
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
        
        // Sound Feedback
        if (useSettingsStore.getState().soundEnabled) {
          playEndSound()
        }
      },

      getCurrentWorkDay: () => {
        return get().currentWorkDay
      },

      getTotalWorkTime: () => {
        const { currentWorkDay } = get()
        if (!currentWorkDay) {
          return 0
        }

        // 1. Summiere alle timeEntries für diesen Tag
        const { timeEntries } = useTimeEntryStore.getState()
        const today = currentWorkDay.date
        const todayEntries = timeEntries.filter(entry => entry.date === today)
        
        let totalTime = todayEntries.reduce((total, entry) => {
          const start = new Date(entry.startTime).getTime()
          // entry.endTime ist immer gesetzt, da timeEntry nur gespeichert wird, wenn Tracking beendet wird
          const end = entry.endTime ? new Date(entry.endTime).getTime() : start
          return total + (end - start)
        }, 0)

        // 2. Addiere die aktuelle laufende Session (falls existiert)
        const { session } = useTrackingStore.getState()
        if (session.isRunning && session.startTime && session.categoryId) {
          const sessionStart = new Date(session.startTime).getTime()
          totalTime += Date.now() - sessionStart
        }

        // 3. Subtrahiere Pausenzeit (inkl. aktuelle Pausen-Dauer falls pausiert)
        let totalPauseMs = currentWorkDay.totalPauseMinutes * 60000
        if (currentWorkDay.isPaused && currentWorkDay.pauseStart) {
          const pauseStart = new Date(currentWorkDay.pauseStart).getTime()
          totalPauseMs += Date.now() - pauseStart
        }

        const result = totalTime - totalPauseMs
        return result > 0 ? result : 0  // 🔒 Verhindere negative Zeiten
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

        return totalPause > 0 ? totalPause : 0  // 🔒 Verhindere negative Pausenzeit
      },
    }),
    {
      name: STORAGE_KEY,
      partialize: (state) => ({ 
        currentWorkDay: state.currentWorkDay, 
        history: state.history 
      }),
    }
  )
)
