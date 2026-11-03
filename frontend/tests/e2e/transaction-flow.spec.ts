import { test, expect } from '@playwright/test'

test.describe('Transaction Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('http://localhost:3000')
    await page.click('text=Login')
    await page.fill('input[name="email"]', 'test@example.com')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    await page.waitForURL(/dashboard|overview/)
  })

  test('should add a new transaction', async ({ page }) => {
    // Navigate to transactions page
    await page.click('text=Transactions')

    // Click add transaction button
    await page.click('text=Add Transaction')

    // Fill transaction form
    await page.selectOption('select[name="type"]', 'EXPENSE')
    await page.fill('input[name="amount"]', '100.50')
    await page.fill('input[name="category"]', 'Groceries')
    await page.fill('input[name="date"]', '2024-01-15')
    await page.fill('input[name="description"]', 'Weekly shopping')

    // Submit form
    await page.click('button[type="submit"]')

    // Should show new transaction in list
    await expect(page.locator('text=Groceries')).toBeVisible()
    await expect(page.locator('text=100.50')).toBeVisible()
  })

  test('should filter transactions by type', async ({ page }) => {
    // Navigate to transactions page
    await page.click('text=Transactions')

    // Filter by income
    await page.selectOption('select[name="type"]', 'INCOME')

    // Should only show income transactions
    const transactions = await page.locator('.transaction-item').count()
    expect(transactions).toBeGreaterThan(0)
  })

  test('should delete a transaction', async ({ page }) => {
    // Navigate to transactions page
    await page.click('text=Transactions')

    // Find first transaction delete button
    const firstDeleteButton = page.locator('.transaction-item').first().locator('button[aria-label="Delete"]')

    // Click delete
    firstDeleteButton.click()

    // Confirm deletion
    await page.click('text=Confirm')

    // Transaction should be removed
    await expect(firstDeleteButton).not.toBeVisible()
  })

  test('should display transaction summary', async ({ page }) => {
    // Navigate to transactions page
    await page.click('text=Transactions')

    // Check summary section
    await expect(page.locator('text=Total Income')).toBeVisible()
    await expect(page.locator('text=Total Expenses')).toBeVisible()
    await expect(page.locator('text=Net Cash Flow')).toBeVisible()
  })
})
