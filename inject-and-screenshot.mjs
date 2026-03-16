import { chromium } from 'playwright';
import { mkdirSync, existsSync } from 'fs';

const outputDir = '/home/agency/.openclaw/workspace-maya/projects/worktracker/docs/screenshots';

// Ensure output directory exists
if (!existsSync(outputDir)) {
  mkdirSync(outputDir, { recursive: true });
}

async function injectDataAndTakeScreenshots() {
  console.log('Starting browser...');
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  
  console.log('Navigating to http://localhost:5187...');
  await page.goto('http://localhost:5187/');
  
  // Wait for page to load
  await page.waitForSelector('body', { timeout: 5000 });
  console.log('Page loaded');
  
  // Inject test data
  console.log('Injecting test data via console...');
  
  const testDataScript = `
    const categories = [
      { id: '1', name: 'Arbeit 💼', emoji: '💼', color: '#3B82F6', createdAt: new Date().toISOString() },
      { id: '2', name: 'Privat 🏠', emoji: '🏠', color: '#10B981', createdAt: new Date().toISOString() },
      { id: '3', name: 'Meeting 📊', emoji: '📊', color: '#8B5CF6', createdAt: new Date().toISOString() }
    ];
    localStorage.setItem('worktracker-categories', JSON.stringify(categories));
    
    const entries = [];
    const today = new Date();
    for (let i = 0; i < 5; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      entries.push({
        id: 'e' + i,
        categoryId: categories[i % 3].id,
        startTime: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 9, 0).toISOString(),
        endTime: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 17, 0).toISOString(),
        date: date.toISOString().split('T')[0]
      });
    }
    localStorage.setItem('worktracker-time-entries', JSON.stringify(entries));
    console.log('Test data injected successfully!');
  `;
  
  await page.evaluate(testDataScript);
  
  // Verify data was stored
  const categories = await page.evaluate(() => localStorage.getItem('worktracker-categories'));
  const entries = await page.evaluate(() => localStorage.getItem('worktracker-time-entries'));
  console.log('Categories stored:', categories?.substring(0, 100) + '...');
  console.log('Entries stored:', entries?.substring(0, 100) + '...');
  
  console.log('Reloading page...');
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  
  // Verify data persists after reload
  const categoriesAfterReload = await page.evaluate(() => localStorage.getItem('worktracker-categories'));
  console.log('Categories after reload:', categoriesAfterReload?.substring(0, 100) + '...');
  
  console.log('Navigating to analytics page...');
  await page.goto('http://localhost:5187/analytics');
  await page.waitForTimeout(3000); // Wait for charts to render
  
  // Take screenshot of total view (analytics-01.png)
  console.log('Taking screenshot 1: Gesamtansicht (analytics-01.png)...');
  await page.screenshot({ 
    path: `${outputDir}/analytics-01.png`,
    fullPage: false
  });
  
  // Check if charts have data by looking at recharts elements
  const chartElements = await page.$$('.recharts-wrapper');
  console.log(`Found ${chartElements.length} chart elements`);
  
  // Take screenshot of weekday view (analytics-02.png)
  console.log('Taking screenshot 2: Wochentags (analytics-02.png)...');
  await page.screenshot({ 
    path: `${outputDir}/analytics-02.png`,
    fullPage: false
  });
  
  // Take screenshot of trend view (analytics-03.png)
  console.log('Taking screenshot 3: Trend (analytics-03.png)...');
  await page.screenshot({ 
    path: `${outputDir}/analytics-03.png`,
    fullPage: false
  });
  
  // Extract data values from the page
  const dataSummary = await page.evaluate(() => {
    const totalTime = document.querySelector('.text-primary.font-bold.text-2xl')?.textContent || 'Not found';
    const categoriesCount = document.querySelector('.text-2xl.font-bold')?.textContent || 'Not found';
    return {
      totalTime,
      categoriesCount
    };
  });
  
  console.log('Data summary:', JSON.stringify(dataSummary, null, 2));
  
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

injectDataAndTakeScreenshots().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
