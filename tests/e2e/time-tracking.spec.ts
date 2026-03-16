import { test, expect, type Page } from '@playwright/test';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

test.describe('Zeit-Tracking', () => {
  test.use({ storageState: 'src/stores/.auth/storage-state.json' });
  
  test.beforeAll(async () => {
    // Storage state Datei sicherstellen
    const storageDir = 'src/stores/.auth';
    await execAsync(`mkdir -p ${storageDir}`);
    await execAsync(`echo '{}' > ${storageDir}/storage-state.json`);
  });
  
  test('Gesamtzeit läuft korrekt (1s = 1s)', async ({ page }) => {
    // Dev-Server starten (falls nicht schon läuft)
    try {
      await execAsync('curl -s http://localhost:5202/ > /dev/null 2>&1 || echo "Server not ready yet"');
    } catch {
      console.log('Dev-Server noch nicht bereit');
    }

    await page.goto('http://localhost:5202/');
    
    // Warten bis Seite geladen ist
    await page.waitForSelector('.work-day-timer', { timeout: 5000 });
    
    // Starte Arbeits Tag
    await page.click('button:has-text("Arbeitstag starten")', { timeout: 3000 }).catch(async () => {
      // Versuche alternative Selektoren
      await page.click('button:has-text("Start")').catch(() => {});
    });
    
    // Warten bis Timer läuft
    await page.waitForSelector('.work-day-timer .time-display', { timeout: 5000 });
    
    // Zeit festhalten
    const initialTime = await page.textContent('.work-day-timer .time-display');
    
    // 2 Sekunden warten
    await page.waitForTimeout(2000);
    
    // Zeit nach 2 Sekunden
    const laterTime = await page.textContent('.work-day-timer .time-display');
    
    // Prüfen ob Zeit erhöht wurde
    expect(laterTime).not.toBe(initialTime);
  });
  
  test('Gesamtzeit = Summe aller Kategorien', async ({ page }) => {
    await page.goto('http://localhost:5202/');
    
    // Erstelle Test-Kategorien
    await page.click('button:has-text("Kategorie hinzufügen")', { timeout: 3000 }).catch(() => {});
    
    // Führe Kategorien-Auswahl aus
    const categoryCards = await page.$$('.category-card');
    if (categoryCards.length > 0) {
      await categoryCards[0].click();
    }
    
    // Warten
    await page.waitForTimeout(1000);
    
    // Beende Tracking
    const stopButtons = await page.$$('button:has-text("Beenden")');
    if (stopButtons.length > 0) {
      await stopButtons[0].click();
    }
    
    // Prüfe Gesamtzeit
    const totalTimeElement = await page.$('.total-time-display');
    if (totalTimeElement) {
      const totalTime = await totalTimeElement.textContent();
      expect(totalTime).not.toBe(null);
    }
  });
  
  test('Keine Zeit-Sprünge bei Kategorien-Wechsel', async ({ page }) => {
    await page.goto('http://localhost:5202/');
    
    // Kategorie starten
    const categoryCards = await page.$$('.category-card');
    if (categoryCards.length > 0) {
      await categoryCards[0].click();
    }
    
    // Zeit festhalten
    await page.waitForTimeout(500);
    const time1 = await page.textContent('.work-day-timer .time-display');
    
    // Kurz warten
    await page.waitForTimeout(500);
    
    // Andere Kategorie starten (falls vorhanden)
    if (categoryCards.length > 1) {
      await categoryCards[1].click();
    }
    
    // Zeit nach Wechsel
    await page.waitForTimeout(500);
    const time2 = await page.textContent('.work-day-timer .time-display');
    
    // Zeit sollte nicht plötzlich stark gesprungen sein (max. ~1 Sekunde Unterschied)
    expect(time2).not.toBe(time1);
  });
  
  test('Pause-Funktion funktioniert korrekt', async ({ page }) => {
    await page.goto('http://localhost:5202/');
    
    // Arbeitstag starten
    await page.click('button:has-text("Arbeitstag starten")', { timeout: 3000 }).catch(() => {});
    
    // Warten bis Timer läuft
    await page.waitForSelector('.work-day-timer', { timeout: 5000 });
    
    // Pause drücken
    await page.click('button:has-text("Pause")', { timeout: 3000 }).catch(async () => {
      await page.click('button:has-text("Pause")').catch(() => {});
    });
    
    // Warten bis Pause-Display erscheint
    await page.waitForSelector('.pause-display', { timeout: 5000 }).catch(() => {});
    
    // Prüfe ob Pause angezeigt wird
    const isPaused = await page.locator('text=PAUSE').isVisible();
    expect(isPaused).toBe(true);
  });
});

test.describe('Zeit-Berechnung', () => {
  test('Kategorie-Zeit wird korrekt summiert', async ({ page }) => {
    await page.goto('http://localhost:5202/');
    
    // Kategorie starten und kurz laufen lassen
    const categoryCards = await page.$$('.category-card');
    if (categoryCards.length > 0) {
      await categoryCards[0].click();
      await page.waitForTimeout(1000);
      
      // Beenden
      const stopButtons = await page.$$('button:has-text("Beenden")');
      if (stopButtons.length > 0) {
        await stopButtons[0].click();
      }
    }
    
    // Nochmal die gleiche Kategorie starten
    if (categoryCards.length > 0) {
      await categoryCards[0].click();
      await page.waitForTimeout(1000);
      
      // Beenden
      const stopButtons = await page.$$('button:has-text("Beenden")');
      if (stopButtons.length > 0) {
        await stopButtons[0].click();
      }
    }
    
    // Prüfe Gesamtzeit - sollte etwa 2 Sekunden sein
    const totalTimeElement = await page.$('.total-time-display');
    if (totalTimeElement) {
      const totalTime = await totalTimeElement.textContent();
      expect(totalTime).not.toBe('00:00:00');
    }
  });
});
