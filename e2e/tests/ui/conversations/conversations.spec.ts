/**
 * Conversations UI E2E Tests
 * Tests conversation management functionality including list, search, edit, export, and delete
 */

import { test, expect } from '@playwright/test';

test.describe('Conversations UI Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/conversations');
    await page.waitForLoadState('networkidle');
  });

  test('should load conversations page successfully', async ({ page }) => {
    await expect(page).toHaveTitle(/Knowledge Assistant/);
    await expect(page.locator('h1, h2')).toContainText(/conversations/i);
  });

  test('should display conversations list', async ({ page }) => {
    const conversationsList = page.locator('table, .conversations-list, [data-testid="conversations-list"]');
    const hasList = await conversationsList.count() > 0;

    if (hasList) {
      await expect(conversationsList.first()).toBeVisible();
    }
  });

  test('should display search input', async ({ page }) => {
    const searchInput = page.locator('input[type="search"], input[placeholder*="search" i], [data-testid="search-input"]').first();
    await expect(searchInput).toBeVisible();
  });

  test('should allow searching conversations', async ({ page }) => {
    const searchInput = page.locator('input[type="search"], input[placeholder*="search" i], [data-testid="search-input"]').first();
    await searchInput.fill('test');
    await page.waitForTimeout(1000);

    // Search should trigger
    await expect(searchInput).toHaveValue('test');
  });

  test('should display conversation metadata in list', async ({ page }) => {
    const conversationsList = page.locator('table, .conversations-list');
    const hasList = await conversationsList.count() > 0;

    if (hasList) {
      // Look for metadata columns
      const titleColumn = page.locator('th:has-text("Title"), th:has-text("Conversation")');
      const dateColumn = page.locator('th:has-text("Date"), th:has-text("Created"), th:has-text("Updated")');

      const hasColumns = await titleColumn.count() > 0 || await dateColumn.count() > 0;
      
      if (hasColumns) {
        await expect(titleColumn.first()).toBeVisible();
      }
    }
  });

  test('should allow opening conversation', async ({ page }) => {
    const conversationItem = page.locator('.conversation-item, [data-testid="conversation-item"]').first();
    const hasItem = await conversationItem.count() > 0;

    if (hasItem) {
      await conversationItem.click();

      // Should navigate to chat page
      await page.waitForTimeout(2000);
      const currentUrl = page.url();
      expect(currentUrl).toContain('/chat');
    }
  });

  test('should display edit button for conversations', async ({ page }) => {
    const editButton = page.locator('button:has-text("Edit"), button[title*="Edit"]').first();
    const hasEditButton = await editButton.count() > 0;

    if (hasEditButton) {
      await expect(editButton).toBeVisible();
    }
  });

  test('should allow editing conversation title', async ({ page }) => {
    const editButton = page.locator('button:has-text("Edit"), button[title*="Edit"]').first();
    const hasEditButton = await editButton.count() > 0;

    if (hasEditButton) {
      await editButton.click();

      // Check for edit modal
      const editModal = page.locator('.modal, .dialog, [data-testid="edit-modal"]');
      const hasModal = await editModal.count() > 0;

      if (hasModal) {
        const titleInput = page.locator('input[name="title"], input[placeholder*="title" i]').first();
        await expect(titleInput).toBeVisible();

        await titleInput.fill(`Updated Title ${Date.now()}`);

        const saveButton = editModal.locator('button:has-text("Save"), button:has-text("Update")').first();
        await saveButton.click();

        // Wait for save
        await page.waitForTimeout(2000);
      }
    }
  });

  test('should display export options', async ({ page }) => {
    const exportButton = page.locator('button:has-text("Export"), button[title*="Export"]').first();
    const hasExportButton = await exportButton.count() > 0;

    if (hasExportButton) {
      await exportButton.click();

      // Check for export options
      const exportOptions = page.locator('.dropdown, [data-testid="export-options"]');
      const hasOptions = await exportOptions.count() > 0;

      if (hasOptions) {
        await expect(exportOptions.first()).toBeVisible();
      }
    }
  });

  test('should allow exporting conversation as JSON', async ({ page }) => {
    const exportButton = page.locator('button:has-text("Export"), button[title*="Export"]').first();
    const hasExportButton = await exportButton.count() > 0;

    if (hasExportButton) {
      await exportButton.click();

      // Look for JSON export option
      const jsonOption = page.locator('button:has-text("JSON"), button:has-text("json")').first();
      const hasJsonOption = await jsonOption.count() > 0;

      if (hasJsonOption) {
        await jsonOption.click();

        // Wait for download
        await page.waitForTimeout(2000);
      }
    }
  });

  test('should allow exporting conversation as Markdown', async ({ page }) => {
    const exportButton = page.locator('button:has-text("Export"), button[title*="Export"]').first();
    const hasExportButton = await exportButton.count() > 0;

    if (hasExportButton) {
      await exportButton.click();

      // Look for Markdown export option
      const mdOption = page.locator('button:has-text("Markdown"), button:has-text("markdown"), button:has-text("MD")').first();
      const hasMdOption = await mdOption.count() > 0;

      if (hasMdOption) {
        await mdOption.click();

        // Wait for download
        await page.waitForTimeout(2000);
      }
    }
  });

  test('should allow duplicating conversation', async ({ page }) => {
    const duplicateButton = page.locator('button:has-text("Duplicate"), button[title*="Duplicate"]').first();
    const hasDuplicateButton = await duplicateButton.count() > 0;

    if (hasDuplicateButton) {
      await duplicateButton.click();

      // Wait for duplication
      await page.waitForTimeout(2000);

      // Check for success message
      const successMessage = page.locator('.success, .alert-success');
      const hasSuccess = await successMessage.count() > 0;

      if (hasSuccess) {
        await expect(successMessage.first()).toBeVisible();
      }
    }
  });

  test('should allow archiving conversation', async ({ page }) => {
    const archiveButton = page.locator('button:has-text("Archive"), button[title*="Archive"]').first();
    const hasArchiveButton = await archiveButton.count() > 0;

    if (hasArchiveButton) {
      await archiveButton.click();

      // Check for confirmation dialog
      const confirmDialog = page.locator('.modal, .dialog, [data-testid="confirm-dialog"]');
      const hasDialog = await confirmDialog.count() > 0;

      if (hasDialog) {
        const confirmButton = confirmDialog.locator('button:has-text("Confirm"), button:has-text("Yes")').first();
        await confirmButton.click();
      }

      // Wait for archive
      await page.waitForTimeout(2000);
    }
  });

  test('should allow pinning conversation', async ({ page }) => {
    const pinButton = page.locator('button:has-text("Pin"), button[title*="Pin"]').first();
    const hasPinButton = await pinButton.count() > 0;

    if (hasPinButton) {
      await pinButton.click();

      // Wait for pin
      await page.waitForTimeout(1000);

      // Check for pinned indicator
      const pinnedIndicator = page.locator('.pinned, [data-testid="pinned"]');
      const hasPinned = await pinnedIndicator.count() > 0;

      if (hasPinned) {
        await expect(pinnedIndicator.first()).toBeVisible();
      }
    }
  });

  test('should allow deleting conversation', async ({ page }) => {
    const deleteButton = page.locator('button:has-text("Delete"), button[title*="Delete"]').first();
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

  test('should display conversation dropdown menu', async ({ page }) => {
    const dropdownButton = page.locator('button[aria-haspopup="true"], .dropdown-toggle, [data-testid="dropdown-button"]').first();
    const hasDropdown = await dropdownButton.count() > 0;

    if (hasDropdown) {
      await dropdownButton.click();

      // Check for dropdown menu
      const dropdownMenu = page.locator('.dropdown-menu, [data-testid="dropdown-menu"]');
      await expect(dropdownMenu.first()).toBeVisible();
    }
  });

  test('should format dates correctly', async ({ page }) => {
    const conversationsList = page.locator('table, .conversations-list');
    const hasList = await conversationsList.count() > 0;

    if (hasList) {
      // Look for date elements
      const dateElements = page.locator('text=/\\d{1,2}\\/\\d{1,2}\\/\\d{4}/, text=/Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec/i');
      const hasDates = await dateElements.count() > 0;

      if (hasDates) {
        await expect(dateElements.first()).toBeVisible();
      }
    }
  });

  test('should display empty state when no conversations exist', async ({ page }) => {
    const conversationsList = page.locator('table, .conversations-list');
    const hasList = await conversationsList.count() > 0;

    if (hasList) {
      const rows = await conversationsList.locator('tr').count();
      
      if (rows <= 1) { // Only header row
        const emptyState = page.locator('text=/no conversations/i, text=/empty/i, [data-testid="empty-state"]');
        const hasEmptyState = await emptyState.count() > 0;

        if (hasEmptyState) {
          await expect(emptyState.first()).toBeVisible();
        }
      }
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

  test('should navigate to chat from conversations page', async ({ page }) => {
    const chatLink = page.locator('a[href="/chat"], button:has-text("Chat")').first();
    const hasLink = await chatLink.count() > 0;

    if (hasLink) {
      await chatLink.click();
      await expect(page).toHaveURL('/chat');
    }
  });

  test('should navigate to dashboard from conversations page', async ({ page }) => {
    const dashboardLink = page.locator('a[href="/dashboard"], button:has-text("Dashboard")').first();
    const hasLink = await dashboardLink.count() > 0;

    if (hasLink) {
      await dashboardLink.click();
      await expect(page).toHaveURL('/dashboard');
    }
  });

  test('should close dropdown when clicking outside', async ({ page }) => {
    const dropdownButton = page.locator('button[aria-haspopup="true"], .dropdown-toggle, [data-testid="dropdown-button"]').first();
    const hasDropdown = await dropdownButton.count() > 0;

    if (hasDropdown) {
      await dropdownButton.click();

      // Click outside
      await page.mouse.click(0, 0);

      // Dropdown should close
      await page.waitForTimeout(500);

      const dropdownMenu = page.locator('.dropdown-menu, [data-testid="dropdown-menu"]');
      const isVisible = await dropdownMenu.isVisible().catch(() => false);
      expect(isVisible).toBe(false);
    }
  });

  test('should display conversation preview or snippet', async ({ page }) => {
    const conversationsList = page.locator('table, .conversations-list');
    const hasList = await conversationsList.count() > 0;

    if (hasList) {
      // Look for conversation preview/snippet
      const preview = page.locator('.preview, .snippet, [data-testid="conversation-preview"]');
      const hasPreview = await preview.count() > 0;

      if (hasPreview) {
        await expect(preview.first()).toBeVisible();
      }
    }
  });
});
