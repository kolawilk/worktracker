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
  resumeEndedWorkDay: () => void
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

      resumeEndedWorkDay: () => {
        const { currentWorkDay } = get()
        if (!currentWorkDay || !currentWorkDay.endTime) {
          return
        }

        // Entferne das endTime, um den Tag fortzusetzen
        // Die Pausenzeit bleibt erhalten (Fehierabend war ja Pause)
        set({
          currentWorkDay: {
            ...currentWorkDay,
            endTime: null,
            isPaused: false,
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

        // Zeit-Berechnung MUST sein:
        // 1. Alle beendeten timeEntries addieren (feste Zeiten)
        // 2. Aktuelle laufende Session HINZUFÜGEN ( falls existiert )
        // 3. Pause abziehen
        
        const { timeEntries } = useTimeEntryStore.getState()
        const { session } = useTrackingStore.getState()
        
        const today = currentWorkDay.date
        const todayEntries = timeEntries.filter(entry => entry.date === today)
        
        // 🔍 WICHTIG: timeEntries sind BEENDET (endTime ist immer gesetzt)
        // session ist die AKTUELLE, LAUFENDE Session (NICHT in timeEntries gespeichert)
        
        let totalTime = todayEntries.reduce((total, entry) => {
          if (!entry.endTime) return total
          const start = new Date(entry.startTime).getTime()
          const end = new Date(entry.endTime).getTime()
          return total + (end - start)
        }, 0)

        // ✅ FIX: Nur die AKTUELLE laufende Session addieren (NICHT doppelt zählen!)
        if (session.isRunning && session.startTime && session.categoryId) {
          const sessionStart = new Date(session.startTime).getTime()
          totalTime += Date.now() - sessionStart
        }

        // Pausenzeit abziehen (inkl. aktuelle Pause falls pausiert)
        let totalPauseMs = currentWorkDay.totalPauseMinutes * 60000
        const pauseStart = currentWorkDay.pauseStart
        if (currentWorkDay.isPaused && pauseStart !== null) {
          totalPauseMs += Date.now() - new Date(pauseStart).getTime()
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
        if (currentWorkDay.isPaused && currentWorkDay.pauseStart !== null) {
          const pauseStart = new Date(currentWorkDay.pauseStart!).getTime()
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
