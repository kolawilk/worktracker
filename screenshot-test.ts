import { test, expect } from '@playwright/test'

test('WorkDayTimer screenshot test', async ({ page }, testInfo) => {
  await page.goto('http://localhost:5178')
  
  // Wait for the app to load
  await page.waitForSelector('text=Arbeitszeit')
  
  // Take screenshot of the workday timer
  await page.locator('text=Arbeitszeit').first().locator('xpath=../..').screenshot({
    path: 'docs/screenshots/workday-timer-default.png'
  })
  
  // Test start work day
  const startButton = page.locator('button:has-text("Arbeitstag starten")')
  await startButton.click()
  
  await page.waitForTimeout(1000)
  
  // Take screenshot after starting
  await page.locator('text=Arbeitszeit').first().locator('xpath=../..').screenshot({
    path: 'docs/screenshots/workday-timer-running.png'
  })
  
  // Test pause
  const pauseButton = page.locator('button:has-text("Pause")')
  await pauseButton.click()
  
  await page.waitForTimeout(1000)
  
  // Take screenshot when paused
  await page.locator('text=Arbeitszeit').first().locator('xpath=../..').screenshot({
    path: 'docs/screenshots/workday-timer-paused.png'
  })
  
  // Test resume
  const resumeButton = page.locator('button:has-text("Weiter")')
  await resumeButton.click()
  
  await page.waitForTimeout(1000)
  
  // Take screenshot after resuming
  await page.locator('text=Arbeitszeit').first().locator('xpath=../..').screenshot({
    path: 'docs/screenshots/workday-timer-resumed.png'
  })
  
  // Test end work day
  const endButton = page.locator('button:has-text("Arbeitstag beenden")')
  await endButton.click()
  
  await page.waitForTimeout(1000)
  
  // Take screenshot when ended
  await page.locator('text=Arbeitszeit').first().locator('xpath=../..').screenshot({
    path: 'docs/screenshots/workday-timer-ended.png'
  })
  
  console.log('Screenshots saved!')
})
