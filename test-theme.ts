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

async function testDarkMode() {
  const browser = await chromium.launch({
    headless: true,
  });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('Navigating to dev server...');
  await page.goto('http://localhost:5177/');
  
  await page.waitForSelector('#root', { timeout: 5000 });
  
  // Warte auf Laden
  await page.waitForTimeout(2000);
  
  // Check ob ThemeSwitcher im DOM ist
  const hasThemeSwitcher = await page.locator('button[aria-label="Theme wechseln"]').count();
  console.log(`ThemeSwitcher found: ${hasThemeSwitcher}`);

  // Screenshot 1: Im Light Mode (Standard)
  await page.screenshot({
    path: join(screenshotsDir, '7-theme-light-default.png'),
    fullPage: true,
  });
  console.log('Screenshot 1: Light Mode (Default) gespeichert');

  // Theme Switcher finden und klicken
  const themeSwitcher = await page.locator('[aria-label="Theme wechseln"]').first();
  await themeSwitcher.click();
  await page.waitForTimeout(500);

  // Dark Mode auswählen
  await page.click('button:has-text("Dunkel")');
  await page.waitForTimeout(500);

  // Screenshot 2: Im Dark Mode
  await page.screenshot({
    path: join(screenshotsDir, '8-theme-dark.png'),
    fullPage: true,
  });
  console.log('Screenshot 2: Dark Mode gespeichert');

  // Theme Switcher wieder öffnen
  await themeSwitcher.click();
  await page.waitForTimeout(500);

  // System Mode auswählen
  await page.click('button:has-text("System")');
  await page.waitForTimeout(500);

  // Screenshot 3: Im System Mode
  await page.screenshot({
    path: join(screenshotsDir, '9-theme-system.png'),
    fullPage: true,
  });
  console.log('Screenshot 3: System Mode gespeichert');

  //localStorage checken
  const storedTheme = await page.evaluate(() => localStorage.getItem('worktracker-theme'));
  console.log(`Stored theme in localStorage: ${storedTheme}`);

  await browser.close();
  console.log('✅ Dark Mode Tests erfolgreich abgeschlossen!');
}

testDarkMode().catch(console.error);
