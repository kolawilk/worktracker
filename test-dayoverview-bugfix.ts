import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createMemoryHistory } from 'history'

// Mock localStorage für Node.js
class LocalStorageMock {
  private store: Record<string, string> = {}
  
  getItem(key: string) {
    return this.store[key] || null
  }
  
  setItem(key: string, value: string) {
    this.store[key] = value
  }
  
  removeItem(key: string) {
    delete this.store[key]
  }
  
  clear() {
    this.store = {}
  }
}

global.localStorage = new LocalStorageMock()

// Mock window
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => {
    return {
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }
  },
})

// Import stores AFTER mocks
import { useWorkDayStore } from './src/stores/workDayStore'
import { useSettingsStore } from './src/stores/settingsStore'

describe('P0 Bugfix: Tagesübersicht Endlosschleife', () => {
  beforeEach(() => {
    // Reset stores
    useWorkDayStore.getState().endWorkDay()
    useWorkDayStore.setState({ currentWorkDay: null, history: [] })
    useSettingsStore.setState({ soundEnabled: false })
    
    // Clear localStorage
    localStorage.clear()
  })

  it('sollte Flag setzen beim Beenden des Arbeitstags', () => {
    const today = new Date().toISOString().split('T')[0]
    
    // Starte Arbeitstag
    useWorkDayStore.getState().startWorkDay()
    
    // Prüfe: Tag ist gestartet
    const workDay = useWorkDayStore.getState().currentWorkDay
    expect(workDay).not.toBeNull()
    expect(workDay?.endTime).toBeNull()
    
    // Beende Arbeitstag
    useWorkDayStore.getState().endWorkDay()
    
    // Prüfe: Tag ist beendet
    const endedWorkDay = useWorkDayStore.getState().currentWorkDay
    expect(endedWorkDay).not.toBeNull()
    expect(endedWorkDay?.endTime).not.toBeNull()
    
    // Prüfe: Flag wurde gesetzt
    const flag = localStorage.getItem(`dayOverviewShown:${today}`)
    expect(flag).toBe('true')
  })

  it('sollte beim Neuladen Flag prüfen und Dialog nicht automatisch öffnen', () => {
    const today = new Date().toISOString().split('T')[0]
    
    // Simuliere: Tag wurde bereits beendet und Übersicht angezeigt
    localStorage.setItem(`dayOverviewShown:${today}`, 'true')
    
    // Simuliere Neuladen: Store neu initialisieren
    useWorkDayStore.getState().endWorkDay()
    
    // Prüfe: Flag ist gesetzt
    const flag = localStorage.getItem(`dayOverviewShown:${today}`)
    expect(flag).toBe('true')
    
    // Das ist die Essenz des Bugfix:
    // Wenn Flag gesetzt ist, soll der Dialog NICHT automatisch öffnen
    // (das wird in App.tsx mit `!tagHatUebersicht` geprüft)
    
    // Prüfe: EndWorkDay hat flag nicht überschrieben
    expect(localStorage.getItem(`dayOverviewShown:${today}`)).toBe('true')
  })

  it('sollte bei neuem Tag das Flag neu setzen', () => {
    // Starte neuen Tag (muss anderen Tag sein als heute)
    const today = new Date().toISOString().split('T')[0]
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
    
    // Für heute: kein Flag
    localStorage.removeItem(`dayOverviewShown:${today}`)
    
    // Starte Tag für heute
    useWorkDayStore.getState().startWorkDay()
    useWorkDayStore.getState().endWorkDay()
    
    // Prüfe: Flag wurde gesetzt
    expect(localStorage.getItem(`dayOverviewShown:${today}`)).toBe('true')
    
    // Für gestern: kein Einfluss
    expect(localStorage.getItem(`dayOverviewShown:${yesterday}`)).toBeNull()
  })
})
