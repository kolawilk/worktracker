import { chromium } from '@playwright/test'
import * as path from 'path'
import * as fs from 'fs'

const screenshotsDir = path.join(__dirname, 'docs', 'screenshots')

if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true })
}

async function takeScreenshots() {
  const browser = await chromium.launch()
  const context = await browser.newContext()
  const page = await context.newPage()

  // Start dev server first
  console.log('Starting dev server...')
  
  // Navigate to the app
  await page.goto('http://localhost:5173')
  await page.waitForSelector('[data-testid="category-grid"]', { timeout: 5000 }).catch(() => {
    // If no categories, just take screenshot of initial state
  })

  // Screenshot 1: Initial state
  await page.screenshot({ 
    path: path.join(screenshotsDir, '01-initial-state.png'),
    fullPage: true 
  })
  console.log('✓ Screenshot 1: Initial state saved')

  // Take a screenshot of the app structure
  await page.evaluate(() => {
    // Try to find the category grid
    const grid = document.querySelector('[role="list"][aria-label="Kategorien"]')
    if (grid) {
      grid.setAttribute('data-testid', 'category-grid')
    }
  })

  await page.screenshot({ 
    path: path.join(screenshotsDir, '02-app-structure.png'),
    fullPage: true 
  })
  console.log('✓ Screenshot 2: App structure saved')

  await browser.close()
  console.log('✅ All screenshots taken successfully!')
}

takeScreenshots().catch(console.error)
