import { chromium } from 'playwright';

async function checkConsoleErrors() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--disable-gpu', '--no-sandbox', '--disable-dev-shm-usage']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  // Console Errors abfangen
  page.on('console', msg => {
    if (msg.type() === 'error' || msg.type() === 'warning') {
      console.log(`[${msg.type()}] ${msg.text()}`);
    } else {
      console.log(`[LOG] ${msg.text()}`);
    }
  });
  
  page.on('pageerror', err => {
    console.log(`[PAGE ERROR] ${err.message}`);
    console.log(err.stack);
  });
  
  // Navigiere zur Analytics-Seite
  console.log('Navigiere zur Analytics-Seite...');
  await page.goto('http://localhost:5173/analytics');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);
  
  // Prüfe document body
  const bodyContent = await page.evaluate(() => {
    return {
      hasRoot: !!document.getElementById('root'),
      rootInnerHtml: document.getElementById('root')?.innerHTML || 'EMPTY',
      bodyText: document.body.innerText.substring(0, 500),
      bodyLength: document.body.innerText.length
    };
  });
  
  console.log('\n=== BODY INHALT ===');
  console.log('Has #root:', bodyContent.hasRoot);
  console.log('Root innerHTML length:', bodyContent.rootInnerHtml.length);
  console.log('Body text length:', bodyContent.bodyLength);
  console.log('Body text (erste 500 chars):');
  console.log(bodyContent.bodyText.substring(0, 500));
  
  await browser.close();
}

checkConsoleErrors().catch(console.error);
