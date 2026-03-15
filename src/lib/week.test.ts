import { describe, it, expect } from 'vitest'
import { 
  getWeekStart, 
  formatISOWeek, 
  parseISOWeek, 
  getWeekDates,
  getRelativeWeek,
  formatDuration,
  formatDurationHHMM
} from './week'

describe('week utilities', () => {
  describe('getWeekStart', () => {
    it('should return Monday for a Wednesday', () => {
      const date = new Date('2026-03-18') // Wednesday
      const weekStart = getWeekStart(date)
      expect(weekStart.getDay()).toBe(1) // Monday
      expect(weekStart.getDate()).toBe(16) // March 16, 2026 is Monday
    })
  })

  describe('formatISOWeek', () => {
    it('should format 2026-03-18 as W12', () => {
      const date = new Date('2026-03-18')
      expect(formatISOWeek(date)).toBe('W12')
    })
  })

  describe('parseISOWeek', () => {
    it('should parse 2026-W12', () => {
      const result = parseISOWeek('2026-W12')
      expect(result.year).toBe(2026)
      expect(result.week).toBe(12)
    })
  })

  describe('getWeekDates', () => {
    it('should return correct dates for 2026-W12', () => {
      const { start, end } = getWeekDates('2026-W12')
      // Week 12 2026: March 16-22
      expect(start.getDate()).toBe(16)
      expect(end.getDate()).toBe(22)
    })
  })

  describe('getRelativeWeek', () => {
    it('should return previous week', () => {
      expect(getRelativeWeek('2026-W12', -1)).toBe('W11')
    })

    it('should return next week', () => {
      expect(getRelativeWeek('2026-W12', 1)).toBe('W13')
    })
  })

  describe('formatDuration', () => {
    it('should format seconds to hours and minutes', () => {
      expect(formatDuration(3600)).toBe('1h')
      expect(formatDuration(5400)).toBe('1h 30m')
      expect(formatDuration(90)).toBe('1m')
    })
  })

  describe('formatDurationHHMM', () => {
    it('should format seconds to HH:MM', () => {
      expect(formatDurationHHMM(3600)).toBe('1:00')
      expect(formatDurationHHMM(5400)).toBe('1:30')
      expect(formatDurationHHMM(90)).toBe('0:01')
    })
  })
})
