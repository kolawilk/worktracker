/**
 * Analytics Helper Functions
 * Berechnet Auswertungen für das Analytics Dashboard
 */

import type { TimeEntry } from '@/types'
import type { Category } from '@/types'

// Zeitbereiche definieren
export interface TimeRange {
  label: string
  value: string
  getDates: () => { start: Date; end: Date }
}

export const getTimeRanges = (): TimeRange[] => [
  {
    label: 'Heute',
    value: 'today',
    getDates: () => {
      const start = new Date()
      start.setHours(0, 0, 0, 0)
      const end = new Date()
      end.setHours(23, 59, 59, 999)
      return { start, end }
    }
  },
  {
    label: 'Diese Woche',
    value: 'this-week',
    getDates: () => {
      const start = new Date()
      start.setDate(start.getDate() - start.getDay() + 1)
      start.setHours(0, 0, 0, 0)
      const end = new Date(start)
      end.setDate(start.getDate() + 6)
      end.setHours(23, 59, 59, 999)
      return { start, end }
    }
  },
  {
    label: 'Dieser Monat',
    value: 'this-month',
    getDates: () => {
      const start = new Date()
      start.setDate(1)
      start.setHours(0, 0, 0, 0)
      const end = new Date(start)
      end.setMonth(end.getMonth() + 1)
      end.setDate(0)
      end.setHours(23, 59, 59, 999)
      return { start, end }
    }
  },
  {
    label: 'Letzte Woche',
    value: 'last-week',
    getDates: () => {
      const start = new Date()
      start.setDate(start.getDate() - 7)
      start.setDate(start.getDate() - start.getDay() + 1)
      start.setHours(0, 0, 0, 0)
      const end = new Date(start)
      end.setDate(start.getDate() + 6)
      end.setHours(23, 59, 59, 999)
      return { start, end }
    }
  },
  {
    label: 'Letzter Monat',
    value: 'last-month',
    getDates: () => {
      const start = new Date()
      start.setMonth(start.getMonth() - 1)
      start.setDate(1)
      start.setHours(0, 0, 0, 0)
      const end = new Date(start)
      end.setMonth(end.getMonth() + 1)
      end.setDate(0)
      end.setHours(23, 59, 59, 999)
      return { start, end }
    }
  }
]

/**
 * Formatiiert Sekunden in menschenlesbares Format
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  
  if (hours === 0) {
    return `${minutes}m`
  }
  if (minutes === 0) {
    return `${hours}h`
  }
  return `${hours}h ${minutes}m`
}

/**
 * Formatiiert Sekunden als HH:MM
 */
export function formatDurationHHMM(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  return `${hours}:${minutes.toString().padStart(2, '0')}`
}

/**
 * Berechnet die Gesamtzeit für einen Zeitraum
 */
export function calculateTotalTime(entries: TimeEntry[]): number {
  return entries.reduce((sum, entry) => {
    const start = new Date(entry.startTime).getTime()
    const end = entry.endTime ? new Date(entry.endTime).getTime() : Date.now()
    return sum + Math.floor((end - start) / 1000)
  }, 0)
}

/**
 * Gruppiert Einträge nach Kategorie
 */
export function groupByCategory(entries: TimeEntry[], categories: Category[]): Array<{
  category: Category
  totalSeconds: number
}> {
  const result: Array<{ category: Category; totalSeconds: number }> = []
  
  for (const category of categories) {
    const totalSeconds = entries
      .filter(entry => entry.categoryId === category.id)
      .reduce((sum, entry) => {
        const start = new Date(entry.startTime).getTime()
        const end = entry.endTime ? new Date(entry.endTime).getTime() : Date.now()
        return sum + Math.floor((end - start) / 1000)
      }, 0)
    
    if (totalSeconds > 0) {
      result.push({ category, totalSeconds })
    }
  }
  
  // Nach Zeit sortieren (absteigend)
  return result.sort((a, b) => b.totalSeconds - a.totalSeconds)
}

/**
 * Berechnet Durchschnittszeit pro Wochentag
 */
export function calculateAverageByWeekday(entries: TimeEntry[]): {
  weekday: string
  dayIndex: number
  averageSeconds: number
  totalSeconds: number
  count: number
}[] {
  const days = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag']
  const weekdayData: Record<number, { totalSeconds: number; count: number }> = {
    0: { totalSeconds: 0, count: 0 },
    1: { totalSeconds: 0, count: 0 },
    2: { totalSeconds: 0, count: 0 },
    3: { totalSeconds: 0, count: 0 },
    4: { totalSeconds: 0, count: 0 },
    5: { totalSeconds: 0, count: 0 },
    6: { totalSeconds: 0, count: 0 }
  }
  
  entries.forEach(entry => {
    const start = new Date(entry.startTime)
    const end = entry.endTime ? new Date(entry.endTime) : new Date()
    const duration = Math.floor((end.getTime() - start.getTime()) / 1000)
    const dayIndex = start.getDay()
    
    weekdayData[dayIndex].totalSeconds += duration
    weekdayData[dayIndex].count += 1
  })
  
  return Object.entries(weekdayData)
    .map(([dayIndex, data]) => ({
      weekday: days[parseInt(dayIndex)],
      dayIndex: parseInt(dayIndex),
      averageSeconds: data.count > 0 ? Math.round(data.totalSeconds / data.count) : 0,
      totalSeconds: data.totalSeconds,
      count: data.count
    }))
    .sort((a, b) => a.dayIndex - b.dayIndex)
}

/**
 * Berechnet Zeit pro Monat für Trends
 */
export function calculateMonthlyData(entries: TimeEntry[], months: number = 12): {
  label: string
  value: number
}[] {
  const data: Record<string, number> = {}
  
  entries.forEach(entry => {
    const start = new Date(entry.startTime)
    const end = entry.endTime ? new Date(entry.endTime) : new Date()
    const duration = Math.floor((end.getTime() - start.getTime()) / 1000)
    const monthKey = `${start.getFullYear()}-${(start.getMonth() + 1).toString().padStart(2, '0')}`
    
    if (!data[monthKey]) {
      data[monthKey] = 0
    }
    data[monthKey] += duration
  })
  
  // Letzte X Monate berechnen
  const result: { label: string; value: number }[] = []
  const now = new Date()
  
  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`
    
    result.push({
      label: date.toLocaleDateString('de-DE', { month: 'short', year: '2-digit' }),
      value: data[monthKey] || 0
    })
  }
  
  return result
}

/**
 * Berechnet Zeit pro Tag für Tages-Trend
 */
export function calculateDailyData(entries: TimeEntry[], days: number = 30): {
  label: string
  value: number
}[] {
  const result: { label: string; value: number }[] = []
  const now = new Date()
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(now.getDate() - i)
    const dateKey = date.toISOString().split('T')[0]
    
    const dayEntries = entries.filter(entry => entry.date === dateKey)
    const totalSeconds = dayEntries.reduce((sum, entry) => {
      const start = new Date(entry.startTime).getTime()
      const end = entry.endTime ? new Date(entry.endTime).getTime() : Date.now()
      return sum + Math.floor((end - start) / 1000)
    }, 0)
    
    result.push({
      label: date.toLocaleDateString('de-DE', { day: '2-digit', month: 'short' }),
      value: totalSeconds
    })
  }
  
  return result
}

/**
 * Filtert Einträge nach Kategorien
 */
export function filterEntriesByCategories(entries: TimeEntry[], categoryIds: string[]): TimeEntry[] {
  if (categoryIds.length === 0) {
    return entries
  }
  return entries.filter(entry => categoryIds.includes(entry.categoryId))
}
