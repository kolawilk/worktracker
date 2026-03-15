import { chromium } from '@playwright/test'

const BASE_URL = 'http://localhost:5173'

async function takeScreenshots() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  })

  const context = await browser.newContext({
    viewport: { width: 1024, height: 768 }
  })

  const page = await context.newPage()

  // Navigate to the app
  await page.goto(BASE_URL)
  await page.waitForLoadState('networkidle')

  // Wait for the app to render
  await page.waitForSelector('.max-w-4xl', { timeout: 5000 })

  console.log('✅ App loaded successfully')

  // Screenshot 1: Start screen (no workday started)
  await page.screenshot({
    path: 'docs/screenshots/01-no-workday-started.png',
    fullPage: false
  })
  console.log('✅ Screenshot 1: No workday started')

  // Click "Arbeitstag starten" button
  await page.click('button:has-text("Arbeitstag starten")')
  await page.waitForTimeout(500)

  // Screenshot 2: Workday running
  await page.screenshot({
    path: 'docs/screenshots/02-workday-running.png',
    fullPage: false
  })
  console.log('✅ Screenshot 2: Workday running')

  // Click "Pause" button
  await page.click('button:has-text("Pause")')
  await page.waitForTimeout(500)

  // Screenshot 3: Workday paused
  await page.screenshot({
    path: 'docs/screenshots/03-workday-paused.png',
    fullPage: false
  })
  console.log('✅ Screenshot 3: Workday paused')

  // Click "Weiter" button
  await page.click('button:has-text("Weiter")')
  await page.waitForTimeout(500)

  // Screenshot 4: Workday resumed
  await page.screenshot({
    path: 'docs/screenshots/04-workday-resumed.png',
    fullPage: false
  })
  console.log('✅ Screenshot 4: Workday resumed')

  // Click "Pause" again
  await page.click('button:has-text("Pause")')
  await page.waitForTimeout(500)

  // Click "Arbeitstag beenden" button
  await page.click('button:has-text("Arbeitstag beenden")')
  await page.waitForTimeout(500)

  // Screenshot 5: Workday ended
  await page.screenshot({
    path: 'docs/screenshots/05-workday-ended.png',
    fullPage: false
  })
  console.log('✅ Screenshot 5: Workday ended')

  await browser.close()
  console.log('🎉 All screenshots taken successfully!')
}

takeScreenshots().catch(console.error)
