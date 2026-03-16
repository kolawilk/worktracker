import { test, expect } from '@playwright/test'

test.describe('Day Overview Infinite Loop Fix', () => {
  test.beforeEach(async ({ page }) => {
    // Reset localStorage before each test
    await page.evaluate(() => {
      localStorage.clear()
    })
    await page.goto('/')
  })

  test('should not open day overview on refresh if already shown', async ({ page }) => {
    // Start a workday
    await page.getByRole('button', { name: 'Start' }).click()
    await page.waitForTimeout(100)

    // End the workday
    await page.getByRole('button', { name: 'Feierabend' }).click()
    
    // Wait for dialog to appear
    await page.waitForSelector('text=Feierabend!')
    
    // Close the dialog
    await page.getByRole('button', { name: 'Alles klar, danke!' }).click()
    
    // Verify dialog is closed
    await expect(page.getByText('Feierabend!')).not.toBeVisible()
    
    // Refresh the page
    await page.reload()
    
    // Wait for page to load
    await page.waitForTimeout(500)
    
    // Verify dialog does NOT reopen automatically (this was the bug)
    await expect(page.getByText('Feierabend!')).not.toBeVisible()
  })

  test('should open day overview once after ending day', async ({ page }) => {
    // Start a workday
    await page.getByRole('button', { name: 'Start' }).click()
    await page.waitForTimeout(100)

    // End the workday
    await page.getByRole('button', { name: 'Feierabend' }).click()
    
    // Wait for dialog to appear
    await expect(page.getByText('Feierabend!')).toBeVisible()
    
    // Close the dialog
    await page.getByRole('button', { name: 'Alles klar, danke!' }).click()
    
    // Verify dialog is closed
    await expect(page.getByText('Feierabend!')).not.toBeVisible()
  })
})
