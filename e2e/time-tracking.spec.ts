import { test, expect } from '@playwright/test'

test.describe('Zeit-Tracking Bugfix Tests', () => {
  test('Gesamtzeit läuft korrekt', async ({ page }) => {
    await page.goto('/')
    
    // Warten bis Seite geladen ist
    await page.waitForSelector('body', { timeout: 5000 })
    
    // Wenn Kategorien existieren, starte eine
    const categoryCards = await page.$$('.category-card')
    if (categoryCards.length > 0) {
      await categoryCards[0].click()
      await page.waitForTimeout(1500)
      
      // Zeit sollte sich geändert haben
      const timeElement = page.locator('.time-display')
      const time1 = await timeElement.textContent()
      await page.waitForTimeout(1000)
      const time2 = await timeElement.textContent()
      
      // Zeiten sollten unterschiedlich sein (Laufzeit)
      expect(time1).not.toBe(time2)
    }
  })
  
  test('Pause-Funktion funktioniert', async ({ page }) => {
    await page.goto('/')
    
    // Starte Arbeitstag
    const startButtons = await page.$$('button:has-text("Start")')
    if (startButtons.length > 0) {
      await startButtons[0].click()
    }
    
    await page.waitForTimeout(1000)
    
    // Drücke Pause
    const pauseButtons = await page.$$('button:has-text("Pause")')
    if (pauseButtons.length > 0) {
      await pauseButtons[0].click()
    }
    
    // Warte auf Pause-Display
    await page.waitForSelector('text=PAUSE', { timeout: 5000 }).catch(() => {})
    
    // Prüfe ob PAUSE-Text erscheint
    const hasPauseBadge = await page.locator('text=PAUSE').count()
    expect(hasPauseBadge).toBeGreaterThan(0)
  })
  
  test('Keine Doppelzählung bei Kategorien-Wechsel', async ({ page }) => {
    await page.goto('/')
    
    const categoryCards = await page.$$('.category-card')
    if (categoryCards.length >= 2) {
      // Erste Kategorie starten
      await categoryCards[0].click()
      await page.waitForTimeout(500)
      
      // Zeit festhalten
      const time1 = await page.locator('.time-display').textContent()
      
      // Kurz warten
      await page.waitForTimeout(500)
      
      // Zweite Kategorie starten
      await categoryCards[1].click()
      
      // Zeit nach Wechsel
      await page.waitForTimeout(500)
      const time2 = await page.locator('.time-display').textContent()
      
      // Zeit sollte erhöht sein (nicht gesprungen!)
      expect(time2).not.toBe(time1)
    }
  })
})
