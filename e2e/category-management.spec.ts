import { test, expect, type Page } from '@playwright/test'

test.describe('Category Management', () => {
  let page: Page

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
  })

  test.afterAll(async () => {
    await page.close()
  })

  test('should display empty state initially', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('Willkommen!')).toBeVisible()
  })

  test('should have category grid component', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('[role="list"][aria-label="Kategorien"]')).toBeVisible()
  })

  test('should show screenshot of category grid', async ({ browser }) => {
    const page = await browser.newPage()
    await page.goto('/')
    await expect(page.getByText('Willkommen!')).toBeVisible()
    await page.screenshot({ path: 'docs/screenshots/category-grid-initial.png' })
    await page.close()
  })
})
