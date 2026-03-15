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
        let entries = timeEntries.filter((entry) => entry.categoryId === categoryId)
        
        if (date) {
          entries = entries.filter((entry) => entry.date === date)
        }

        return entries.reduce((total, entry) => {
          const start = new Date(entry.startTime).getTime()
          const end = entry.endTime ? new Date(entry.endTime).getTime() : Date.now()
          return total + Math.floor((end - start) / 1000)
        }, 0)
      },
    }),
    {
      name: STORAGE_KEY,
    }
  )
)
