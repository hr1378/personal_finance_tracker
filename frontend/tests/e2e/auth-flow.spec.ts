import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000')
  })

  test('should register a new user', async ({ page }) => {
    // Navigate to registration
    await page.click('text=Register')

    // Fill registration form
    await page.fill('input[name="email"]', 'test@example.com')
    await page.fill('input[name="password"]', 'password123')
    await page.fill('input[name="preferredCurrency"]', 'USD')

    // Submit form
    await page.click('button[type="submit"]')

    // Should redirect to dashboard or show success
    await expect(page).toHaveURL(/dashboard|overview/)
  })

  test('should login with valid credentials', async ({ page }) => {
    // Navigate to login
    await page.click('text=Login')

    // Fill login form
    await page.fill('input[name="email"]', 'test@example.com')
    await page.fill('input[name="password"]', 'password123')

    // Submit form
    await page.click('button[type="submit"]')

    // Should redirect to dashboard
    await expect(page).toHaveURL(/dashboard|overview/)
  })

  test('should show error with invalid credentials', async ({ page }) => {
    // Navigate to login
    await page.click('text=Login')

    // Fill login form with invalid credentials
    await page.fill('input[name="email"]', 'test@example.com')
    await page.fill('input[name="password"]', 'wrongpassword')

    // Submit form
    await page.click('button[type="submit"]')

    // Should show error message
    await expect(page.locator('text=Invalid credentials')).toBeVisible()
  })

  test('should logout successfully', async ({ page }) => {
    // Login first
    await page.click('text=Login')
    await page.fill('input[name="email"]', 'test@example.com')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')

    // Wait for dashboard
    await page.waitForURL(/dashboard|overview/)

    // Logout
    await page.click('text=Logout')

    // Should redirect to login page
    await expect(page).toHaveURL(/login/)
  })
})
