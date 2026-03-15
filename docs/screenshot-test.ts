import { chromium } from 'playwright'
import { mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const SCREENSHOTS_DIR = join(__dirname, 'screenshots')

// Ensure screenshots directory exists
try {
  mkdirSync(SCREENSHOTS_DIR, { recursive: true })
} catch (e) {
  // Directory might already exist
}

async function takeScreenshot(page: any, filename: string) {
  await page.screenshot({
    path: join(SCREENSHOTS_DIR, filename),
    fullPage: true
  } as any)
  console.log(`Screenshot saved: ${filename}`)
}

async function run() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  })
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  })
  
  const page = await context.newPage()
  
  // Navigate to the app
  await page.goto('http://localhost:5177/')
  await page.waitForLoadState('networkidle')
  
  // Wait for components to render
  await page.waitForTimeout(1000)
  
  // Screenshot 1: Initial state (no workday)
  await takeScreenshot(page, '01-initial-state.png')
  console.log('Screenshot 1: Initial state captured')
  
  // Click "Arbeitstag starten"
  const startButton = page.locator('button:has-text("Arbeitstag starten")')
  await startButton.click()
  await page.waitForTimeout(500)
  
  // Screenshot 2: After start
  await takeScreenshot(page, '02-after-start.png')
  console.log('Screenshot 2: After start captured')
  
  // Click "Pause"
  const pauseButton = page.locator('button:has-text("Pause")')
  await pauseButton.click()
  await page.waitForTimeout(500)
  
  // Screenshot 3: After pause
  await takeScreenshot(page, '03-after-pause.png')
  console.log('Screenshot 3: After pause captured')
  
  // Click "Weiter" (Resume)
  const resumeButton = page.locator('button:has-text("Weiter")')
  await resumeButton.click()
  await page.waitForTimeout(500)
  
  // Screenshot 4: After resume
  await takeScreenshot(page, '04-after-resume.png')
  console.log('Screenshot 4: After resume captured')
  
  // Click "Arbeitstag beenden"
  const endButton = page.locator('button:has-text("Arbeitstag beenden")')
  await endButton.click()
  await page.waitForTimeout(500)
  
  // Screenshot 5: After end
  await takeScreenshot(page, '05-after-end.png')
  console.log('Screenshot 5: After end captured')
  
  await browser.close()
  console.log('All screenshots completed!')
}

run().catch(console.error)
