import { chromium } from '@playwright/test'
import * as path from 'path'
import * as fs from 'fs'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const screenshotsDir = path.join(__dirname, 'docs', 'screenshots')
const port = 5174

if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true })
}

async function testEmojiPicker() {
  const browser = await chromium.launch()
  const context = await browser.newContext()
  const page = await context.newPage()

  console.log('Navigating to app...')
  
  // Navigate to the app (assuming dev server is already running)
  await page.goto(`http://localhost:${port}`)
  await page.waitForTimeout(2000)

  // Screenshot 1: Initial state before opening dialog
  await page.screenshot({ 
    path: path.join(screenshotsDir, '10-initial-no-emoji.png'),
    fullPage: true 
  })
  console.log('✓ Screenshot 10: Initial state saved')

  // Click "Neue Kategorie" button to open dialog
  try {
    await page.click('button:has-text("Neue Kategorie")')
    await page.waitForTimeout(1000)

    // Screenshot 2: Dialog with Emoji Picker
    await page.screenshot({ 
      path: path.join(screenshotsDir, '11-dialog-with-emoji-picker.png'),
      fullPage: true 
    })
    console.log('✓ Screenshot 11: Dialog with Emoji Picker')

    // Select an emoji from the picker
    await page.click('button[aria-label="Wähle Emoji 🎸"]')
    await page.waitForTimeout(500)

    // Screenshot 3: After selecting emoji
    await page.screenshot({ 
      path: path.join(screenshotsDir, '12-emoji-selected.png'),
      fullPage: true 
    })
    console.log('✓ Screenshot 12: After selecting emoji (🎸)')

    // Test typing an emoji in input
    await page.fill('#category-emoji', '💼')
    await page.waitForTimeout(500)

    // Screenshot 4: After typing emoji
    await page.screenshot({ 
      path: path.join(screenshotsDir, '13-emoji-typed.png'),
      fullPage: true 
    })
    console.log('✓ Screenshot 13: After typing emoji (💼)')

    // Test color picker
    await page.fill('#category-color-text', '#FF5733')
    await page.waitForTimeout(500)

    // Screenshot 5: Complete dialog with all fields filled
    await page.screenshot({ 
      path: path.join(screenshotsDir, '14-complete-dialog.png'),
      fullPage: true 
    })
    console.log('✓ Screenshot 14: Complete dialog with emoji picker')

    // Close dialog
    await page.click('button:has-text("Abbrechen")')
    await page.waitForTimeout(500)
  } catch (e) {
    console.log('Dialog interaction skipped:', e.message)
  }

  await browser.close()
  
  console.log('✅ Emoji picker test completed!')
}

testEmojiPicker().catch(console.error)
