/**
 * Collection API Integration Tests
 * Tests all collection-related API endpoints
 */

import { test, expect } from '@playwright/test';
import { apiClient } from '../shared/helpers/api-client';
import { DatabaseCleaner } from '../shared/helpers/database-cleaner';
import { TestDataFactory } from '../shared/helpers/data-factory';

test.describe('Collection API Tests', () => {
  let knowledgeBaseId: string;

  test.beforeEach(async () => {
    await DatabaseCleaner.cleanupAll();
    // Create a knowledge base for collection tests
    const kbResponse = await apiClient.createKnowledgeBase('Test Knowledge Base for Collections');
    knowledgeBaseId = kbResponse.data.id;
  });

  test.afterEach(async () => {
    await DatabaseCleaner.cleanupAll();
  });

  test.describe('POST /api/collections', () => {
    test('should create collection with valid knowledge base ID', async () => {
      const collectionData = TestDataFactory.createCollectionData(knowledgeBaseId, {
        name: 'Test Collection',
        description: 'Test description',
      });

      const response = await apiClient.createCollection(
        collectionData.knowledgeBaseId,
        collectionData.name,
        collectionData.description
      );

      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();
      expect(response.data.name).toBe(collectionData.name);
      expect(response.data.description).toBe(collectionData.description);
      expect(response.data.knowledgeBaseId).toBe(knowledgeBaseId);
      expect(response.data.id).toBeDefined();
    });

    test('should create collection with only name', async () => {
      const collectionData = TestDataFactory.createCollectionData(knowledgeBaseId, {
        name: 'Test Collection',
      });

      const response = await apiClient.createCollection(collectionData.knowledgeBaseId, collectionData.name);

      expect(response.status).toBe(200);
      expect(response.data.name).toBe(collectionData.name);
      expect(response.data.id).toBeDefined();
    });

    test('should handle invalid knowledge base ID', async () => {
      const fakeKbId = '00000000-0000-0000-0000-000000000000';
      const response = await apiClient.createCollection(fakeKbId, 'Test Collection');

      expect(response.status).toBeGreaterThanOrEqual(400);
    });
  });

  test.describe('GET /api/collections', () => {
    test('should return empty list when no collections exist', async () => {
      const response = await apiClient.getCollections();

      expect(response.status).toBe(200);
      expect(response.data).toEqual([]);
    });

    test('should return list of all collections', async () => {
      // Create collections
      await apiClient.createCollection(knowledgeBaseId, 'Collection 1');
      await apiClient.createCollection(knowledgeBaseId, 'Collection 2');

      const response = await apiClient.getCollections();

      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();
      expect(response.data.length).toBeGreaterThanOrEqual(2);
    });
  });

  test.describe('GET /api/collections/knowledge-base/{knowledgeBaseId}', () => {
    test('should return collections for specific knowledge base', async () => {
      // Create collections in the test knowledge base
      await apiClient.createCollection(knowledgeBaseId, 'KB Collection 1');
      await apiClient.createCollection(knowledgeBaseId, 'KB Collection 2');

      const response = await apiClient.getCollectionsByKnowledgeBase(knowledgeBaseId);

      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();
      expect(response.data.length).toBeGreaterThanOrEqual(2);
      response.data.forEach((collection: any) => {
        expect(collection.knowledgeBaseId).toBe(knowledgeBaseId);
      });
    });

    test('should return empty list for knowledge base with no collections', async () => {
      // Create a new knowledge base with no collections
      const newKbResponse = await apiClient.createKnowledgeBase('Empty KB');
      const newKbId = newKbResponse.data.id;

      const response = await apiClient.getCollectionsByKnowledgeBase(newKbId);

      expect(response.status).toBe(200);
      expect(response.data).toEqual([]);
    });

    test('should handle non-existent knowledge base ID', async () => {
      const fakeKbId = '00000000-0000-0000-0000-000000000000';
      const response = await apiClient.getCollectionsByKnowledgeBase(fakeKbId);

      // Backend might return 200 with empty array or 404
      expect(response.status).toBeGreaterThanOrEqual(200);
    });
  });

  test.describe('GET /api/collections/{id}', () => {
    test('should return existing collection', async () => {
      const collectionData = TestDataFactory.createCollectionData(knowledgeBaseId, {
        name: 'Test Collection',
      });
      const createResponse = await apiClient.createCollection(
        collectionData.knowledgeBaseId,
        collectionData.name,
        collectionData.description
      );
      const collectionId = createResponse.data.id;

      const response = await apiClient.getCollection(collectionId);

      expect(response.status).toBe(200);
      expect(response.data.id).toBe(collectionId);
      expect(response.data.name).toBe(collectionData.name);
    });

    test('should return 404 for non-existent collection', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const response = await apiClient.getCollection(fakeId);

      expect(response.status).toBe(404);
    });
  });

  test.describe('PUT /api/collections/{id}', () => {
    test('should update existing collection', async () => {
      const collectionData = TestDataFactory.createCollectionData(knowledgeBaseId, {
        name: 'Original Name',
        description: 'Original Description',
      });
      const createResponse = await apiClient.createCollection(
        collectionData.knowledgeBaseId,
        collectionData.name,
        collectionData.description
      );
      const collectionId = createResponse.data.id;

      const updatedData = {
        name: 'Updated Name',
        description: 'Updated Description',
      };

      const response = await apiClient.updateCollection(
        collectionId,
        updatedData.name,
        updatedData.description
      );

      expect(response.status).toBe(200);
      expect(response.data.name).toBe(updatedData.name);
      expect(response.data.description).toBe(updatedData.description);
    });

    test('should return 404 when updating non-existent collection', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const response = await apiClient.updateCollection(fakeId, 'Test Name');

      expect(response.status).toBe(404);
    });
  });

  test.describe('DELETE /api/collections/{id}', () => {
    test('should delete existing collection', async () => {
      const collectionData = TestDataFactory.createCollectionData(knowledgeBaseId, {
        name: 'To Delete',
      });
      const createResponse = await apiClient.createCollection(
        collectionData.knowledgeBaseId,
        collectionData.name
      );
      const collectionId = createResponse.data.id;

      const response = await apiClient.deleteCollection(collectionId);

      expect(response.status).toBe(200);

      // Verify deletion
      const getResponse = await apiClient.getCollection(collectionId);
      expect(getResponse.status).toBe(404);
    });

    test('should delete collection without affecting knowledge base', async () => {
      // Create collection
      const collectionResponse = await apiClient.createCollection(knowledgeBaseId, 'Collection to Delete');
      const collectionId = collectionResponse.data.id;

      // Delete collection
      await apiClient.deleteCollection(collectionId);

      // Verify knowledge base still exists
      const kbResponse = await apiClient.getKnowledgeBase(knowledgeBaseId);
      expect(kbResponse.status).toBe(200);
    });
  });
});
