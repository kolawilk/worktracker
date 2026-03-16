import { chromium } from 'playwright';

async function injectTestData() {
  console.log('Starting browser...');
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  
  console.log('Navigating to http://localhost:5187...');
  await page.goto('http://localhost:5187/');
  
  // Wait for page to load
  await page.waitForSelector('body', { timeout: 5000 });
  
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
    console.log('Categories:', localStorage.getItem('worktracker-categories'));
    console.log('Entries:', localStorage.getItem('worktracker-time-entries'));
  `;
  
  await page.evaluate(testDataScript);
  
  console.log('Reloading page...');
  await page.reload({ waitUntil: 'networkidle' });
  
  await page.waitForTimeout(2000);
  
  console.log('Test data injection completed!');
  await browser.close();
}

injectTestData().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
