import { chromium, Page } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

const SCREENSHOTS_DIR = path.join(process.cwd(), 'test-results', 'emoji-picker');

async function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

async function takeScreenshot(page: Page, name: string) {
  const screenshotPath = path.join(SCREENSHOTS_DIR, `${name}.png`);
  await page.screenshot({ path: screenshotPath, fullPage: false });
  console.log(`Screenshot saved: ${screenshotPath}`);
  return screenshotPath;
}

async function testEmojiPicker() {
  await ensureDir(SCREENSHOTS_DIR);
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1024, height: 768 },
    deviceScaleFactor: 2,
  });
  
  const page = await context.newPage();

  try {
    // Navigate to the built app
    console.log('Navigating to built app...');
    await page.goto('http://localhost:8080/', { waitUntil: 'networkidle' });
    
    // Wait for React to hydrate - check for specific element
    console.log('Waiting for app to load...');
    await page.waitForFunction(() => {
      const root = document.getElementById('root');
      return root && root.children.length > 0;
    }, { timeout: 30000 });
    
    await page.waitForTimeout(2000);
    
    // Take screenshot of main page
    await takeScreenshot(page, '01-main-page');
    
    // Check if page has content
    const bodyContent = await page.locator('body').textContent();
    console.log('Body content preview:', bodyContent?.substring(0, 300));
    
    // Try to find buttons
    const buttons = await page.locator('button').all();
    console.log(`Found ${buttons.length} buttons`);
    
    for (let i = 0; i < Math.min(buttons.length, 15); i++) {
      const text = await buttons[i].textContent().catch(() => '');
      const visible = await buttons[i].isVisible().catch(() => false);
      console.log(`Button ${i}: "${text}" (visible: ${visible})`);
    }
    
    // Click "+ Neue Kategorie" button
    console.log('Looking for Neue Kategorie button...');
    const newCategoryBtn = await page.locator('button:has-text("Neue")').first();
    const isVisible = await newCategoryBtn.isVisible().catch(() => false);
    console.log('Button visible:', isVisible);
    
    if (isVisible) {
      await newCategoryBtn.click();
      await page.waitForTimeout(1500);
      await takeScreenshot(page, '02-category-dialog');
      
      // Click the emoji picker button (question mark)
      const emojiBtn = await page.locator('button[title="Emoji wählen"]').first();
      if (await emojiBtn.isVisible().catch(() => false)) {
        console.log('Emoji picker button found!');
        await emojiBtn.click();
        await page.waitForTimeout(2000);
        await takeScreenshot(page, '03-emoji-picker-dialog');
        
        // Search for an emoji
        const searchInput = await page.locator('input[placeholder*="Emojis durchsuchen"]').first();
        if (await searchInput.isVisible().catch(() => false)) {
          await searchInput.fill('work');
          await page.waitForTimeout(1500);
          await takeScreenshot(page, '04-emoji-picker-search');
          
          // Click on an emoji
          const emojiButton = await page.locator('.epr-emoji-category-content button').first();
          if (await emojiButton.isVisible().catch(() => false)) {
            await emojiButton.click();
            await page.waitForTimeout(1000);
            await takeScreenshot(page, '05-emoji-selected');
          }
        }
      } else {
        console.log('Emoji picker button not found!');
        await takeScreenshot(page, '02b-no-emoji-button');
      }
    } else {
      console.log('Neue Kategorie button not found!');
    }
    
    console.log('\n✅ Test completed!');
    console.log(`📁 Screenshots saved to: ${SCREENSHOTS_DIR}`);
    
  } catch (error) {
    console.error('Test failed:', error);
    await takeScreenshot(page, 'error-state');
    throw error;
  } finally {
    await browser.close();
  }
}

testEmojiPicker().catch(console.error);
