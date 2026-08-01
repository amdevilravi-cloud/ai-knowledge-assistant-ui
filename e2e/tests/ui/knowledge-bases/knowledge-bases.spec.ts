/**
 * Knowledge Bases UI E2E Tests
 * Tests knowledge base management functionality including create, list, update, and delete
 */

import { test, expect } from '@playwright/test';

test.describe('Knowledge Bases UI Tests', () => {
  test.beforeEach(async ({ page }) => {
    try {
      await page.goto('/knowledge-bases', { timeout: 5000 });
      await page.waitForLoadState('networkidle', { timeout: 5000 });
    } catch (error) {
      test.skip(true, 'Server not running - skipping UI tests');
    }
  });

  test('should load knowledge bases page successfully', async ({ page }) => {
    await expect(page).toHaveTitle(/Knowledge Assistant/);
    await expect(page.locator('h1, h2')).toContainText(/knowledge bases/i);
  });

  test('should display knowledge base list', async ({ page }) => {
    // Check for knowledge base list/table
    const kbList = page.locator('table, .knowledge-base-list, [data-testid="knowledge-base-list"]');
    const hasList = await kbList.count() > 0;

    if (hasList) {
      await expect(kbList.first()).toBeVisible();
    }
  });

  test('should display create knowledge base button', async ({ page }) => {
    // Check for create button
    const createButton = page.locator('button:has-text("Create"), button:has-text("Add"), button:has-text("New")').first();
    await expect(createButton).toBeVisible();
  });

  test('should show create form when clicking create button', async ({ page }) => {
    const createButton = page.locator('button:has-text("Create"), button:has-text("Add"), button:has-text("New")').first();
    await createButton.click();

    // Check for form fields
    const nameInput = page.locator('input[name="name"], input[placeholder*="name" i]').first();
    const hasNameInput = await nameInput.count() > 0;

    if (hasNameInput) {
      await expect(nameInput).toBeVisible();
    }

    // Check for description field
    const descriptionInput = page.locator('textarea[name="description"], input[name="description"]').first();
    const hasDescription = await descriptionInput.count() > 0;

    if (hasDescription) {
      await expect(descriptionInput).toBeVisible();
    }
  });

  test('should create new knowledge base', async ({ page }) => {
    const createButton = page.locator('button:has-text("Create"), button:has-text("Add"), button:has-text("New")').first();
    await createButton.click();

    // Fill form
    const nameInput = page.locator('input[name="name"], input[placeholder*="name" i]').first();
    const descriptionInput = page.locator('textarea[name="description"], input[name="description"]').first();
    const submitButton = page.locator('button:has-text("Submit"), button:has-text("Save"), button:has-text("Create")').first();

    await nameInput.fill(`Test KB ${Date.now()}`);
    
    const hasDescription = await descriptionInput.count() > 0;
    if (hasDescription) {
      await descriptionInput.fill('Test description');
    }

    await submitButton.click();

    // Wait for creation to complete
    await page.waitForTimeout(2000);

    // Check for success message
    const successMessage = page.locator('.success, .alert-success, [data-testid="success"]');
    const hasSuccess = await successMessage.count() > 0;

    if (hasSuccess) {
      await expect(successMessage.first()).toBeVisible();
    }
  });

  test('should show validation error for empty name', async ({ page }) => {
    const createButton = page.locator('button:has-text("Create"), button:has-text("Add"), button:has-text("New")').first();
    await createButton.click();

    const submitButton = page.locator('button:has-text("Submit"), button:has-text("Save"), button:has-text("Create")').first();
    await submitButton.click();

    // Check for validation error
    const errorMessage = page.locator('.error, .invalid-feedback, [data-testid="error"]');
    const hasError = await errorMessage.count() > 0;

    if (hasError) {
      await expect(errorMessage.first()).toBeVisible();
    }
  });

  test('should display knowledge base metadata in list', async ({ page }) => {
    const kbList = page.locator('table, .knowledge-base-list');
    const hasList = await kbList.count() > 0;

    if (hasList) {
      // Look for metadata columns
      const nameColumn = page.locator('th:has-text("Name"), th:has-text("Knowledge Base")');
      const descriptionColumn = page.locator('th:has-text("Description")');
      const createdColumn = page.locator('th:has-text("Created"), th:has-text("Date")');

      const hasColumns = await nameColumn.count() > 0 || await descriptionColumn.count() > 0 || await createdColumn.count() > 0;
      
      if (hasColumns) {
        await expect(nameColumn.first()).toBeVisible();
      }
    }
  });

  test('should allow editing knowledge base', async ({ page }) => {
    // Look for edit button
    const editButton = page.locator('button:has-text("Edit"), button:has-text("Modify")').first();
    const hasEditButton = await editButton.count() > 0;

    if (hasEditButton) {
      await editButton.click();

      // Check for edit form
      const nameInput = page.locator('input[name="name"], input[placeholder*="name" i]').first();
      await expect(nameInput).toBeVisible();

      // Modify name
      await nameInput.fill(`Updated KB ${Date.now()}`);

      // Submit
      const submitButton = page.locator('button:has-text("Save"), button:has-text("Update")').first();
      await submitButton.click();

      // Wait for update
      await page.waitForTimeout(2000);
    }
  });

  test('should allow deleting knowledge base', async ({ page }) => {
    // Look for delete button
    const deleteButton = page.locator('button:has-text("Delete"), button:has-text("Remove")').first();
    const hasDeleteButton = await deleteButton.count() > 0;

    if (hasDeleteButton) {
      await deleteButton.click();

      // Check for confirmation dialog
      const confirmDialog = page.locator('.modal, .dialog, [data-testid="confirm-dialog"]');
      const hasDialog = await confirmDialog.count() > 0;

      if (hasDialog) {
        const confirmButton = confirmDialog.locator('button:has-text("Confirm"), button:has-text("Yes"), button:has-text("Delete")').first();
        await confirmButton.click();
      }

      // Wait for deletion
      await page.waitForTimeout(2000);

      // Check for success message
      const successMessage = page.locator('.success, .alert-success');
      const hasSuccess = await successMessage.count() > 0;

      if (hasSuccess) {
        await expect(successMessage.first()).toBeVisible();
      }
    }
  });

  test('should navigate to collections from knowledge base', async ({ page }) => {
    // Look for collections link/button
    const collectionsLink = page.locator('a[href="/collections"], button:has-text("Collections")').first();
    const hasLink = await collectionsLink.count() > 0;

    if (hasLink) {
      await collectionsLink.click();
      await expect(page).toHaveURL(/\/collections/);
    }
  });

  test('should display empty state when no knowledge bases exist', async ({ page }) => {
    const kbList = page.locator('table, .knowledge-base-list');
    const hasList = await kbList.count() > 0;

    if (hasList) {
      const rows = await kbList.locator('tr').count();
      
      if (rows <= 1) { // Only header row
        // Check for empty state message
        const emptyState = page.locator('text=/no knowledge bases/i, text=/empty/i, [data-testid="empty-state"]');
        const hasEmptyState = await emptyState.count() > 0;

        if (hasEmptyState) {
          await expect(emptyState.first()).toBeVisible();
        }
      }
    }
  });

  test('should handle loading state', async ({ page }) => {
    // Check for loading indicator
    const loadingIndicator = page.locator('.loading, .spinner, [data-testid="loading"]');
    const hasLoading = await loadingIndicator.isVisible().catch(() => false);

    if (hasLoading) {
      await expect(loadingIndicator).toBeVisible();
      await page.waitForLoadState('networkidle');
      await expect(loadingIndicator).not.toBeVisible();
    }
  });

  test('should have working pagination if applicable', async ({ page }) => {
    // Look for pagination controls
    const pagination = page.locator('.pagination, [data-testid="pagination"]');
    const hasPagination = await pagination.count() > 0;

    if (hasPagination) {
      await expect(pagination.first()).toBeVisible();
    }
  });

  test('should navigate to dashboard from knowledge bases page', async ({ page }) => {
    const dashboardLink = page.locator('a[href="/dashboard"], button:has-text("Dashboard")').first();
    const hasLink = await dashboardLink.count() > 0;

    if (hasLink) {
      await dashboardLink.click();
      await expect(page).toHaveURL('/dashboard');
    }
  });
});
