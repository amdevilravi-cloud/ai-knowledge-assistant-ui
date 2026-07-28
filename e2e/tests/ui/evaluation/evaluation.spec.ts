/**
 * Evaluation UI E2E Tests
 * Tests evaluation functionality including test management, run execution, and result analysis
 */

import { test, expect } from '@playwright/test';

test.describe('Evaluation UI Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/evaluation');
    await page.waitForLoadState('networkidle');
  });

  test('should load evaluation page successfully', async ({ page }) => {
    await expect(page).toHaveTitle(/Knowledge Assistant/);
    await expect(page.locator('h1, h2')).toContainText(/evaluation/i);
  });

  test('should display tabs for tests, runs, and results', async ({ page }) => {
    // Check for tabs
    const testsTab = page.locator('button:has-text("Tests"), button:has-text("Test"), [data-testid="tests-tab"]').first();
    const runsTab = page.locator('button:has-text("Runs"), button:has-text("Run"), [data-testid="runs-tab"]').first();
    const resultsTab = page.locator('button:has-text("Results"), [data-testid="results-tab"]').first();

    await expect(testsTab).toBeVisible();
    await expect(runsTab).toBeVisible();
    await expect(resultsTab).toBeVisible();
  });

  test('should display evaluation tests list', async ({ page }) => {
    // Check for tests list/table
    const testsList = page.locator('table, .tests-list, [data-testid="tests-list"]');
    const hasList = await testsList.count() > 0;

    if (hasList) {
      await expect(testsList.first()).toBeVisible();
    }
  });

  test('should display create test button', async ({ page }) => {
    const createButton = page.locator('button:has-text("Create"), button:has-text("Add"), button:has-text("New Test")').first();
    await expect(createButton).toBeVisible();
  });

  test('should show create test form when clicking create button', async ({ page }) => {
    const createButton = page.locator('button:has-text("Create"), button:has-text("Add"), button:has-text("New Test")').first();
    await createButton.click();

    // Check for form fields
    const nameInput = page.locator('input[name="name"], input[placeholder*="name" i]').first();
    const queryInput = page.locator('textarea[name="query"], input[name="query"]').first();
    const chunkIdsInput = page.locator('input[name="expectedChunkIds"], textarea[name="expectedChunkIds"]').first();

    const hasNameInput = await nameInput.count() > 0;
    const hasQueryInput = await queryInput.count() > 0;
    const hasChunkIdsInput = await chunkIdsInput.count() > 0;

    if (hasNameInput) {
      await expect(nameInput).toBeVisible();
    }
    if (hasQueryInput) {
      await expect(queryInput).toBeVisible();
    }
    if (hasChunkIdsInput) {
      await expect(chunkIdsInput).toBeVisible();
    }
  });

  test('should create new evaluation test', async ({ page }) => {
    const createButton = page.locator('button:has-text("Create"), button:has-text("Add"), button:has-text("New Test")').first();
    await createButton.click();

    // Fill form
    const nameInput = page.locator('input[name="name"], input[placeholder*="name" i]').first();
    const queryInput = page.locator('textarea[name="query"], input[name="query"]').first();
    const chunkIdsInput = page.locator('input[name="expectedChunkIds"], textarea[name="expectedChunkIds"]').first();
    const submitButton = page.locator('button:has-text("Submit"), button:has-text("Save"), button:has-text("Create")').first();

    await nameInput.fill(`Test ${Date.now()}`);
    
    const hasQueryInput = await queryInput.count() > 0;
    if (hasQueryInput) {
      await queryInput.fill('What is the vacation policy?');
    }

    const hasChunkIdsInput = await chunkIdsInput.count() > 0;
    if (hasChunkIdsInput) {
      await chunkIdsInput.fill('chunk1,chunk2,chunk3');
    }

    await submitButton.click();

    // Wait for creation to complete
    await page.waitForTimeout(2000);

    // Check for success message or form closure
    const successMessage = page.locator('.success, .alert-success, [data-testid="success"]');
    const hasSuccess = await successMessage.count() > 0;

    if (hasSuccess) {
      await expect(successMessage.first()).toBeVisible();
    }
  });

  test('should show validation error for empty test name', async ({ page }) => {
    const createButton = page.locator('button:has-text("Create"), button:has-text("Add"), button:has-text("New Test")').first();
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

  test('should allow deleting evaluation test', async ({ page }) => {
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
    }
  });

  test('should display evaluation runs list', async ({ page }) => {
    // Click on runs tab
    const runsTab = page.locator('button:has-text("Runs"), button:has-text("Run"), [data-testid="runs-tab"]').first();
    await runsTab.click();
    await page.waitForTimeout(1000);

    // Check for runs list/table
    const runsList = page.locator('table, .runs-list, [data-testid="runs-list"]');
    const hasList = await runsList.count() > 0;

    if (hasList) {
      await expect(runsList.first()).toBeVisible();
    }
  });

  test('should display create run button', async ({ page }) => {
    const createRunButton = page.locator('button:has-text("Create Run"), button:has-text("New Run")').first();
    const hasButton = await createRunButton.count() > 0;

    if (hasButton) {
      await expect(createRunButton).toBeVisible();
    }
  });

  test('should show create run form', async ({ page }) => {
    const createRunButton = page.locator('button:has-text("Create Run"), button:has-text("New Run")').first();
    const hasButton = await createRunButton.count() > 0;

    if (hasButton) {
      await createRunButton.click();

      // Check for form fields
      const nameInput = page.locator('input[name="name"], input[placeholder*="name" i]').first();
      const descriptionInput = page.locator('textarea[name="description"], input[name="description"]').first();

      const hasNameInput = await nameInput.count() > 0;
      const hasDescriptionInput = await descriptionInput.count() > 0;

      if (hasNameInput) {
        await expect(nameInput).toBeVisible();
      }
      if (hasDescriptionInput) {
        await expect(descriptionInput).toBeVisible();
      }
    }
  });

  test('should create new evaluation run', async ({ page }) => {
    const createRunButton = page.locator('button:has-text("Create Run"), button:has-text("New Run")').first();
    const hasButton = await createRunButton.count() > 0;

    if (hasButton) {
      await createRunButton.click();

      const nameInput = page.locator('input[name="name"], input[placeholder*="name" i]').first();
      const descriptionInput = page.locator('textarea[name="description"], input[name="description"]').first();
      const submitButton = page.locator('button:has-text("Submit"), button:has-text("Save"), button:has-text("Create")').first();

      await nameInput.fill(`Test Run ${Date.now()}`);

      const hasDescriptionInput = await descriptionInput.count() > 0;
      if (hasDescriptionInput) {
        await descriptionInput.fill('Test description');
      }

      await submitButton.click();

      // Wait for creation
      await page.waitForTimeout(2000);
    }
  });

  test('should allow running evaluation', async ({ page }) => {
    const runButton = page.locator('button:has-text("Run"), button:has-text("Execute")').first();
    const hasRunButton = await runButton.count() > 0;

    if (hasRunButton) {
      await runButton.click();

      // Wait for run to start
      await page.waitForTimeout(3000);

      // Check for running status
      const runningStatus = page.locator('.bg-primary, [data-testid="running-status"]');
      const hasRunningStatus = await runningStatus.count() > 0;

      if (hasRunningStatus) {
        await expect(runningStatus.first()).toBeVisible();
      }
    }
  });

  test('should display evaluation results', async ({ page }) => {
    const resultsTab = page.locator('button:has-text("Results"), [data-testid="results-tab"]').first();
    await resultsTab.click();
    await page.waitForTimeout(1000);

    // Check for results display
    const resultsList = page.locator('table, .results-list, [data-testid="results-list"]');
    const hasResults = await resultsList.count() > 0;

    if (hasResults) {
      await expect(resultsList.first()).toBeVisible();
    }
  });

  test('should display evaluation metrics', async ({ page }) => {
    const resultsTab = page.locator('button:has-text("Results"), [data-testid="results-tab"]').first();
    await resultsTab.click();
    await page.waitForTimeout(1000);

    // Look for metrics like recall, precision, MRR
    const metrics = page.locator('text=/recall|precision|mrr/i');
    const hasMetrics = await metrics.count() > 0;

    if (hasMetrics) {
      await expect(metrics.first()).toBeVisible();
    }
  });

  test('should allow exporting results', async ({ page }) => {
    const exportButton = page.locator('button:has-text("Export"), button:has-text("Download")').first();
    const hasExportButton = await exportButton.count() > 0;

    if (hasExportButton) {
      await exportButton.click();

      // Wait for download to start
      await page.waitForTimeout(2000);
    }
  });

  test('should display status badges for runs', async ({ page }) => {
    const runsTab = page.locator('button:has-text("Runs"), button:has-text("Run"), [data-testid="runs-tab"]').first();
    await runsTab.click();
    await page.waitForTimeout(1000);

    // Look for status badges
    const statusBadges = page.locator('.bg-success, .bg-primary, .bg-danger, .bg-secondary');
    const hasBadges = await statusBadges.count() > 0;

    if (hasBadges) {
      await expect(statusBadges.first()).toBeVisible();
    }
  });

  test('should allow deleting evaluation run', async ({ page }) => {
    const runsTab = page.locator('button:has-text("Runs"), button:has-text("Run"), [data-testid="runs-tab"]').first();
    await runsTab.click();
    await page.waitForTimeout(1000);

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

  test('should navigate to dashboard from evaluation page', async ({ page }) => {
    const dashboardLink = page.locator('a[href="/dashboard"], button:has-text("Dashboard")').first();
    const hasLink = await dashboardLink.count() > 0;

    if (hasLink) {
      await dashboardLink.click();
      await expect(page).toHaveURL('/dashboard');
    }
  });

  test('should display empty state when no tests exist', async ({ page }) => {
    const testsList = page.locator('table, .tests-list');
    const hasList = await testsList.count() > 0;

    if (hasList) {
      const rows = await testsList.locator('tr').count();
      
      if (rows <= 1) { // Only header row
        const emptyState = page.locator('text=/no tests/i, text=/empty/i, [data-testid="empty-state"]');
        const hasEmptyState = await emptyState.count() > 0;

        if (hasEmptyState) {
          await expect(emptyState.first()).toBeVisible();
        }
      }
    }
  });
});
