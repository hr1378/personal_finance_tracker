import { test, expect } from '@playwright/test'

test.describe('Budget Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('http://localhost:3000')
    await page.click('text=Login')
    await page.fill('input[name="email"]', 'test@example.com')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    await page.waitForURL(/dashboard|overview/)
  })

  test('should add a new budget', async ({ page }) => {
    // Navigate to budgets page
    await page.click('text=Budgets')

    // Click add budget button
    await page.click('text=Add Budget')

    // Fill budget form
    await page.fill('input[name="category"]', 'Food')
    await page.fill('input[name="amount"]', '500')
    await page.fill('input[name="month"]', '1')
    await page.fill('input[name="year"]', '2024')

    // Submit form
    await page.click('button[type="submit"]')

    // Should show new budget in list
    await expect(page.locator('text=Food')).toBeVisible()
    await expect(page.locator('text=500')).toBeVisible()
  })

  test('should update an existing budget', async ({ page }) => {
    // Navigate to budgets page
    await page.click('text=Budgets')

    // Find first budget edit button
    const firstEditButton = page.locator('.budget-item').first().locator('button[aria-label="Edit"]')
    firstEditButton.click()

    // Update amount
    await page.fill('input[name="amount"]', '600')

    // Submit form
    await page.click('button[type="submit"]')

    // Should show updated amount
    await expect(page.locator('text=600')).toBeVisible()
  })

  test('should delete a budget', async ({ page }) => {
    // Navigate to budgets page
    await page.click('text=Budgets')

    // Find first budget delete button
    const firstDeleteButton = page.locator('.budget-item').first().locator('button[aria-label="Delete"]')
    firstDeleteButton.click()

    // Confirm deletion
    await page.click('text=Confirm')

    // Budget should be removed
    await expect(firstDeleteButton).not.toBeVisible()
  })

  test('should display budget utilization', async ({ page }) => {
    // Navigate to budgets page
    await page.click('text=Budgets')

    // Check utilization section
    await expect(page.locator('text=Budget Utilization')).toBeVisible()
    await expect(page.locator('text=Amount Spent')).toBeVisible()
    await expect(page.locator('text=Remaining')).toBeVisible()
  })
})
