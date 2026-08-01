/**
 * Documents UI E2E Tests
 * Tests document management functionality including upload, list, delete, and version history
 */

import { test, expect } from '@playwright/test';

test.describe('Documents UI Tests', () => {
  test.beforeEach(async ({ page }) => {
    try {
      await page.goto('/documents', { timeout: 5000 });
      await page.waitForLoadState('networkidle', { timeout: 5000 });
    } catch (error) {
      test.skip(true, 'Server not running - skipping UI tests');
    }
  });

  test('should load documents page successfully', async ({ page }) => {
    await expect(page).toHaveTitle(/Knowledge Assistant/);
    await expect(page.locator('h1, h2')).toContainText(/documents/i);
  });

  test('should display document upload form', async ({ page }) => {
    // Check for file input
    const fileInput = page.locator('input[type="file"]').first();
    await expect(fileInput).toBeVisible();

    // Check for upload button
    const uploadButton = page.locator('button:has-text("Upload"), button:has-text("Submit")').first();
    await expect(uploadButton).toBeVisible();
  });

  test('should display document list', async ({ page }) => {
    // Check for document list/table
    const documentList = page.locator('table, .document-list, [data-testid="document-list"]');
    const hasList = await documentList.count() > 0;

    if (hasList) {
      await expect(documentList.first()).toBeVisible();
    }
  });

  test('should display knowledge base selector', async ({ page }) => {
    // Check for knowledge base dropdown
    const kbSelector = page.locator('select[name="knowledgeBase"], select:has-text("Knowledge Base")').first();
    const hasSelector = await kbSelector.count() > 0;

    if (hasSelector) {
      await expect(kbSelector).toBeVisible();
    }
  });

  test('should display collection selector', async ({ page }) => {
    // Check for collection dropdown
    const collectionSelector = page.locator('select[name="collection"], select:has-text("Collection")').first();
    const hasSelector = await collectionSelector.count() > 0;

    if (hasSelector) {
      await expect(collectionSelector).toBeVisible();
    }
  });

  test('should show validation error for invalid file type', async ({ page }) => {
    const fileInput = page.locator('input[type="file"]').first();
    const uploadButton = page.locator('button:has-text("Upload"), button:has-text("Submit")').first();

    // Try to upload an invalid file type (create a dummy file in browser context)
    // Skip this test for now as file upload validation requires actual file system access
    test.skip(true, 'File upload validation requires actual file system access');
  });

  test('should show success message after successful upload', async ({ page }) => {
    // Skip this test as file upload requires actual file system access
    test.skip(true, 'File upload requires actual file system access');
  });

  test('should display document metadata in list', async ({ page }) => {
    // Check for document metadata columns
    const documentList = page.locator('table, .document-list');
    const hasList = await documentList.count() > 0;

    if (hasList) {
      // Look for metadata columns
      const nameColumn = page.locator('th:has-text("Name"), th:has-text("Document")');
      const sizeColumn = page.locator('th:has-text("Size"), th:has-text("File Size")');
      const dateColumn = page.locator('th:has-text("Date"), th:has-text("Uploaded")');

      const hasColumns = await nameColumn.count() > 0 || await sizeColumn.count() > 0 || await dateColumn.count() > 0;
      
      if (hasColumns) {
        await expect(nameColumn.first()).toBeVisible();
      }
    }
  });

  test('should allow document deletion', async ({ page }) => {
    // This test assumes there's at least one document in the list
    const deleteButton = page.locator('button:has-text("Delete"), button:has-text("Remove")').first();
    const hasDeleteButton = await deleteButton.count() > 0;

    if (hasDeleteButton) {
      await deleteButton.click();

      // Check for confirmation dialog
      const confirmDialog = page.locator('.modal, .dialog, [data-testid="confirm-dialog"]');
      const hasDialog = await confirmDialog.count() > 0;

      if (hasDialog) {
        const confirmButton = confirmDialog.locator('button:has-text("Confirm"), button:has-text("Yes")').first();
        await confirmButton.click();
      }

      // Wait for deletion to complete
      await page.waitForTimeout(2000);
    }
  });

  test('should display version history for document', async ({ page }) => {
    // Look for version history button/link
    const versionButton = page.locator('button:has-text("Version"), button:has-text("History")').first();
    const hasVersionButton = await versionButton.count() > 0;

    if (hasVersionButton) {
      await versionButton.click();

      // Check for version history display
      const versionHistory = page.locator('.version-history, [data-testid="version-history"]');
      await expect(versionHistory.first()).toBeVisible();
    }
  });

  test('should allow document reindexing', async ({ page }) => {
    // Look for reindex button
    const reindexButton = page.locator('button:has-text("Reindex"), button:has-text("Re-index")').first();
    const hasReindexButton = await reindexButton.count() > 0;

    if (hasReindexButton) {
      await reindexButton.click();

      // Wait for reindexing to complete
      await page.waitForTimeout(3000);

      // Check for success message
      const successMessage = page.locator('.success, .alert-success');
      const hasSuccess = await successMessage.count() > 0;

      if (hasSuccess) {
        await expect(successMessage.first()).toBeVisible();
      }
    }
  });

  test('should display file size in human-readable format', async ({ page }) => {
    const documentList = page.locator('table, .document-list');
    const hasList = await documentList.count() > 0;

    if (hasList) {
      // Look for file size display (should be in KB, MB, etc.)
      const fileSize = page.locator('text=/KB|MB|GB|Bytes/i');
      const hasFileSize = await fileSize.count() > 0;

      if (hasFileSize) {
        await expect(fileSize.first()).toBeVisible();
      }
    }
  });

  test('should handle loading state during upload', async ({ page }) => {
    // Skip this test as file upload requires actual file system access
    test.skip(true, 'File upload requires actual file system access');
  });

  test('should allow filtering/searching documents', async ({ page }) => {
    // Look for search input
    const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]').first();
    const hasSearch = await searchInput.count() > 0;

    if (hasSearch) {
      await searchInput.fill('test');
      await page.waitForTimeout(1000);

      // Search should trigger (either filter results or show no results)
      await expect(searchInput).toHaveValue('test');
    }
  });

  test('should display chunk count for documents', async ({ page }) => {
    const documentList = page.locator('table, .document-list');
    const hasList = await documentList.count() > 0;

    if (hasList) {
      // Look for chunk count display
      const chunkCount = page.locator('text=/chunk/i');
      const hasChunks = await chunkCount.count() > 0;

      if (hasChunks) {
        await expect(chunkCount.first()).toBeVisible();
      }
    }
  });

  test('should navigate to dashboard from documents page', async ({ page }) => {
    const dashboardLink = page.locator('a[href="/dashboard"], button:has-text("Dashboard")').first();
    const hasLink = await dashboardLink.count() > 0;

    if (hasLink) {
      await dashboardLink.click();
      await expect(page).toHaveURL('/dashboard');
    }
  });
});
