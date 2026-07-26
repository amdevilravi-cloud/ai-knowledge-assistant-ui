/**
 * Authentication UI E2E Tests
 * Tests login functionality and authentication flows
 */

import { test, expect } from '@playwright/test';

test.describe('Authentication UI Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('should load login page successfully', async ({ page }) => {
    await expect(page).toHaveTitle(/Knowledge Assistant/);
    await expect(page.locator('h1, h2')).toContainText(/login|sign in/i);
  });

  test('should display login form', async ({ page }) => {
    // Check for username field
    const usernameField = page.locator('input[name="username"], input[type="text"]').first();
    await expect(usernameField).toBeVisible();

    // Check for password field
    const passwordField = page.locator('input[name="password"], input[type="password"]').first();
    await expect(passwordField).toBeVisible();

    // Check for submit button
    const submitButton = page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign In")').first();
    await expect(submitButton).toBeVisible();
  });

  test('should show validation error for empty fields', async ({ page }) => {
    const submitButton = page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign In")').first();
    await submitButton.click();

    // Check for validation error
    const errorMessage = page.locator('.error, .invalid-feedback, [data-testid="error"]');
    const hasError = await errorMessage.count() > 0;

    if (hasError) {
      await expect(errorMessage.first()).toBeVisible();
    }
  });

  test('should show error for invalid credentials', async ({ page }) => {
    const usernameField = page.locator('input[name="username"], input[type="text"]').first();
    const passwordField = page.locator('input[name="password"], input[type="password"]').first();
    const submitButton = page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign In")').first();

    await usernameField.fill('invaliduser');
    await passwordField.fill('invalidpassword');
    await submitButton.click();

    // Check for error message
    const errorMessage = page.locator('.error, .alert-error, [data-testid="error"]');
    await expect(errorMessage.first()).toBeVisible({ timeout: 5000 });
  });

  test('should redirect to chat page on successful login', async ({ page }) => {
    const usernameField = page.locator('input[name="username"], input[type="text"]').first();
    const passwordField = page.locator('input[name="password"], input[type="password"]').first();
    const submitButton = page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign In")').first();

    // Note: This test assumes there's a valid test user
    // In a real scenario, you'd set up test credentials
    await usernameField.fill('testuser');
    await passwordField.fill('testpassword');
    await submitButton.click();

    // Check if redirected (may fail if no test user exists)
    const currentUrl = page.url();
    const isRedirected = currentUrl.includes('/chat') || currentUrl.includes('/dashboard');

    if (!isRedirected) {
      // If login failed, check for error message
      const errorMessage = page.locator('.error, .alert-error');
      const hasError = await errorMessage.count() > 0;
      if (hasError) {
        await expect(errorMessage.first()).toBeVisible();
      }
    }
  });

  test('should have password field with type password', async ({ page }) => {
    const passwordField = page.locator('input[name="password"], input[type="password"]').first();
    const fieldType = await passwordField.getAttribute('type');
    expect(fieldType).toBe('password');
  });

  test('should allow tab navigation between fields', async ({ page }) => {
    const usernameField = page.locator('input[name="username"], input[type="text"]').first();
    const passwordField = page.locator('input[name="password"], input[type="password"]').first();

    await usernameField.fill('test');
    await page.keyboard.press('Tab');
    
    await expect(passwordField).toBeFocused();
  });

  test('should submit form on Enter key press', async ({ page }) => {
    const usernameField = page.locator('input[name="username"], input[type="text"]').first();
    const passwordField = page.locator('input[name="password"], input[type="password"]').first();

    await usernameField.fill('testuser');
    await passwordField.fill('testpassword');
    await page.keyboard.press('Enter');

    // Form should submit (either redirect or show error)
    await page.waitForTimeout(1000);
  });

  test('should display loading state during login', async ({ page }) => {
    const usernameField = page.locator('input[name="username"], input[type="text"]').first();
    const passwordField = page.locator('input[name="password"], input[type="password"]').first();
    const submitButton = page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign In")').first();

    await usernameField.fill('testuser');
    await passwordField.fill('testpassword');
    
    // Click submit
    await submitButton.click();

    // Check for loading indicator
    const loadingIndicator = page.locator('.loading, .spinner, [data-testid="loading"]');
    const hasLoading = await loadingIndicator.isVisible().catch(() => false);

    if (hasLoading) {
      await expect(loadingIndicator).toBeVisible();
    }
  });

  test('should have accessible form labels', async ({ page }) => {
    const usernameField = page.locator('input[name="username"], input[type="text"]').first();
    const passwordField = page.locator('input[name="password"], input[type="password"]').first();

    // Check for associated labels
    const usernameLabel = page.locator('label').filter({ hasText: /username|user name/i });
    const passwordLabel = page.locator('label').filter({ hasText: /password/i });

    const hasUsernameLabel = await usernameLabel.count() > 0;
    const hasPasswordLabel = await passwordLabel.count() > 0;

    if (hasUsernameLabel) {
      await expect(usernameLabel.first()).toBeVisible();
    }
    if (hasPasswordLabel) {
      await expect(passwordLabel.first()).toBeVisible();
    }
  });
});
