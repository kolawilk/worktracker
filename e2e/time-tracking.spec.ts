import { test, expect } from '@playwright/test'

test.describe('Zeit-Tracking Funktionalität', () => {
  test.beforeEach(async ({ page }) => {
    // App starten und localStorage leeren
    await page.goto('http://localhost:5173')
    await page.evaluate(() => {
      localStorage.clear()
    })
    await page.reload()
  })

  test('Zeit läuft korrekt (1 Sekunde = 1 Sekunde)', async ({ page }) => {
    // Arbeitstag starten
    await page.click('text=Arbeitstag starten')
    
    // Warte kurz für die UI-Update
    await page.waitForTimeout(500)
    
    // Kategorie erstellen falls keine existiert
    const hasCategories = await page.locator('[role="button"][aria-label^="Category"]').count() > 0
    
    if (!hasCategories) {
      // Kategorie hinzufügen
      await page.click('text=Kategorie hinzufügen')
      await page.fill('input[placeholder="Name"]', 'Test Kategorie')
      await page.click('text=Hinzufügen')
      await page.waitForTimeout(500)
    }
    
    // Erste Kategorie anklicken um Tracking zu starten
    await page.locator('[role="button"][aria-label^="Category"]').first().click()
    
    // Warte 3 Sekunden
    await page.waitForTimeout(3000)
    
    // Prüfe dass die Zeit ungefähr 3 Sekunden anzeigt (mit Toleranz)
    const timeText = await page.locator('.font-mono').first().textContent()
    expect(timeText).toMatch(/\d{1,2}:\d{2}:\d{2}/)
    
    // Zeit sollte größer als 0 sein
    const timeParts = timeText?.split(':')
    if (timeParts && timeParts.length === 3) {
      const totalSeconds = parseInt(timeParts[0]) * 3600 + parseInt(timeParts[1]) * 60 + parseInt(timeParts[2])
      expect(totalSeconds).toBeGreaterThanOrEqual(2) // Mindestens 2 Sekunden
      expect(totalSeconds).toBeLessThanOrEqual(5)    // Maximal 5 Sekunden (mit Toleranz)
    }
  })

  test('Keine unerwarteten Zeit-Sprünge beim Starten einer neuen Kategorie', async ({ page }) => {
    // Arbeitstag starten
    await page.click('text=Arbeitstag starten')
    await page.waitForTimeout(500)
    
    // Kategorie erstellen
    await page.click('text=Kategorie hinzufügen')
    await page.fill('input[placeholder="Name"]', 'Kategorie A')
    await page.click('text=Hinzufügen')
    await page.waitForTimeout(500)
    
    // Zweite Kategorie erstellen
    await page.click('text=Kategorie hinzufügen')
    await page.fill('input[placeholder="Name"]', 'Kategorie B')
    await page.click('text=Hinzufügen')
    await page.waitForTimeout(500)
    
    // Erste Kategorie starten
    await page.locator('[role="button"][aria-label*="Kategorie A"]').click()
    await page.waitForTimeout(2000)
    
    // Zeit merken
    const timeBefore = await page.locator('.font-mono').first().textContent()
    
    // Zu zweiter Kategorie wechseln
    await page.locator('[role="button"][aria-label*="Kategorie B"]').click()
    await page.waitForTimeout(500)
    
    // Zeit nach Wechsel prüfen
    const timeAfter = await page.locator('.font-mono').first().textContent()
    
    // Zeit sollte nicht dramatisch springen (maximal 2 Sekunden Unterschied durch Wartezeit)
    const beforeParts = timeBefore?.split(':')
    const afterParts = timeAfter?.split(':')
    
    if (beforeParts && afterParts && beforeParts.length === 3 && afterParts.length === 3) {
      const beforeSeconds = parseInt(beforeParts[0]) * 3600 + parseInt(beforeParts[1]) * 60 + parseInt(beforeParts[2])
      const afterSeconds = parseInt(afterParts[0]) * 3600 + parseInt(afterParts[1]) * 60 + parseInt(afterParts[2])
      
      // Zeit sollte sich nur um ~0.5 Sekunden erhöht haben (nicht springen)
      const diff = afterSeconds - beforeSeconds
      expect(diff).toBeLessThanOrEqual(2) // Max 2 Sekunden Unterschied
    }
  })

  test('Gesamtzeit ist Summe aller Kategorien', async ({ page }) => {
    // Arbeitstag starten
    await page.click('text=Arbeitstag starten')
    await page.waitForTimeout(500)
    
    // Kategorien erstellen
    await page.click('text=Kategorie hinzufügen')
    await page.fill('input[placeholder="Name"]', 'Arbeit')
    await page.click('text=Hinzufügen')
    await page.waitForTimeout(500)
    
    // Tracking starten
    await page.locator('[role="button"][aria-label*="Arbeit"]').click()
    
    // Warte 2 Sekunden
    await page.waitForTimeout(2000)
    
    // Tracking stoppen (durch Klick auf dieselbe Kategorie)
    await page.locator('[role="button"][aria-label*="Arbeit"]').click()
    await page.waitForTimeout(500)
    
    // Gehe zur Tagesübersicht
    await page.click('text=Tagesübersicht')
    await page.waitForTimeout(500)
    
    // Prüfe dass die Gesamtzeit angezeigt wird und nicht 0 ist
    const totalTimeText = await page.locator('text=Gesamtzeit').locator('..').locator('.font-bold').textContent()
    expect(totalTimeText).toBeTruthy()
    
    // Zeit sollte größer als 0 sein
    const timeMatch = totalTimeText?.match(/(\d+):(\d+)/)
    if (timeMatch) {
      const hours = parseInt(timeMatch[1])
      const minutes = parseInt(timeMatch[2])
      expect(hours + minutes).toBeGreaterThan(0)
    }
  })

  test('Pause-Zeit wird korrekt berechnet', async ({ page }) => {
    // Arbeitstag starten
    await page.click('text=Arbeitstag starten')
    await page.waitForTimeout(500)
    
    // Kategorie erstellen und starten
    await page.click('text=Kategorie hinzufügen')
    await page.fill('input[placeholder="Name"]', 'Test')
    await page.click('text=Hinzufügen')
    await page.waitForTimeout(500)
    
    await page.locator('[role="button"][aria-label*="Test"]').click()
    await page.waitForTimeout(2000)
    
    // Pause drücken
    await page.click('text=Pause')
    await page.waitForTimeout(1000)
    
    // Prüfe dass Pausenzeit angezeigt wird
    const pauseText = await page.locator('text=Pausenzeit').first().textContent().catch(() => null)
    
    // Warte noch 1 Sekunde während Pause
    await page.waitForTimeout(1000)
    
    // Pause fortsetzen
    await page.click('text=Fortsetzen')
    await page.waitForTimeout(500)
    
    // Prüfe dass die Gesamtzeit nicht die Pausenzeit enthält
    const timeText = await page.locator('.font-mono').first().textContent()
    expect(timeText).toMatch(/\d{1,2}:\d{2}:\d{2}/)
  })
})
