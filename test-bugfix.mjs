import { chromium } from '@playwright/test';

async function runTest() {
  console.log('🚀 Starte Worktracker Bugfix Test...');
  
  // Starte den Dev Server im Hintergrund
  const { exec } = await import('child_process');
  const { promisify } = await import('util');
  const execAsync = promisify(exec);
  
  console.log('📦 Starte Dev Server...');
  const { spawn } = await import('child_process');
  const devServer = spawn('npm', ['run', 'dev'], {
    cwd: '/home/agency/.openclaw/workspace-maya/projects/worktracker',
    stdio: 'inherit',
    shell: true
  });
  
  // Warte bis Server läuft (Port 5196)
  console.log('⏱️  Warte auf Server (Port 5196)...');
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  let port = 5200;
  console.log(`🌐 Server läuft auf http://localhost:${port}`);
  
  // Öffne Browser mit Playwright
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    console.log('🔍 Gehe zu http://localhost:' + port);
    await page.goto(`http://localhost:${port}`);
    await page.waitForTimeout(1000);
    
    // Screenshot 1: Startseite
    await page.screenshot({ path: 'test-results/01-startseite.png' });
    console.log('📸 Screenshot 1: Startseite gespeichert');
    
    // Klicke "Arbeitstag starten"
    console.log('▶️  Klicke "Arbeitstag starten"');
    await page.click('button:has-text("Start")');
    await page.waitForTimeout(500);
    
    // Screenshot 2: Nach Start
    await page.screenshot({ path: 'test-results/02-nach-start.png' });
    console.log('📸 Screenshot 2: Nach Start gespeichert');
    
    // Klicke auf eine Kategorie (z.B. "Informatik")
    console.log('📂 Klicke auf Kategorie "Informatik"');
    await page.click('button:has-text("Informatik")');
    await page.waitForTimeout(1000);
    
    // Screenshot 3: Nach Kategorie
    await page.screenshot({ path: 'test-results/03-nach-kategorie.png' });
    console.log('📸 Screenshot 3: Nach Kategorie gespeichert');
    
    // Klicke "Feierabend"
    console.log('🚪 Klicke "Feierabend"');
    await page.click('button:has-text("Feierabend")');
    await page.waitForTimeout(1000);
    
    // Warte auf Dialog
    console.log('⏳ Warte auf Tagesübersicht-Dialog...');
    await page.waitForSelector('text=Feierabend!', { timeout: 5000 });
    
    // Screenshot 4: Dialog offen
    await page.screenshot({ path: 'test-results/04-dialog-offen.png' });
    console.log('📸 Screenshot 4: Dialog offen gespeichert');
    
    // Schließe Dialog
    console.log('❌ Schließe Dialog');
    await page.click('button:has-text("Alles klar, danke!")');
    await page.waitForTimeout(500);
    
    // Screenshot 5: Dialog geschlossen
    await page.screenshot({ path: 'test-results/05-dialog-geschlossen.png' });
    console.log('📸 Screenshot 5: Dialog geschlossen gespeichert');
    
    // Prüfe: Dialog ist geschlossen
    try {
      await page.waitForSelector('text=Feierabend!', { timeout: 1000 });
      console.log('❌ FEHLGESCHLAGEN: Dialog ist noch sichtbar nach Schließen!');
      await browser.close();
      process.exit(1);
    } catch (e) {
      console.log('✅ Dialog ist geschlossen');
    }
    
    // Lade Seite neu
    console.log('🔄 Lade Seite neu...');
    await page.reload();
    await page.waitForTimeout(1500);
    
    // Screenshot 6: Nach Reload
    await page.screenshot({ path: 'test-results/06-nach-reload.png' });
    console.log('📸 Screenshot 6: Nach Reload gespeichert');
    
    // PRÜFE: Dialog ist NICHT sichtbar nach Reload!
    try {
      await page.waitForSelector('text=Feierabend!', { timeout: 2000 });
      console.log('❌ FEHLGESCHLAGEN: Dialog öffnet sich wieder nach Reload! (Bug vorhanden)');
      await browser.close();
      process.exit(1);
    } catch (e) {
      console.log('✅ TEST BESTANDEN: Dialog öffnet sich NICHT nach Reload! (Bug behoben)');
    }
    
    console.log('🎉 TEST ERFOLGREICH BEENDET!');
    console.log('📊 Ergebnis:');
    console.log('   - Dialog öffnet sich beim Feierabend ✓');
    console.log('   - Dialog schließt sich beim Klick auf "Alles klar" ✓');
    console.log('   - Dialog öffnet sich NICHT nach Reload ✓');
    
    await browser.close();
    process.exit(0);
    
  } catch (error) {
    console.error('❌ FEHLER:', error.message);
    await page.screenshot({ path: 'test-results/error.png' });
    console.log('📸 Error-Screenshot gespeichert');
    await browser.close();
    process.exit(1);
  }
}

runTest();
