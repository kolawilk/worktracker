import { chromium } from '@playwright/test';
import * as fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const screenshotsDir = join(__dirname, 'docs', 'screenshots');

// Create directory if it doesn't exist
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
  console.log(`Created directory: ${screenshotsDir}`);
}

async function takeScreenshots() {
  const browser = await chromium.launch({
    headless: true,
  });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('Navigating to dev server...');
  await page.goto('http://localhost:5175/');
  
  await page.waitForSelector('text=Noch keine Kategorien vorhanden', { timeout: 5000 });
  
  // Screenshot 1: Leeres Dashboard
  await page.screenshot({
    path: join(screenshotsDir, '1-dashboard-leer.png'),
    fullPage: true,
  });
  console.log('Screenshot 1: Dashboard leer gespeichert');

  // Kategorie erstellen
  await page.click('button:has-text("+ Neue Kategorie")');
  await page.fill('#category-name', 'Arbeit');
  await page.fill('#category-emoji', '💼');
  await page.click('button:has-text("Speichern")');
  await page.waitForSelector('text=Arbeit');
  
  // Screenshot 2: Mit einer Kategorie
  await page.screenshot({
    path: join(screenshotsDir, '2-eine-kategorie.png'),
    fullPage: true,
  });
  console.log('Screenshot 2: Mit Kategorie "Arbeit" gespeichert');

  // Zweite Kategorie erstellen
  await page.click('button:has-text("+ Neue Kategorie")');
  await page.fill('#category-name', 'Privat');
  await page.fill('#category-emoji', '🏠');
  await page.click('button:has-text("Speichern")');
  await page.waitForSelector('text=Privat');
  
  // Dritte Kategorie erstellen
  await page.click('button:has-text("+ Neue Kategorie")');
  await page.fill('#category-name', 'Training');
  await page.fill('#category-emoji', '🏃');
  await page.click('button:has-text("Speichern")');
  await page.waitForSelector('text=Training');

  // Screenshot 3: Mit mehreren Kategorien
  await page.screenshot({
    path: join(screenshotsDir, '3-mehrere-kategorien.png'),
    fullPage: true,
  });
  console.log('Screenshot 3: Mit mehreren Kategorien gespeichert');

  // Kategorie "Arbeit" klicken zum Starten des Trackings
  const arbeitCard = await page.locator('text=💼').first().locator('..').locator('..');
  await arbeitCard.click();
  await page.waitForTimeout(1000);
  
  // Screenshot 4: Tracking läuft
  await page.screenshot({
    path: join(screenshotsDir, '4-tracking-lauft.png'),
    fullPage: true,
  });
  console.log('Screenshot 4: Tracking läuft (Arbeit) gespeichert');

  // Kategorie "Privat" klicken zum Wechseln
  const privatCard = await page.locator('text=🏠').first().locator('..').locator('..');
  await privatCard.click();
  await page.waitForTimeout(1000);

  // Screenshot 5: Tracking gewechselt
  await page.screenshot({
    path: join(screenshotsDir, '5-tracking-privat.png'),
    fullPage: true,
  });
  console.log('Screenshot 5: Tracking auf "Privat" gewechselt gespeichert');

  // Stop button klicken
  const stopButton = await page.locator('button:has-text("⏹️ Stop Tracking")');
  await stopButton.click();
  await page.waitForTimeout(500);

  // Screenshot 6: Tracking gestoppt
  await page.screenshot({
    path: join(screenshotsDir, '6-tracking-stop.png'),
    fullPage: true,
  });
  console.log('Screenshot 6: Tracking gestoppt gespeichert');

  await browser.close();
  console.log('✅ Alle Screenshots erfolgreich erstellt!');
}

takeScreenshots().catch(console.error);
