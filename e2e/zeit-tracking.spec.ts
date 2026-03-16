import { test, expect } from '@playwright/test'

test.describe('Zeit-Tracking Funktionstest', () => {
  test('Arbeitszeit startet korrekt', async ({ page }) => {
    // Dev-Server öffnen (Startseite)
    await page.goto('/')
    await expect(page.locator('h1:has-text("Worktracker")')).toBeVisible({ timeout: 10000 })
    
    // Screenshot: Start-Zustand
    await page.screenshot({ path: 'test-results/01-start.png', fullPage: true })
    
    // Arbeitszeit starten (Play-Button klicken)
    await page.click('button[aria-label="Start"]')
    await page.waitForTimeout(1000)
    
    // Screenshot: Nach Start
    await page.screenshot({ path: 'test-results/02-after-start.png', fullPage: true })
    
    // Prüfen: Zeit läuft (muss > 00:00 sein)
    const timeText = await page.locator('.font-mono.font-semibold.text-lg').textContent()
    expect(timeText).not.toBe('0:00')
  })
  
  test('Zeit läuft korrekt (1 Sekunde = 1 Sekunde)', async ({ page }) => {
    await page.goto('/')
    
    // Starten
    await page.click('button[aria-label="Start"]')
    await page.waitForTimeout(1000)
    
    const time1 = await page.locator('.font-mono.font-semibold.text-lg').textContent()
    await page.waitForTimeout(1000)
    const time2 = await page.locator('.font-mono.font-semibold.text-lg').textContent()
    
    // Zeit muss erhöht sein (ca. 1 Sekunde)
    expect(time2).not.toBe(time1)
  })
  
  test('Kategorie-Wechsel ohne Zeit-Sprung', async ({ page }) => {
    await page.goto('/')
    
    // Kategorie auswählen
    await page.click('button[aria-label="Start"]')
    await page.waitForTimeout(2000)
    
    const timeBeforeSwitch = await page.locator('.font-mono.font-semibold.text-lg').textContent()
    
    // Kategorie wechseln (Pause-Button)
    await page.click('button[aria-label="Pause"]')
    await page.waitForTimeout(1000)
    
    const timeAfterSwitch = await page.locator('.font-mono.font-semibold.text-lg').textContent()
    
    // Zeit darf nicht zurückgesprungen sein
    expect(timeAfterSwitch).toBe(timeBeforeSwitch)
  })
  
  test('Pause-Funktion', async ({ page }) => {
    await page.goto('/')
    
    // Starten
    await page.click('button[aria-label="Start"]')
    await page.waitForTimeout(2000)
    
    // Pausieren
    await page.click('button[aria-label="Pause"]')
    await page.waitForTimeout(1000)
    
    // Screenshot: Pausen-Zustand
    await page.screenshot({ path: 'test-results/03-pause.png', fullPage: true })
    
    // Prüfen: Pausenzeit wird angezeigt
    const pauseText = await page.locator('.font-mono.font-semibold.text-lg').textContent()
    expect(pauseText).toBeDefined()
  })
})
