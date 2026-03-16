const { chromium } = require('playwright');

async function createScreenshots() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  
  const page = await context.newPage();
  
  // Inject the data script BEFORE navigation using addInitScript
  await context.addInitScript({ path: './inject-data.js' });
  
  // Navigate to analytics page
  await page.goto('http://localhost:5173/analytics');
  await page.waitForTimeout(3000);
  
  // Check if injection worked
  const injected = await page.evaluate(() => {
    return window.localStorageInjected;
  });
  console.log('LocalStorage injection successful:', injected);
  
  // Take first screenshot - full page
  await page.screenshot({ path: 'docs/screenshots/analytics-01.png', fullPage: true });
  console.log('Screenshot 1 taken: analytics-01.png');
  
  // Take second screenshot - just the main content
  const mainElement = await page.$('main');
  if (mainElement) {
    await mainElement.screenshot({ path: 'docs/screenshots/analytics-02.png' });
    console.log('Screenshot 2 taken: analytics-02.png');
  }
  
  // Wait a bit more for any animations to complete
  await page.waitForTimeout(1000);
  
  // Take third screenshot - maybe a specific section
  await page.screenshot({ path: 'docs/screenshots/analytics-03.png' });
  console.log('Screenshot 3 taken: analytics-03.png');
  
  await browser.close();
  console.log('All screenshots created successfully!');
}

createScreenshots().catch(console.error);
