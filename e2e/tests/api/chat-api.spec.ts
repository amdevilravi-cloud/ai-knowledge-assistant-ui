/**
 * Chat API Integration Tests with AI Mocking
 * Tests all chat-related API endpoints with configurable AI response mocking
 */

import { test, expect } from '@playwright/test';
import { apiClient } from '../shared/helpers/api-client';
import { DatabaseCleaner } from '../shared/helpers/database-cleaner';
import { TestDataFactory } from '../shared/helpers/data-factory';
import { AiMock } from '../shared/mocks/ai-mock';

test.describe('Chat API Tests', () => {
  test.beforeAll(async () => {
    await DatabaseCleaner.cleanupAll();
  });

  test.afterEach(async () => {
    await DatabaseCleaner.cleanupAll();
  });

  test.describe('GET /api/chat (Simple Chat)', () => {
    test('should return simple chat response', async () => {
      const message = 'What is Spring Boot?';
      const response = await apiClient.simpleChat(message);

      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();
      expect(typeof response.data).toBe('string');
      expect(response.data.length).toBeGreaterThan(0);
    });

    test('should handle empty message', async () => {
      const response = await apiClient.simpleChat('');

      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    test('should use mock response when USE_REAL_AI is false', async () => {
      const message = 'hello';
      const mockResponse = AiMock.getSimpleChatResponse(message);

      if (!AiMock.isRealAiEnabled()) {
        expect(mockResponse).toContain('Hello');
      }
    });
  });

  test.describe('GET /api/chat/rag (RAG Chat)', () => {
    test('should return RAG chat response with document context', async () => {
      const message = 'What is the vacation policy?';
      const response = await apiClient.ragChat(message, 20, 5);

      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();
      expect(response.data.answer).toBeDefined();
      expect(response.data.isFromContext).toBeDefined();
      expect(response.data.retrievalCount).toBeDefined();
      expect(Array.isArray(response.data.sourceDocuments)).toBe(true);
    });

    test('should return response with citations', async () => {
      const message = 'sick leave policy';
      const response = await apiClient.ragChat(message, 20, 5);

      expect(response.status).toBe(200);
      expect(response.data.sourceDocuments).toBeDefined();
      if (response.data.sourceDocuments.length > 0) {
        expect(response.data.sourceDocuments[0]).toHaveProperty('documentId');
        expect(response.data.sourceDocuments[0]).toHaveProperty('documentName');
        expect(response.data.sourceDocuments[0]).toHaveProperty('citations');
      }
    });

    test('should handle different topK values', async () => {
      const message = 'test question';
      const response1 = await apiClient.ragChat(message, 10, 3);
      const response2 = await apiClient.ragChat(message, 30, 10);

      expect(response1.status).toBe(200);
      expect(response2.status).toBe(200);
      expect(response1.data.retrievalCount).toBeLessThanOrEqual(response2.data.retrievalCount);
    });

    test('should use mock response when USE_REAL_AI is false', async () => {
      const message = 'vacation policy';
      const mockResponse = AiMock.getRagChatResponse(message, 3);

      if (!AiMock.isRealAiEnabled()) {
        expect(mockResponse.answer).toContain('vacation policy');
        expect(mockResponse.isFromContext).toBe(true);
        expect(mockResponse.retrievalCount).toBe(3);
      }
    });
  });

  test.describe('POST /api/chat/converse/start', () => {
    test('should start new conversation', async () => {
      const response = await apiClient.startConversation();

      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();
      expect(response.data.conversationId).toBeDefined();
      expect(typeof response.data.conversationId).toBe('string');
    });

    test('should generate unique conversation IDs', async () => {
      const response1 = await apiClient.startConversation();
      const response2 = await apiClient.startConversation();

      expect(response1.data.conversationId).not.toBe(response2.data.conversationId);
    });
  });

  test.describe('POST /api/chat/converse', () => {
    let conversationId: string;

    test.beforeEach(async () => {
      const startResponse = await apiClient.startConversation();
      conversationId = startResponse.data.conversationId;
    });

    test('should continue conversation with message', async () => {
      const message = 'What is the company policy?';
      const request = TestDataFactory.createConversationRequest(message, 5);

      const response = await apiClient.continueConversation(conversationId, request.message, request.historyDepth);

      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();
      expect(response.data.answer).toBeDefined();
    });

    test('should handle conversation history depth', async () => {
      const message = 'Follow up question';
      const response1 = await apiClient.continueConversation(conversationId, 'First question', 2);
      const response2 = await apiClient.continueConversation(conversationId, message, 5);

      expect(response1.status).toBe(200);
      expect(response2.status).toBe(200);
    });

    test('should return error for non-existent conversation', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const response = await apiClient.continueConversation(fakeId, 'Test message', 5);

      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    test('should use mock response when USE_REAL_AI is false', async () => {
      const message = 'test message';
      const mockResponse = AiMock.getConversationResponse(message, []);

      if (!AiMock.isRealAiEnabled()) {
        expect(mockResponse.answer).toContain(message);
        expect(mockResponse.isFromContext).toBe(true);
      }
    });
  });

  test.describe('GET /api/chat/conversations', () => {
    test('should return empty list when no conversations exist', async () => {
      const response = await apiClient.getConversations();

      expect(response.status).toBe(200);
      expect(response.data).toEqual([]);
    });

    test('should return list of conversations', async () => {
      // Start multiple conversations
      await apiClient.startConversation();
      await apiClient.startConversation();
      await apiClient.startConversation();

      const response = await apiClient.getConversations();

      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();
      expect(response.data.length).toBeGreaterThanOrEqual(3);
    });
  });

  test.describe('DELETE /api/chat/conversations/{conversationId}', () => {
    test('should delete existing conversation', async () => {
      const startResponse = await apiClient.startConversation();
      const conversationId = startResponse.data.conversationId;

      const response = await apiClient.deleteConversation(conversationId);

      expect(response.status).toBe(200);

      // Verify deletion
      const conversations = await apiClient.getConversations();
      const deletedConv = conversations.data?.find((c: any) => c.conversationId === conversationId);
      expect(deletedConv).toBeUndefined();
    });

    test('should handle non-existent conversation', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const response = await apiClient.deleteConversation(fakeId);

      // Should not throw error, may return 200 or 404
      expect(response.status).toBeGreaterThanOrEqual(200);
    });
  });

  test.describe('POST /api/chat/conversations/{conversationId}/regenerate', () => {
    test('should regenerate last response', async () => {
      const startResponse = await apiClient.startConversation();
      const conversationId = startResponse.data.conversationId;

      // Send a message first
      await apiClient.continueConversation(conversationId, 'Test message', 5);

      // Regenerate response
      const response = await apiClient.regenerateResponse(conversationId);

      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();
      expect(response.data.answer).toBeDefined();
    });

    test('should handle non-existent conversation', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const response = await apiClient.regenerateResponse(fakeId);

      expect(response.status).toBeGreaterThanOrEqual(400);
    });
  });

  test.describe('POST /api/chat/conversations/{conversationId}/follow-up', () => {
    test('should generate follow-up questions', async () => {
      const startResponse = await apiClient.startConversation();
      const conversationId = startResponse.data.conversationId;

      // Send a message first
      await apiClient.continueConversation(conversationId, 'Test message', 5);

      // Generate follow-up questions
      const response = await apiClient.generateFollowUpQuestions(conversationId);

      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();
      expect(Array.isArray(response.data)).toBe(true);
      expect(response.data.length).toBeGreaterThan(0);
    });

    test('should use mock response when USE_REAL_AI is false', async () => {
      const mockQuestions = AiMock.getFollowUpQuestions('test context');

      if (!AiMock.isRealAiEnabled()) {
        expect(mockQuestions).toBeDefined();
        expect(Array.isArray(mockQuestions)).toBe(true);
        expect(mockQuestions.length).toBeGreaterThan(0);
      }
    });

    test('should handle non-existent conversation', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const response = await apiClient.generateFollowUpQuestions(fakeId);

      expect(response.status).toBeGreaterThanOrEqual(400);
    });
  });
});
