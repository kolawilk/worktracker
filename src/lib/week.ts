/**
 * ISO-Week Berechnungsfunktionen
 * basierend auf ISO 8601 (Woche beginnt am Montag)
 */

/**
 * Ermittelt den Montag der Woche, die das angegebene Datum enthält
 * (ISO-Week: Woche beginnt am Montag)
 */
export function getWeekStart(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Montag ist Tag 1 in ISO
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return d
}

/**
 * Ermittelt den Sonntag der Woche, die das angegebene Datum enthält
 */
export function getWeekEnd(date: Date): Date {
  const weekStart = getWeekStart(date)
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 6)
  weekEnd.setHours(23, 59, 59, 999)
  return weekEnd
}

/**
 * Formatiert ein Datum als ISO-Woche (z.B. "2026-W12")
 */
export function formatISOWeek(date: Date): string {
  const d = new Date(date)
  d.setDate(d.getDate() + 4) // auf Donnerstag setzen für ISO-Week-Number
  const year = d.getFullYear()
  const dayOfYear = Math.floor((d.getTime() - new Date(year, 0, 1).getTime()) / 86400000)
  const weekNumber = Math.floor((dayOfYear + d.getDay() + 1) / 7)
  return `W${weekNumber.toString().padStart(2, '0')}`
}

/**
 * Extrahiert Jahr und Wochennummer aus einer ISO-Woche-String
 * @param isoWeekFormat "2026-W12"
 */
export function parseISOWeek(isoWeek: string): { year: number; week: number } {
  const match = isoWeek.match(/(\d{4})-?W(\d{2})/)
  if (!match) {
    throw new Error(`Ungültiges ISO-Week-Format: ${isoWeek}`)
  }
  return {
    year: parseInt(match[1], 10),
    week: parseInt(match[2], 10),
  }
}

/**
 * Berechnet die Start- und Enddaten einer Woche
 */
export function getWeekDates(weekString: string): { start: Date; end: Date } {
  const { year, week } = parseISOWeek(weekString)
  
  // Montag der angegebenen Woche berechnen
  const jan4 = new Date(year, 0, 4)
  const dayOfWeek = jan4.getDay() || 7
  const weekOneMonday = new Date(jan4)
  weekOneMonday.setDate(jan4.getDate() - dayOfWeek + 1)
  
  const start = new Date(weekOneMonday)
  start.setDate(start.getDate() + (week - 1) * 7)
  start.setHours(0, 0, 0, 0)
  
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  end.setHours(23, 59, 59, 999)
  
  return { start, end }
}

/**
 * Berechnet die Start- und Enddaten für die Vorherige/Nächste Woche
 */
export function getRelativeWeek(weekString: string, offset: number): string {
  const { year, week } = parseISOWeek(weekString)
  const newWeek = week + offset
  
  // Neue Woche im neuen Jahr?
  const jan4 = new Date(year, 0, 4)
  const dayOfWeek = jan4.getDay() || 7
  const weekOneMonday = new Date(jan4)
  weekOneMonday.setDate(jan4.getDate() - dayOfWeek + 1)
  
  const totalDays = (year - 1970) * 365 + Math.floor((year - 1969) / 4) + (newWeek - 1) * 7
  const newDate = new Date(1970, 0, 1)
  newDate.setDate(totalDays)
  
  return formatISOWeek(newDate)
}

/**
 * Formatiert Sekunden in menschenlesbares Format (z.B. "2h 30m")
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  
  if (hours === 0 && minutes === 0) {
    return '0m'
  }
  if (hours === 0) {
    return `${minutes}m`
  }
  if (minutes === 0) {
    return `${hours}h`
  }
  return `${hours}h ${minutes}m`
}

/**
 * Formatiert Sekunden als HH:MM
 */
export function formatDurationHHMM(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  return `${hours}:${minutes.toString().padStart(2, '0')}`
}
