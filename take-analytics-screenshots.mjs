import { chromium } from 'playwright';
import * as fs from 'fs';

async function captureAnalyticsScreenshots() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--disable-gpu', '--no-sandbox', '--disable-dev-shm-usage']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  // LocalStorage mit Testdaten füllen
  console.log('Navigiere zur Startseite (Port 5186)...');
  await page.goto('http://localhost:5186');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  
  console.log('Speichere Testdaten in LocalStorage...');
  await page.evaluate(() => {
    // Kategorien - mit korrektem Format für zustand/persist categoryStore
    const categories = [
      { id: 'cat1', name: '💼 Arbeit', emoji: '💼', color: '#3B82F6', createdAt: new Date().toISOString() },
      { id: 'cat2', name: '🏠 Privat', emoji: '🏠', color: '#10B981', createdAt: new Date().toISOString() },
      { id: 'cat3', name: '📊 Meeting', emoji: '📊', color: '#8B5CF6', createdAt: new Date().toISOString() },
      { id: 'cat4', name: '✈️ Reisen', emoji: '✈️', color: '#F59E0B', createdAt: new Date().toISOString() },
      { id: 'cat5', name: '📝 Dokumentation', emoji: '📝', color: '#EF4444', createdAt: new Date().toISOString() }
    ];
    
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const day2 = new Date(now);
    day2.setDate(day2.getDate() - 2);
    const day3 = new Date(now);
    day3.setDate(day3.getDate() - 3);
    const day4 = new Date(now);
    day4.setDate(day4.getDate() - 4);
    const day5 = new Date(now);
    day5.setDate(day5.getDate() - 5);
    const day6 = new Date(now);
    day6.setDate(day6.getDate() - 6);
    
    // TimeEntries - mit korrektem Format für zustand/persist timeEntryStore
    // WICHTIG: date-Feld muss enthalten sein!
    const entries = [
      // Heute
      { id: 'e1', categoryId: 'cat1', startTime: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 0, 0).toISOString(), endTime: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 10, 30, 0).toISOString(), date: now.toISOString().split('T')[0] },
      { id: 'e2', categoryId: 'cat3', startTime: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 11, 0, 0).toISOString(), endTime: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0).toISOString(), date: now.toISOString().split('T')[0] },
      { id: 'e3', categoryId: 'cat1', startTime: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 14, 0, 0).toISOString(), endTime: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 17, 0, 0).toISOString(), date: now.toISOString().split('T')[0] },
      
      // Gestern
      { id: 'e4', categoryId: 'cat1', startTime: new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 9, 0, 0).toISOString(), endTime: new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 12, 0, 0).toISOString(), date: yesterday.toISOString().split('T')[0] },
      { id: 'e5', categoryId: 'cat2', startTime: new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 13, 0, 0).toISOString(), endTime: new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 16, 30, 0).toISOString(), date: yesterday.toISOString().split('T')[0] },
      
      // Vor 2 Tagen
      { id: 'e6', categoryId: 'cat3', startTime: new Date(day2.getFullYear(), day2.getMonth(), day2.getDate(), 10, 0, 0).toISOString(), endTime: new Date(day2.getFullYear(), day2.getMonth(), day2.getDate(), 11, 30, 0).toISOString(), date: day2.toISOString().split('T')[0] },
      { id: 'e7', categoryId: 'cat1', startTime: new Date(day2.getFullYear(), day2.getMonth(), day2.getDate(), 14, 0, 0).toISOString(), endTime: new Date(day2.getFullYear(), day2.getMonth(), day2.getDate(), 17, 0, 0).toISOString(), date: day2.toISOString().split('T')[0] },
      
      // Vor 3 Tagen
      { id: 'e8', categoryId: 'cat2', startTime: new Date(day3.getFullYear(), day3.getMonth(), day3.getDate(), 9, 0, 0).toISOString(), endTime: new Date(day3.getFullYear(), day3.getMonth(), day3.getDate(), 10, 0, 0).toISOString(), date: day3.toISOString().split('T')[0] },
      { id: 'e9', categoryId: 'cat1', startTime: new Date(day3.getFullYear(), day3.getMonth(), day3.getDate(), 11, 0, 0).toISOString(), endTime: new Date(day3.getFullYear(), day3.getMonth(), day3.getDate(), 15, 0, 0).toISOString(), date: day3.toISOString().split('T')[0] },
      { id: 'e10', categoryId: 'cat4', startTime: new Date(day3.getFullYear(), day3.getMonth(), day3.getDate(), 16, 0, 0).toISOString(), endTime: new Date(day3.getFullYear(), day3.getMonth(), day3.getDate(), 17, 0, 0).toISOString(), date: day3.toISOString().split('T')[0] },
      
      // Vor 4 Tagen
      { id: 'e11', categoryId: 'cat3', startTime: new Date(day4.getFullYear(), day4.getMonth(), day4.getDate(), 9, 0, 0).toISOString(), endTime: new Date(day4.getFullYear(), day4.getMonth(), day4.getDate(), 12, 30, 0).toISOString(), date: day4.toISOString().split('T')[0] },
      
      // Vor 5 Tagen
      { id: 'e12', categoryId: 'cat1', startTime: new Date(day5.getFullYear(), day5.getMonth(), day5.getDate(), 8, 0, 0).toISOString(), endTime: new Date(day5.getFullYear(), day5.getMonth(), day5.getDate(), 11, 0, 0).toISOString(), date: day5.toISOString().split('T')[0] },
      { id: 'e13', categoryId: 'cat2', startTime: new Date(day5.getFullYear(), day5.getMonth(), day5.getDate(), 13, 0, 0).toISOString(), endTime: new Date(day5.getFullYear(), day5.getMonth(), day5.getDate(), 14, 0, 0).toISOString(), date: day5.toISOString().split('T')[0] },
      
      // Vor 6 Tagen
      { id: 'e14', categoryId: 'cat5', startTime: new Date(day6.getFullYear(), day6.getMonth(), day6.getDate(), 10, 0, 0).toISOString(), endTime: new Date(day6.getFullYear(), day6.getMonth(), day6.getDate(), 12, 0, 0).toISOString(), date: day6.toISOString().split('T')[0] }
    ];
    
    // WICHTIG: Korrekter Storage Key ist 'worktracker-time-entries' (nicht 'worktracker-entries')
    localStorage.setItem('worktracker-categories', JSON.stringify(categories));
    localStorage.setItem('worktracker-time-entries', JSON.stringify(entries));
    
    console.log('✅ Testdaten gespeichert:', categories.length, 'Kategorien,', entries.length, 'Einträge');
    
    // Event feuern
    window.dispatchEvent(new Event('storage'));
  });
  
  // Seite neu laden um Daten zu übernehmen
  console.log('Lade Seite neu...');
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  
  // Navigiere zur Analytics-Seite (Port 5186!)
  console.log('Navigiere zur Analytics-Seite (Port 5186)...');
  await page.goto('http://localhost:5186/analytics');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);
  
  const screenshotsDir = '/home/agency/.openclaw/workspace-maya/projects/worktracker/docs/screenshots';
  
  // Prüfe Inhalt
  const hasContent = await page.evaluate(() => {
    return document.body.innerText.length > 100;
  });
  const bodyLength = await page.evaluate(() => document.body.innerText.length);
  console.log('Seite hat Inhalt:', hasContent, '(Length:', bodyLength, ')');
  
  // Warte bis Charts gerendert sind (wegen React-Rate-Limiting)
  await page.waitForTimeout(5000);
  
  // Screenshot 1: Gesamt-Übersicht (Pie Chart + Statistiken)
  await page.screenshot({ path: screenshotsDir + '/analytics-01.png', fullPage: true });
  console.log('✅ Screenshot 1: Gesamt-Übersicht gespeichert');
  
  // Scrolle herunter für Screenshot 2
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
  await page.waitForTimeout(500);
  
  // Screenshot 2: Wochentags-Statistik (Bar Chart)
  await page.screenshot({ path: screenshotsDir + '/analytics-02.png', fullPage: true });
  console.log('✅ Screenshot 2: Wochentags-Statistik gespeichert');
  
  // Scrolle weiter für Screenshot 3
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(500);
  
  // Screenshot 3: Trend-Ansicht (Line Chart)
  await page.screenshot({ path: screenshotsDir + '/analytics-03.png', fullPage: true });
  console.log('✅ Screenshot 3: Trend-Ansicht gespeichert');
  
  await browser.close();
  console.log('✅ Alle Screenshots erstellt!');
  
  // Dateigröße prüfen
  const files = [screenshotsDir + '/analytics-01.png', screenshotsDir + '/analytics-02.png', screenshotsDir + '/analytics-03.png'];
  files.forEach(f => {
    const stats = fs.statSync(f);
    const ok = stats.size > 50000 ? '✅' : '❌';
    console.log(`${ok} ${f}: ${stats.size} bytes`);
  });
  
  return true;
}

captureAnalyticsScreenshots().catch(err => {
  console.error('❌ Fehler:', err);
  process.exit(1);
});
