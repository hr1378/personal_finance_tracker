import { test, expect } from '@playwright/test'

test.describe('Debt Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('http://localhost:3000')
    await page.click('text=Login')
    await page.fill('input[name="email"]', 'test@example.com')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    await page.waitForURL(/dashboard|overview/)
  })

  test('should add a new debt', async ({ page }) => {
    // Navigate to debts page
    await page.click('text=Debts')

    // Click add debt button
    await page.click('text=Add Debt')

    // Fill debt form
    await page.fill('input[name="name"]', 'Credit Card')
    await page.fill('input[name="totalAmount"]', '5000')
    await page.fill('input[name="interestRate"]', '18.99')
    await page.fill('input[name="dueDate"]', '2024-12-15')

    // Submit form
    await page.click('button[type="submit"]')

    // Should show new debt in list
    await expect(page.locator('text=Credit Card')).toBeVisible()
    await expect(page.locator('text=5000')).toBeVisible()
  })

  test('should record a debt payment', async ({ page }) => {
    // Navigate to debts page
    await page.click('text=Debts')

    // Find first debt and click payment button
    const firstPaymentButton = page.locator('.debt-item').first().locator('button[aria-label="Add Payment"]')
    firstPaymentButton.click()

    // Fill payment form
    await page.fill('input[name="amount"]', '500')
    await page.fill('input[name="paymentDate"]', '2024-01-15')
    await page.fill('input[name="note"]', 'Monthly payment')

    // Submit form
    await page.click('button[type="submit"]')

    // Should show payment recorded
    await expect(page.locator('text=Payment recorded')).toBeVisible()
  })

  test('should update an existing debt', async ({ page }) => {
    // Navigate to debts page
    await page.click('text=Debts')

    // Find first debt edit button
    const firstEditButton = page.locator('.debt-item').first().locator('button[aria-label="Edit"]')
    firstEditButton.click()

    // Update amount
    await page.fill('input[name="totalAmount"]', '6000')

    // Submit form
    await page.click('button[type="submit"]')

    // Should show updated amount
    await expect(page.locator('text=6000')).toBeVisible()
  })

  test('should delete a debt', async ({ page }) => {
    // Navigate to debts page
    await page.click('text=Debts')

    // Find first debt delete button
    const firstDeleteButton = page.locator('.debt-item').first().locator('button[aria-label="Delete"]')
    firstDeleteButton.click()

    // Confirm deletion
    await page.click('text=Confirm')

    // Debt should be removed
    await expect(firstDeleteButton).not.toBeVisible()
  })

  test('should display debt progress', async ({ page }) => {
    // Navigate to debts page
    await page.click('text=Debts')

    // Check progress section
    await expect(page.locator('text=Debt Progress')).toBeVisible()
    await expect(page.locator('text=Total Debt')).toBeVisible()
    await expect(page.locator('text=Amount Paid')).toBeVisible()
    await expect(page.locator('text=Remaining')).toBeVisible()
  })
})
