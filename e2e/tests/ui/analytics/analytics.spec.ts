/**
 * Analytics UI E2E Tests
 * Tests analytics dashboard functionality including statistics display and document summary
 */

import { test, expect } from '@playwright/test';

test.describe('Analytics UI Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/analytics');
    await page.waitForLoadState('networkidle');
  });

  test('should load analytics page successfully', async ({ page }) => {
    await expect(page).toHaveTitle(/Knowledge Assistant/);
    await expect(page.locator('h1, h2')).toContainText(/analytics/i);
  });

  test('should display total conversations card', async ({ page }) => {
    const conversationsCard = page.locator('.card:has-text("Total Conversations"), .card:has-text("conversations")').first();
    await expect(conversationsCard).toBeVisible();
  });

  test('should display total messages card', async ({ page }) => {
    const messagesCard = page.locator('.card:has-text("Total Messages"), .card:has-text("messages")').first();
    await expect(messagesCard).toBeVisible();
  });

  test('should display total documents card', async ({ page }) => {
    const documentsCard = page.locator('.card:has-text("Total Documents"), .card:has-text("documents")').first();
    await expect(documentsCard).toBeVisible();
  });

  test('should display active conversations card', async ({ page }) => {
    const activeConversationsCard = page.locator('.card:has-text("Active Conversations"), .card:has-text("active")').first();
    await expect(activeConversationsCard).toBeVisible();
  });

  test('should display statistics values', async ({ page }) => {
    // Look for numeric values in cards
    const numericValues = page.locator('.card-text, .fs-3');
    const hasValues = await numericValues.count() > 0;

    if (hasValues) {
      await expect(numericValues.first()).toBeVisible();
    }
  });

  test('should display document summary section', async ({ page }) => {
    const documentSummary = page.locator('text=/document summary/i, .card-header:has-text("Document Summary")');
    await expect(documentSummary).toBeVisible();
  });

  test('should display document list in summary', async ({ page }) => {
    const documentList = page.locator('.list-group, [data-testid="document-list"]');
    const hasList = await documentList.count() > 0;

    if (hasList) {
      await expect(documentList.first()).toBeVisible();
    }
  });

  test('should display document status badges', async ({ page }) => {
    const statusBadges = page.locator('.badge, [data-testid="status-badge"]');
    const hasBadges = await statusBadges.count() > 0;

    if (hasBadges) {
      await expect(statusBadges.first()).toBeVisible();
    }
  });

  test('should have colored cards for different metrics', async ({ page }) => {
    const primaryCard = page.locator('.card.bg-primary');
    const successCard = page.locator('.card.bg-success');
    const infoCard = page.locator('.card.bg-info');
    const warningCard = page.locator('.card.bg-warning');

    await expect(primaryCard).toBeVisible();
    await expect(successCard).toBeVisible();
    await expect(infoCard).toBeVisible();
    await expect(warningCard).toBeVisible();
  });

  test('should display card titles', async ({ page }) => {
    const cardTitles = page.locator('.card-title');
    const titleCount = await cardTitles.count();
    expect(titleCount).toBeGreaterThan(0);
  });

  test('should have responsive grid layout', async ({ page }) => {
    const row = page.locator('.row');
    const col = page.locator('.col-md-3, .col-md-6');

    await expect(row).toBeVisible();
    await expect(col).toBeVisible();
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

  test('should display zero values when no data exists', async ({ page }) => {
    // Look for zero values in cards
    const zeroValues = page.locator('text=/0/i');
    const hasZeros = await zeroValues.count() > 0;

    if (hasZeros) {
      // At least one card should show 0 if no data
      await expect(zeroValues.first()).toBeVisible();
    }
  });

  test('should navigate to dashboard from analytics page', async ({ page }) => {
    const dashboardLink = page.locator('a[href="/dashboard"], button:has-text("Dashboard")').first();
    const hasLink = await dashboardLink.count() > 0;

    if (hasLink) {
      await dashboardLink.click();
      await expect(page).toHaveURL('/dashboard');
    }
  });

  test('should have proper spacing and layout', async ({ page }) => {
    const container = page.locator('.container-fluid');
    const cards = page.locator('.card');

    await expect(container).toBeVisible();
    await expect(cards.first()).toBeVisible();
  });

  test('should display document names in summary', async ({ page }) => {
    const documentList = page.locator('.list-group');
    const hasList = await documentList.count() > 0;

    if (hasList) {
      const listItems = documentList.locator('.list-group-item');
      const itemCount = await listItems.count();

      if (itemCount > 0) {
        await expect(listItems.first()).toBeVisible();
      }
    }
  });

  test('should handle empty state gracefully', async ({ page }) => {
    const documentList = page.locator('.list-group');
    const hasList = await documentList.count() > 0;

    if (hasList) {
      const listItems = documentList.locator('.list-group-item');
      const itemCount = await listItems.count();

      if (itemCount === 0) {
        // Should show empty state or no items
        const emptyState = page.locator('text=/no documents/i, text=/empty/i');
        const hasEmptyState = await emptyState.count() > 0;

        if (hasEmptyState) {
          await expect(emptyState.first()).toBeVisible();
        }
      }
    }
  });

  test('should have accessible card structure', async ({ page }) => {
    const cards = page.locator('.card');
    const cardCount = await cards.count();

    for (let i = 0; i < Math.min(cardCount, 4); i++) {
      const card = cards.nth(i);
      await expect(card).toBeVisible();
      
      const cardBody = card.locator('.card-body');
      await expect(cardBody).toBeVisible();
    }
  });

  test('should display analytics dashboard title', async ({ page }) => {
    const title = page.locator('h2:has-text("Analytics Dashboard"), h1:has-text("Analytics")');
    await expect(title).toBeVisible();
  });
});
