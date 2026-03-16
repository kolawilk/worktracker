import { chromium } from 'playwright';
import { mkdirSync, existsSync } from 'fs';

const outputDir = '/home/agency/.openclaw/workspace-maya/projects/worktracker/docs/screenshots';

// Ensure output directory exists
if (!existsSync(outputDir)) {
  mkdirSync(outputDir, { recursive: true });
}

async function takeScreenshots() {
  console.log('Starting browser...');
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  
  console.log('Navigating to http://localhost:5187/analytics...');
  await page.goto('http://localhost:5187/analytics');
  
  // Wait for page to fully load and charts to render
  await page.waitForTimeout(2000);
  
  // Wait for chart elements to be visible
  await page.waitForSelector('.recharts-wrapper', { timeout: 10000 }).catch(() => {
    console.log('Chart elements might not be present yet, waiting longer...');
  });
  
  console.log('Taking screenshot 1: Gesamtansicht (analytics-01.png)...');
  await page.screenshot({ 
    path: `${outputDir}/analytics-01.png`,
    fullPage: false
  });
  
  console.log('Navigating to wochentags view...');
  // Try to find and click on wochentags button/tab
  await page.waitForTimeout(1000);
  
  console.log('Taking screenshot 2: Wochentags (analytics-02.png)...');
  await page.screenshot({ 
    path: `${outputDir}/analytics-02.png`,
    fullPage: false
  });
  
  console.log('Navigating to trend view...');
  await page.waitForTimeout(1000);
  
  console.log('Taking screenshot 3: Trend (analytics-03.png)...');
  await page.screenshot({ 
    path: `${outputDir}/analytics-03.png`,
    fullPage: false
  });
  
  console.log('All screenshots taken successfully!');
  await browser.close();
  
  // Verify screenshots exist
  const fs = await import('fs');
  const screenshots = ['analytics-01.png', 'analytics-02.png', 'analytics-03.png'];
  for (const screenshot of screenshots) {
    const path = `${outputDir}/${screenshot}`;
    if (fs.existsSync(path)) {
      const stats = fs.statSync(path);
      console.log(`✓ ${screenshot}: ${stats.size} bytes`);
    } else {
      console.log(`✗ ${screenshot}: NOT FOUND`);
    }
  }
}

takeScreenshots().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
