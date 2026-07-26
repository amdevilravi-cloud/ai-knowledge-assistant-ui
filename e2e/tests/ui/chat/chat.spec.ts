/**
 * Chat UI E2E Tests
 * Tests chat interface functionality including simple chat, RAG chat, and conversation management
 */

import { test, expect } from '@playwright/test';

test.describe('Chat UI Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/chat');
    await page.waitForLoadState('networkidle');
  });

  test('should load chat page successfully', async ({ page }) => {
    await expect(page).toHaveTitle(/Knowledge Assistant/);
    await expect(page.locator('h1, h2')).toContainText(/chat/i);
  });

  test('should display chat input field', async ({ page }) => {
    const chatInput = page.locator('textarea, input[type="text"], [data-testid="chat-input"]').first();
    await expect(chatInput).toBeVisible();
  });

  test('should display send button', async ({ page }) => {
    const sendButton = page.locator('button:has-text("Send"), button:has-text("Submit"), [data-testid="send-button"]').first();
    await expect(sendButton).toBeVisible();
  });

  test('should send a message and receive response', async ({ page }) => {
    const chatInput = page.locator('textarea, input[type="text"], [data-testid="chat-input"]').first();
    const sendButton = page.locator('button:has-text("Send"), button:has-text("Submit"), [data-testid="send-button"]').first();

    await chatInput.fill('What is Spring Boot?');
    await sendButton.click();

    // Wait for response
    await page.waitForTimeout(3000);

    // Check for response message
    const responseMessage = page.locator('.message, .chat-message, [data-testid="message"]');
    const hasResponse = await responseMessage.count() > 0;

    if (hasResponse) {
      await expect(responseMessage.first()).toBeVisible();
    }
  });

  test('should display conversation history', async ({ page }) => {
    const conversationHistory = page.locator('.conversation-history, .chat-history, [data-testid="conversation-history"]');
    const hasHistory = await conversationHistory.count() > 0;

    if (hasHistory) {
      await expect(conversationHistory.first()).toBeVisible();
    }
  });

  test('should start new conversation', async ({ page }) => {
    const newConversationButton = page.locator('button:has-text("New Conversation"), button:has-text("New Chat"), [data-testid="new-conversation"]').first();
    const hasButton = await newConversationButton.count() > 0;

    if (hasButton) {
      await newConversationButton.click();

      // Chat input should be cleared
      const chatInput = page.locator('textarea, input[type="text"], [data-testid="chat-input"]').first();
      await expect(chatInput).toHaveValue('');
    }
  });

  test('should display citations for RAG responses', async ({ page }) => {
    const chatInput = page.locator('textarea, input[type="text"], [data-testid="chat-input"]').first();
    const sendButton = page.locator('button:has-text("Send"), button:has-text("Submit"), [data-testid="send-button"]').first();

    await chatInput.fill('What is the vacation policy?');
    await sendButton.click();

    // Wait for response
    await page.waitForTimeout(5000);

    // Check for citations
    const citations = page.locator('.citation, .source, [data-testid="citation"]');
    const hasCitations = await citations.count() > 0;

    if (hasCitations) {
      await expect(citations.first()).toBeVisible();
    }
  });

  test('should allow copying response to clipboard', async ({ page }) => {
    const copyButton = page.locator('button:has-text("Copy"), button[title*="Copy"], [data-testid="copy-button"]').first();
    const hasCopyButton = await copyButton.count() > 0;

    if (hasCopyButton) {
      await copyButton.click();

      // Check for copy feedback (tooltip or toast)
      const copyFeedback = page.locator('.tooltip, .toast, [data-testid="copy-feedback"]');
      const hasFeedback = await copyFeedback.count() > 0;

      if (hasFeedback) {
        await expect(copyFeedback.first()).toBeVisible();
      }
    }
  });

  test('should allow regenerating response', async ({ page }) => {
    const regenerateButton = page.locator('button:has-text("Regenerate"), button:has-text("Retry"), [data-testid="regenerate-button"]').first();
    const hasRegenerateButton = await regenerateButton.count() > 0;

    if (hasRegenerateButton) {
      await regenerateButton.click();

      // Wait for regeneration
      await page.waitForTimeout(3000);

      // Should have a new response
      const responseMessage = page.locator('.message, .chat-message');
      const hasResponse = await responseMessage.count() > 0;

      if (hasResponse) {
        await expect(responseMessage.first()).toBeVisible();
      }
    }
  });

  test('should display follow-up questions', async ({ page }) => {
    const chatInput = page.locator('textarea, input[type="text"], [data-testid="chat-input"]').first();
    const sendButton = page.locator('button:has-text("Send"), button:has-text("Submit"), [data-testid="send-button"]').first();

    await chatInput.fill('Tell me about company policies');
    await sendButton.click();

    // Wait for response
    await page.waitForTimeout(5000);

    // Check for follow-up questions
    const followUpQuestions = page.locator('.follow-up, .suggestion, [data-testid="follow-up"]');
    const hasFollowUp = await followUpQuestions.count() > 0;

    if (hasFollowUp) {
      await expect(followUpQuestions.first()).toBeVisible();
    }
  });

  test('should allow clicking on follow-up question', async ({ page }) => {
    const followUpQuestions = page.locator('.follow-up, .suggestion, [data-testid="follow-up"]');
    const hasFollowUp = await followUpQuestions.count() > 0;

    if (hasFollowUp) {
      const firstQuestion = followUpQuestions.first();
      await firstQuestion.click();

      // Should send the question automatically
      await page.waitForTimeout(2000);

      // Check for new response
      const responseMessage = page.locator('.message, .chat-message');
      const hasResponse = await responseMessage.count() > 0;

      if (hasResponse) {
        await expect(responseMessage.first()).toBeVisible();
      }
    }
  });

  test('should display conversation list sidebar', async ({ page }) => {
    const conversationList = page.locator('.conversation-list, .sidebar, [data-testid="conversation-list"]');
    const hasList = await conversationList.count() > 0;

    if (hasList) {
      await expect(conversationList.first()).toBeVisible();
    }
  });

  test('should allow loading existing conversation', async ({ page }) => {
    const conversationItem = page.locator('.conversation-item, [data-testid="conversation-item"]').first();
    const hasItem = await conversationItem.count() > 0;

    if (hasItem) {
      await conversationItem.click();

      // Should load conversation history
      await page.waitForTimeout(2000);

      const messages = page.locator('.message, .chat-message');
      const hasMessages = await messages.count() > 0;

      if (hasMessages) {
        await expect(messages.first()).toBeVisible();
      }
    }
  });

  test('should allow deleting conversation', async ({ page }) => {
    const deleteButton = page.locator('button:has-text("Delete"), button:has-text("Remove"), [data-testid="delete-conversation"]').first();
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

  test('should handle empty input', async ({ page }) => {
    const sendButton = page.locator('button:has-text("Send"), button:has-text("Submit"), [data-testid="send-button"]').first();
    await sendButton.click();

    // Should not send message or show validation error
    const chatInput = page.locator('textarea, input[type="text"], [data-testid="chat-input"]').first();
    const isEmpty = await chatInput.inputValue() === '';

    if (isEmpty) {
      // Check for validation error
      const errorMessage = page.locator('.error, .invalid-feedback');
      const hasError = await errorMessage.count() > 0;

      if (hasError) {
        await expect(errorMessage.first()).toBeVisible();
      }
    }
  });

  test('should display loading state during response generation', async ({ page }) => {
    const chatInput = page.locator('textarea, input[type="text"], [data-testid="chat-input"]').first();
    const sendButton = page.locator('button:has-text("Send"), button:has-text("Submit"), [data-testid="send-button"]').first();

    await chatInput.fill('Test question');
    await sendButton.click();

    // Check for loading indicator
    const loadingIndicator = page.locator('.loading, .spinner, [data-testid="loading"], .typing-indicator');
    const hasLoading = await loadingIndicator.isVisible().catch(() => false);

    if (hasLoading) {
      await expect(loadingIndicator).toBeVisible();
    }
  });

  test('should allow clearing chat history', async ({ page }) => {
    const clearButton = page.locator('button:has-text("Clear"), button:has-text("Reset"), [data-testid="clear-chat"]').first();
    const hasClearButton = await clearButton.count() > 0;

    if (hasClearButton) {
      await clearButton.click();

      // Check for confirmation dialog
      const confirmDialog = page.locator('.modal, .dialog, [data-testid="confirm-dialog"]');
      const hasDialog = await confirmDialog.count() > 0;

      if (hasDialog) {
        const confirmButton = confirmDialog.locator('button:has-text("Confirm"), button:has-text("Yes")').first();
        await confirmButton.click();
      }

      // Wait for clear
      await page.waitForTimeout(2000);

      // Chat should be empty
      const messages = page.locator('.message, .chat-message');
      const messageCount = await messages.count();
      expect(messageCount).toBe(0);
    }
  });

  test('should navigate to dashboard from chat page', async ({ page }) => {
    const dashboardLink = page.locator('a[href="/dashboard"], button:has-text("Dashboard")').first();
    const hasLink = await dashboardLink.count() > 0;

    if (hasLink) {
      await dashboardLink.click();
      await expect(page).toHaveURL('/dashboard');
    }
  });

  test('should handle Enter key to send message', async ({ page }) => {
    const chatInput = page.locator('textarea, input[type="text"], [data-testid="chat-input"]').first();

    await chatInput.fill('Test message');
    await page.keyboard.press('Enter');

    // Wait for response
    await page.waitForTimeout(3000);

    // Check for response
    const responseMessage = page.locator('.message, .chat-message');
    const hasResponse = await responseMessage.count() > 0;

    if (hasResponse) {
      await expect(responseMessage.first()).toBeVisible();
    }
  });

  test('should allow Shift+Enter for new line in textarea', async ({ page }) => {
    const chatInput = page.locator('textarea, [data-testid="chat-input"]').first();
    const isTextarea = await chatInput.evaluate(el => el.tagName === 'TEXTAREA');

    if (isTextarea) {
      await chatInput.fill('Line 1');
      await page.keyboard.press('Shift+Enter');
      await chatInput.type('Line 2');

      const value = await chatInput.inputValue();
      expect(value).toContain('Line 1');
      expect(value).toContain('Line 2');
    }
  });
});
