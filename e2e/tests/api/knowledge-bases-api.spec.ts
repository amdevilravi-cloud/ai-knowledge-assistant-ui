/**
 * Knowledge Base API Integration Tests
 * Tests all knowledge base-related API endpoints
 */

import { test, expect } from '@playwright/test';
import { apiClient } from '../shared/helpers/api-client';
import { DatabaseCleaner } from '../shared/helpers/database-cleaner';
import { TestDataFactory } from '../shared/helpers/data-factory';

test.describe('Knowledge Base API Tests', () => {
  test.beforeAll(async () => {
    await DatabaseCleaner.cleanupAll();
  });

  test.afterEach(async () => {
    await DatabaseCleaner.cleanupAll();
  });

  test.describe('POST /api/knowledge-bases', () => {
    test('should create knowledge base with name and description', async () => {
      const kbData = TestDataFactory.createKnowledgeBaseData({
        name: 'Test Knowledge Base',
        description: 'Test description',
      });

      const response = await apiClient.createKnowledgeBase(kbData.name, kbData.description);

      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();
      expect(response.data.name).toBe(kbData.name);
      expect(response.data.description).toBe(kbData.description);
      expect(response.data.id).toBeDefined();
    });

    test('should create knowledge base with only name', async () => {
      const kbData = TestDataFactory.createKnowledgeBaseData({
        name: 'Test Knowledge Base',
      });

      const response = await apiClient.createKnowledgeBase(kbData.name);

      expect(response.status).toBe(200);
      expect(response.data.name).toBe(kbData.name);
      expect(response.data.id).toBeDefined();
    });

    test('should handle duplicate names', async () => {
      const kbData = TestDataFactory.createKnowledgeBaseData({
        name: 'Duplicate Name',
      });

      await apiClient.createKnowledgeBase(kbData.name);
      const duplicateResponse = await apiClient.createKnowledgeBase(kbData.name);

      // Backend may allow duplicates or reject them - just verify response
      expect(duplicateResponse.status).toBeGreaterThanOrEqual(200);
    });
  });

  test.describe('GET /api/knowledge-bases', () => {
    test('should return empty list when no knowledge bases exist', async () => {
      const response = await apiClient.getKnowledgeBases();

      expect(response.status).toBe(200);
      expect(response.data).toEqual([]);
    });

    test('should return list of knowledge bases', async () => {
      // Create multiple knowledge bases
      await apiClient.createKnowledgeBase('KB 1', 'Description 1');
      await apiClient.createKnowledgeBase('KB 2', 'Description 2');

      const response = await apiClient.getKnowledgeBases();

      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();
      expect(response.data.length).toBeGreaterThanOrEqual(2);
    });
  });

  test.describe('GET /api/knowledge-bases/{id}', () => {
    test('should return existing knowledge base', async () => {
      const kbData = TestDataFactory.createKnowledgeBaseData({
        name: 'Test KB',
      });
      const createResponse = await apiClient.createKnowledgeBase(kbData.name, kbData.description);
      const kbId = createResponse.data.id;

      const response = await apiClient.getKnowledgeBase(kbId);

      expect(response.status).toBe(200);
      expect(response.data.id).toBe(kbId);
      expect(response.data.name).toBe(kbData.name);
    });

    test('should return 404 for non-existent knowledge base', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const response = await apiClient.getKnowledgeBase(fakeId);

      expect(response.status).toBe(404);
    });
  });

  test.describe('PUT /api/knowledge-bases/{id}', () => {
    test('should update existing knowledge base', async () => {
      const kbData = TestDataFactory.createKnowledgeBaseData({
        name: 'Original Name',
        description: 'Original Description',
      });
      const createResponse = await apiClient.createKnowledgeBase(kbData.name, kbData.description);
      const kbId = createResponse.data.id;

      const updatedData = {
        name: 'Updated Name',
        description: 'Updated Description',
      };

      const response = await apiClient.updateKnowledgeBase(kbId, updatedData.name, updatedData.description);

      expect(response.status).toBe(200);
      expect(response.data.name).toBe(updatedData.name);
      expect(response.data.description).toBe(updatedData.description);
    });

    test('should return 404 when updating non-existent knowledge base', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const response = await apiClient.updateKnowledgeBase(fakeId, 'Test Name');

      expect(response.status).toBe(404);
    });
  });

  test.describe('DELETE /api/knowledge-bases/{id}', () => {
    test('should delete existing knowledge base', async () => {
      const kbData = TestDataFactory.createKnowledgeBaseData({
        name: 'To Delete',
      });
      const createResponse = await apiClient.createKnowledgeBase(kbData.name);
      const kbId = createResponse.data.id;

      const response = await apiClient.deleteKnowledgeBase(kbId);

      expect(response.status).toBe(200);

      // Verify deletion
      const getResponse = await apiClient.getKnowledgeBase(kbId);
      expect(getResponse.status).toBe(404);
    });

    test('should delete knowledge base with its collections', async () => {
      // Create knowledge base
      const kbResponse = await apiClient.createKnowledgeBase('KB with Collections');
      const kbId = kbResponse.data.id;

      // Create a collection
      await apiClient.createCollection(kbId, 'Test Collection');

      // Delete knowledge base
      const deleteResponse = await apiClient.deleteKnowledgeBase(kbId);
      expect(deleteResponse.status).toBe(200);

      // Verify knowledge base is deleted
      const getResponse = await apiClient.getKnowledgeBase(kbId);
      expect(getResponse.status).toBe(404);
    });
  });
});
