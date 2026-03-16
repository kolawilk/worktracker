import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { TimeEntry } from '@/types'

interface TimeEntryStore {
  timeEntries: TimeEntry[]
  addTimeEntry: (entry: Omit<TimeEntry, 'id'>) => void
  updateTimeEntry: (id: string, updates: Partial<TimeEntry>) => void
  deleteTimeEntry: (id: string) => void
  getTimeEntriesByDate: (date: string) => TimeEntry[]
  getTotalTimeByCategory: (categoryId: string, date?: string) => number
}

const STORAGE_KEY = 'worktracker-time-entries'

export const useTimeEntryStore = create<TimeEntryStore>()(
  persist(
    (set, get) => ({
      timeEntries: [],

      addTimeEntry: (entry) => {
        const newEntry: TimeEntry = {
          ...entry,
          id: crypto.randomUUID(),
        }
        set((state) => ({
          timeEntries: [...state.timeEntries, newEntry],
        }))
      },

      updateTimeEntry: (id, updates) => {
        set((state) => ({
          timeEntries: state.timeEntries.map((entry) =>
            entry.id === id ? { ...entry, ...updates } : entry
          ),
        }))
      },

      deleteTimeEntry: (id) => {
        set((state) => ({
          timeEntries: state.timeEntries.filter((entry) => entry.id !== id),
        }))
      },

      getTimeEntriesByDate: (date) => {
        return get().timeEntries.filter((entry) => entry.date === date)
      },

      getTotalTimeByCategory: (categoryId, date) => {
        const { timeEntries } = get()
        
        // Filtere Entries nach Kategorie
        let entries = timeEntries.filter((entry) => entry.categoryId === categoryId)
        
        // Filtere nach Datum, wenn angegeben
        if (date) {
          entries = entries.filter((entry) => entry.date === date)
        }

        // Berechne Gesamtzeit in Millisekunden
        // WICHTIG: Nur abgeschlossene Entries (mit endTime) mit endTime berechnen,
        // laufende Entries (ohne endTime) NUR mit Date.now()
        return entries.reduce((total, entry) => {
          const start = new Date(entry.startTime).getTime()
          
          // Wenn Entry abgeschlossen ist (endTime vorhanden)
          if (entry.endTime) {
            const end = new Date(entry.endTime).getTime()
            return total + (end - start)
          }
          
          // Wenn Entry noch läuft (kein endTime), berechne bis jetzt
          return total + (Date.now() - start)
        }, 0)
      },
    }),
    {
      name: STORAGE_KEY,
    }
  )
)
