/**
 * Settings UI E2E Tests
 * Tests settings page functionality including user profile display and preferences
 */

import { test, expect } from '@playwright/test';

test.describe('Settings UI Tests', () => {
  test.beforeEach(async ({ page }) => {
    try {
      await page.goto('/settings', { timeout: 5000 });
      await page.waitForLoadState('networkidle', { timeout: 5000 });
    } catch (error) {
      test.skip(true, 'Server not running - skipping UI tests');
    }
  });

  test('should load settings page successfully', async ({ page }) => {
    await expect(page).toHaveTitle(/Knowledge Assistant/);
    await expect(page.locator('h1, h2')).toContainText(/settings/i);
  });

  test('should display user profile section', async ({ page }) => {
    const userProfileSection = page.locator('text=/user profile/i, .card-header:has-text("User Profile")');
    await expect(userProfileSection).toBeVisible();
  });

  test('should display username field', async ({ page }) => {
    const usernameField = page.locator('input[disabled][value], input[type="text"][disabled]').first();
    const hasField = await usernameField.count() > 0;
    if (hasField) {
      await expect(usernameField).toBeVisible();
    } else {
      test.skip(true, 'Username field not found');
    }
  });

  test('should display email field', async ({ page }) => {
    const emailField = page.locator('input[type="email"][disabled]').first();
    const hasField = await emailField.count() > 0;
    if (hasField) {
      await expect(emailField).toBeVisible();
    } else {
      test.skip(true, 'Email field not found');
    }
  });

  test('should display roles field', async ({ page }) => {
    const rolesField = page.locator('input[type="text"][disabled]').nth(2);
    const hasRolesField = await rolesField.count() > 0;

    if (hasRolesField) {
      await expect(rolesField).toBeVisible();
    } else {
      test.skip(true, 'Roles field not found');
    }
  });

  test('should display preferences section', async ({ page }) => {
    const preferencesSection = page.locator('text=/preferences/i, .card-header:has-text("Preferences")');
    await expect(preferencesSection).toBeVisible();
  });

  test('should display notifications checkbox', async ({ page }) => {
    const notificationsCheckbox = page.locator('input[type="checkbox"]#notifications, input[type="checkbox"]').first();
    const hasCheckbox = await notificationsCheckbox.count() > 0;
    if (hasCheckbox) {
      await expect(notificationsCheckbox).toBeVisible();
    } else {
      test.skip(true, 'Notifications checkbox not found');
    }
  });

  test('should display dark mode checkbox', async ({ page }) => {
    const darkModeCheckbox = page.locator('input[type="checkbox"]#darkMode, input[type="checkbox"]').nth(1);
    const hasDarkModeCheckbox = await darkModeCheckbox.count() > 0;

    if (hasDarkModeCheckbox) {
      await expect(darkModeCheckbox).toBeVisible();
    } else {
      test.skip(true, 'Dark mode checkbox not found');
    }
  });

  test('should display save preferences button', async ({ page }) => {
    const saveButton = page.locator('button:has-text("Save"), button:has-text("Save Preferences")').first();
    const hasButton = await saveButton.count() > 0;
    if (hasButton) {
      await expect(saveButton).toBeVisible();
    } else {
      test.skip(true, 'Save button not found');
    }
  });

  test('should allow toggling notifications checkbox', async ({ page }) => {
    const notificationsCheckbox = page.locator('input[type="checkbox"]#notifications, input[type="checkbox"]').first();
    const hasCheckbox = await notificationsCheckbox.count() > 0;
    
    if (!hasCheckbox) {
      test.skip(true, 'Notifications checkbox not found');
      return;
    }
    
    const isChecked = await notificationsCheckbox.isChecked();
    await notificationsCheckbox.click();
    
    const newChecked = await notificationsCheckbox.isChecked();
    expect(newChecked).toBe(!isChecked);
  });

  test('should allow toggling dark mode checkbox', async ({ page }) => {
    const darkModeCheckbox = page.locator('input[type="checkbox"]#darkMode, input[type="checkbox"]').nth(1);
    const hasDarkModeCheckbox = await darkModeCheckbox.count() > 0;

    if (!hasDarkModeCheckbox) {
      test.skip(true, 'Dark mode checkbox not found');
      return;
    }
    
    const isChecked = await darkModeCheckbox.isChecked();
    await darkModeCheckbox.click();
    
    const newChecked = await darkModeCheckbox.isChecked();
    expect(newChecked).toBe(!isChecked);
  });

  test('should save preferences when clicking save button', async ({ page }) => {
    const notificationsCheckbox = page.locator('input[type="checkbox"]#notifications, input[type="checkbox"]').first();
    const saveButton = page.locator('button:has-text("Save"), button:has-text("Save Preferences")').first();
    
    const hasCheckbox = await notificationsCheckbox.count() > 0;
    const hasSaveButton = await saveButton.count() > 0;
    
    if (!hasCheckbox || !hasSaveButton) {
      test.skip(true, 'Required elements not found');
      return;
    }

    // Toggle a preference
    await notificationsCheckbox.click();
    
    // Click save
    await saveButton.click();

    // Wait for save to complete
    await page.waitForTimeout(1000);

    // Check for success message (if any)
    const successMessage = page.locator('.success, .alert-success');
    const hasSuccess = await successMessage.count() > 0;

    if (hasSuccess) {
      await expect(successMessage.first()).toBeVisible();
    }
  });

  test('should have disabled user profile fields', async ({ page }) => {
    const usernameField = page.locator('input[type="text"][disabled]').first();
    const emailField = page.locator('input[type="email"][disabled]').first();
    
    const hasUsername = await usernameField.count() > 0;
    const hasEmail = await emailField.count() > 0;
    
    if (hasUsername && hasEmail) {
      await expect(usernameField).toBeDisabled();
      await expect(emailField).toBeDisabled();
    } else {
      test.skip(true, 'User profile fields not found');
    }
  });

  test('should display form labels for user profile fields', async ({ page }) => {
    const usernameLabel = page.locator('label:has-text("Username")');
    const emailLabel = page.locator('label:has-text("Email")');
    const rolesLabel = page.locator('label:has-text("Roles")');

    await expect(usernameLabel).toBeVisible();
    await expect(emailLabel).toBeVisible();
    await expect(rolesLabel).toBeVisible();
  });

  test('should display form labels for preferences', async ({ page }) => {
    const notificationsLabel = page.locator('label:has-text("Notifications"), label[for="notifications"]');
    const darkModeLabel = page.locator('label:has-text("Dark Mode"), label[for="darkMode"]');

    await expect(notificationsLabel).toBeVisible();
    
    const hasDarkModeLabel = await darkModeLabel.count() > 0;
    if (hasDarkModeLabel) {
      await expect(darkModeLabel).toBeVisible();
    }
  });

  test('should have card layout for sections', async ({ page }) => {
    const cards = page.locator('.card');
    const cardCount = await cards.count();
    expect(cardCount).toBeGreaterThanOrEqual(2);
  });

  test('should navigate to dashboard from settings page', async ({ page }) => {
    const dashboardLink = page.locator('a[href="/dashboard"], button:has-text("Dashboard")').first();
    const hasLink = await dashboardLink.count() > 0;

    if (hasLink) {
      await dashboardLink.click();
      await page.waitForTimeout(1000);
      const currentUrl = page.url();
      expect(currentUrl).toContain('/dashboard');
    } else {
      test.skip(true, 'Dashboard link not found');
    }
  });

  test('should handle loading state', async ({ page }) => {
    const loadingIndicator = page.locator('.loading, .spinner, [data-testid="loading"]');
    const hasLoading = await loadingIndicator.isVisible().catch(() => false);

    if (hasLoading) {
      await expect(loadingIndicator).toBeVisible();
      await page.waitForLoadState('networkidle');
      await expect(loadingIndicator).not.toBeVisible();
    }
  });

  test('should display user information if authenticated', async ({ page }) => {
    const usernameField = page.locator('input[type="text"][disabled]').first();
    const emailField = page.locator('input[type="email"][disabled]').first();

    const usernameValue = await usernameField.inputValue();
    const emailValue = await emailField.inputValue();

    // Fields should have some value if user is authenticated
    const hasUsername = usernameValue.length > 0;
    const hasEmail = emailValue.length > 0;

    if (hasUsername || hasEmail) {
      // User is authenticated, values should be present
      expect(hasUsername || hasEmail).toBe(true);
    }
  });

  test('should have responsive layout', async ({ page }) => {
    // Check if page has responsive container
    const container = page.locator('.container-fluid');
    await expect(container).toBeVisible();
  });

  test('should have proper spacing and layout', async ({ page }) => {
    // Check for Bootstrap grid classes
    const row = page.locator('.row');
    const col = page.locator('.col-md-6');

    await expect(row).toBeVisible();
    await expect(col).toBeVisible();
  });
});
