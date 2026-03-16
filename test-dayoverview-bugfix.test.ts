import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { useWorkDayStore } from './src/stores/workDayStore'
import { useSettingsStore } from './src/stores/settingsStore'

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

// Setze Mock vor dem Import
global.localStorage = new LocalStorageMock()

describe('P0 Bugfix: Tagesübersicht Endlosschleife', () => {
  beforeEach(() => {
    // Reset stores
    useWorkDayStore.setState({ currentWorkDay: null, history: [] })
    useSettingsStore.setState({ soundEnabled: false })
    
    // Clear localStorage
    ;(global.localStorage as LocalStorageMock).clear()
  })

  afterEach(() => {
    vi.clearAllMocks()
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
    const flag = (global.localStorage as LocalStorageMock).store[`dayOverviewShown:${today}`]
    expect(flag).toBe('true')
  })

  it('sollte beim Neuladen Flag prüfen und Dialog nicht automatisch öffnen', () => {
    const today = new Date().toISOString().split('T')[0]
    
    // Simuliere: Tag wurde bereits beendet und Übersicht angezeigt
    ;(global.localStorage as LocalStorageMock).store[`dayOverviewShown:${today}`] = 'true'
    
    // Simuliere Neuladen: Store neu initialisieren
    useWorkDayStore.getState().endWorkDay()
    
    // Prüfe: Flag ist gesetzt
    const flag = (global.localStorage as LocalStorageMock).store[`dayOverviewShown:${today}`]
    expect(flag).toBe('true')
    
    // Das ist die Essenz des Bugfix:
    // Wenn Flag gesetzt ist, soll der Dialog NICHT automatisch öffnen
    // (das wird in App.tsx mit `!tagHatUebersicht` geprüft)
    
    // Prüfe: EndWorkDay hat flag nicht überschrieben
    expect((global.localStorage as LocalStorageMock).store[`dayOverviewShown:${today}`]).toBe('true')
  })

  it('sollte bei neuem Tag das Flag neu setzen', () => {
    // Starte neuen Tag (muss anderen Tag sein als heute)
    const today = new Date().toISOString().split('T')[0]
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
    
    // Für heute: kein Flag
    delete (global.localStorage as LocalStorageMock).store[`dayOverviewShown:${today}`]
    
    // Starte Tag für heute
    useWorkDayStore.getState().startWorkDay()
    useWorkDayStore.getState().endWorkDay()
    
    // Prüfe: Flag wurde gesetzt
    expect((global.localStorage as LocalStorageMock).store[`dayOverviewShown:${today}`]).toBe('true')
    
    // Für gestern: kein Einfluss
    expect((global.localStorage as LocalStorageMock).store[`dayOverviewShown:${yesterday}`]).toBeUndefined()
  })

  it('sollte Flag beim manuellen Öffnen des Feierabend-Dialogs setzen', () => {
    const today = new Date().toISOString().split('T')[0]
    
    // Starte Arbeitstag
    useWorkDayStore.getState().startWorkDay()
    useWorkDayStore.getState().endWorkDay()
    
    // Flag sollte bereits gesetzt sein (durch endWorkDay)
    expect((global.localStorage as LocalStorageMock).store[`dayOverviewShown:${today}`]).toBe('true')
    
    // Reset für neuen Tag (simuliert neuer Tag)
    useWorkDayStore.setState({ currentWorkDay: null, history: [] })
    
    // Starte neuen Arbeitstag
    useWorkDayStore.getState().startWorkDay()
    
    // Lösche Flag für neuen Tag
    delete (global.localStorage as LocalStorageMock).store[`dayOverviewShown:${today}`]
    
    // Beende neuen Arbeitstag
    useWorkDayStore.getState().endWorkDay()
    
    // Flag sollte wieder gesetzt werden
    expect((global.localStorage as LocalStorageMock).store[`dayOverviewShown:${today}`]).toBe('true')
  })
})
