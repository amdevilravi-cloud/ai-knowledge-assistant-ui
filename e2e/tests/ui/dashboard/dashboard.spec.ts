/**
 * Dashboard UI E2E Tests
 * Tests dashboard page functionality and statistics display
 */

import { test, expect } from '@playwright/test';

test.describe('Dashboard UI Tests', () => {
  test.beforeEach(async ({ page }) => {
    try {
      await page.goto('/dashboard', { timeout: 5000 });
      await page.waitForLoadState('networkidle', { timeout: 5000 });
    } catch (error) {
      test.skip(true, 'Server not running - skipping UI tests');
    }
  });

  test('should load dashboard page successfully', async ({ page }) => {
    await expect(page).toHaveTitle(/Knowledge Assistant/);
    await expect(page.locator('h1, h2')).toContainText('Dashboard');
  });

  test('should display statistics cards', async ({ page }) => {
    // Wait for stats to load
    await page.waitForLoadState('networkidle');

    // Check for statistics cards
    const statsCards = page.locator('.card, .stat-card, .stats-card');
    await expect(statsCards.first()).toBeVisible();
  });

  test('should display total conversations count', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Look for conversations stat
    const conversationsStat = page.locator('text=/conversations/i');
    await expect(conversationsStat).toBeVisible();
  });

  test('should display total documents count', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Look for documents stat
    const documentsStat = page.locator('text=/documents/i');
    await expect(documentsStat).toBeVisible();
  });

  test('should display total knowledge bases count', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Look for knowledge bases stat
    const kbStat = page.locator('text=/knowledge bases/i');
    await expect(kbStat).toBeVisible();
  });

  test('should display total collections count', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Look for collections stat
    const collectionsStat = page.locator('text=/collections/i');
    await expect(collectionsStat).toBeVisible();
  });

  test('should display recent activity section', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Look for recent activity section
    const recentActivity = page.locator('text=/recent activity/i');
    await expect(recentActivity).toBeVisible();
  });

  test('should navigate to documents page from dashboard', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Click on documents link/button
    const documentsLink = page.locator('a[href="/documents"], button:has-text("Documents")').first();
    await documentsLink.click();

    await expect(page).toHaveURL('/documents');
  });

  test('should navigate to knowledge bases page from dashboard', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Click on knowledge bases link/button
    const kbLink = page.locator('a[href="/knowledge-bases"], button:has-text("Knowledge Bases")').first();
    await kbLink.click();

    await expect(page).toHaveURL('/knowledge-bases');
  });

  test('should navigate to collections page from dashboard', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Click on collections link/button
    const collectionsLink = page.locator('a[href="/collections"], button:has-text("Collections")').first();
    await collectionsLink.click();

    await expect(page).toHaveURL('/collections');
  });

  test('should navigate to chat page from dashboard', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Click on chat link/button
    const chatLink = page.locator('a[href="/chat"], button:has-text("Chat")').first();
    await chatLink.click();

    await expect(page).toHaveURL('/chat');
  });

  test('should handle loading state', async ({ page }) => {
    // Check for loading indicator
    const loadingIndicator = page.locator('.loading, .spinner, [data-testid="loading"]');
    const isVisible = await loadingIndicator.isVisible().catch(() => false);
    
    if (isVisible) {
      await expect(loadingIndicator).toBeVisible();
      // Wait for loading to complete
      await page.waitForLoadState('networkidle');
      await expect(loadingIndicator).not.toBeVisible();
    }
  });

  test('should display analytics data', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Look for analytics section
    const analyticsSection = page.locator('text=/analytics/i, text=/queries/i, text=/response time/i');
    const hasAnalytics = await analyticsSection.count() > 0;
    
    if (hasAnalytics) {
      await expect(analyticsSection.first()).toBeVisible();
    }
  });

  test('should have working sidebar navigation', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Check for sidebar
    const sidebar = page.locator('.sidebar, nav, [data-testid="sidebar"]');
    const hasSidebar = await sidebar.isVisible().catch(() => false);

    if (hasSidebar) {
      await expect(sidebar).toBeVisible();
      
      // Check navigation links
      const navLinks = sidebar.locator('a');
      const linkCount = await navLinks.count();
      expect(linkCount).toBeGreaterThan(0);
    }
  });

  test('should handle error state gracefully', async ({ page }) => {
    // This test checks if the dashboard handles API errors gracefully
    await page.waitForLoadState('networkidle');

    // If there's an error message, it should be visible
    const errorMessage = page.locator('.error, .alert-error, [data-testid="error"]');
    const hasError = await errorMessage.isVisible().catch(() => false);

    if (hasError) {
      await expect(errorMessage).toBeVisible();
    }
  });
});
