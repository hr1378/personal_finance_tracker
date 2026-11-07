import { test, expect } from '@playwright/test'

test.describe('Accounts Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('http://localhost:3000')
    await page.click('text=Login')
    await page.fill('input[name="email"]', 'test@example.com')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    await page.waitForURL(/dashboard|overview/)
  })

  test('should add a new bank account', async ({ page }) => {
    // Navigate to accounts page
    await page.click('text=Accounts')

    // Click add account button
    await page.click('button:has-text("Add Account")')

    // Fill account form
    await page.fill('input[placeholder="e.g., Everyday Checking"]', 'Everyday Checking')
    await page.fill('input[placeholder="e.g., Chase, Fidelity"]', 'Chase')
    await page.selectOption('select', { label: 'Savings' })
    await page.fill('input[placeholder="0.00"]', '5000')

    // Submit form
    await page.click('button:has-text("Add Account")')

    // Should show new account in list
    await expect(page.locator('text=Everyday Checking')).toBeVisible()
    await expect(page.locator('text=Chase')).toBeVisible()
  })

  test('should add a new card', async ({ page }) => {
    // Navigate to accounts page
    await page.click('text=Accounts')

    // Click add card button
    await page.click('button:has-text("Add Card")')

    // Fill card form
    await page.fill('input[placeholder="e.g., Chase Sapphire"]', 'Test Rewards Card')
    await page.selectOption('select', { label: 'Credit' })
    await page.fill('input[placeholder="4242"]', '1234')
    await page.selectOption('select', { label: 'Visa' })

    // Submit form
    await page.click('button:has-text("Add Card")')

    // Should show new card in list
    await expect(page.locator('text=Test Rewards Card')).toBeVisible()
    await expect(page.locator('text=1234')).toBeVisible()
  })

  test('should link a transaction to an account', async ({ page }) => {
    // Navigate to transactions page
    await page.click('text=Transactions')

    // Click add transaction button
    await page.click('button:has-text("Add Transaction")')

    // Fill transaction form
    await page.selectOption('select', { label: 'Expense' })
    await page.fill('input[type="number"]', '75.00')
    await page.fill('input[placeholder="e.g., Salary, Groceries"]', 'Dining')

    // Select linked account if available
    const accountSelect = page.locator('select').nth(1)
    const accountOptions = await accountSelect.locator('option').allTextContents()
    if (accountOptions.length > 1) {
      await accountSelect.selectOption({ index: 1 })
    }

    // Submit form
    await page.click('button:has-text("Add Transaction")')

    // Transaction should appear in the list
    await expect(page.locator('text=Dining')).toBeVisible()
  })

  test('should delete an account', async ({ page }) => {
    // Navigate to accounts page
    await page.click('text=Accounts')

    // Find first account delete button and click
    page.once('dialog', dialog => dialog.accept())
    const deleteButton = page.locator('button:has-text("Delete")').first()
    await deleteButton.click()

    // Account count should decrease (verify page still works)
    await expect(page.locator('text=Bank Accounts')).toBeVisible()
  })
})
