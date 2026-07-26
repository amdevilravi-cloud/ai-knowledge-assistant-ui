/**
 * Document API Integration Tests
 * Tests all document-related API endpoints
 */

import { test, expect } from '@playwright/test';
import { apiClient } from '../shared/helpers/api-client';
import { DatabaseCleaner } from '../shared/helpers/database-cleaner';
import { TestDataFactory } from '../shared/helpers/data-factory';

test.describe('Document API Tests', () => {
  test.beforeAll(async () => {
    // Clean up any existing test data
    await DatabaseCleaner.cleanupAll();
  });

  test.afterEach(async () => {
    // Clean up after each test
    await DatabaseCleaner.cleanupAll();
  });

  test.describe('POST /api/documents/upload', () => {
    test('should upload a valid TXT file successfully', async () => {
      const textContent = 'This is a test document for E2E testing.\nIt contains multiple paragraphs.\nThe vacation policy allows 20 days of paid leave per year.';
      const file = new File([textContent], 'sample.txt', { type: 'text/plain' });

      const response = await apiClient.uploadDocument(file);

      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();
      expect(response.data.uploadSuccess).toBe(true);
      expect(response.data.documentName).toBe('sample.txt');
      expect(response.data.chunks).toBeGreaterThan(0);
    });

    test('should upload a valid PDF file successfully', async () => {
      // Create a minimal PDF file for testing
      const pdfContent = '%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n>>\nendobj\nxref\n0 4\n0000000000 65535 f\n0000000009 00000 n\n0000000058 00000 n\n0000000115 00000 n\ntrailer\n<<\n/Size 4\n/Root 1 0 R\n>>\nstartxref\n172\n%%EOF';
      const file = new File([pdfContent], 'test.pdf', { type: 'application/pdf' });

      const response = await apiClient.uploadDocument(file);

      expect(response.status).toBe(200);
      expect(response.data.uploadSuccess).toBe(true);
      expect(response.data.documentName).toBe('test.pdf');
    });

    test('should reject empty file', async () => {
      const emptyFile = new File([], 'empty.txt', { type: 'text/plain' });

      const response = await apiClient.uploadDocument(emptyFile);

      expect(response.status).toBe(400);
      expect(response.data.uploadSuccess).toBe(false);
    });

    test('should reject invalid file type', async () => {
      const invalidFile = new File(['test'], 'test.exe', { type: 'application/x-msdownload' });

      const response = await apiClient.uploadDocument(invalidFile);

      expect(response.status).toBe(400);
    });
  });

  test.describe('GET /api/documents', () => {
    test('should return empty list when no documents exist', async () => {
      const response = await apiClient.getDocuments();

      expect(response.status).toBe(200);
      expect(response.data).toEqual([]);
    });

    test('should return list of documents when documents exist', async () => {
      // Upload a document first
      const textContent = 'This is a test document for E2E testing.';
      const file = new File([textContent], 'sample.txt', { type: 'text/plain' });
      await apiClient.uploadDocument(file);

      // Get documents
      const response = await apiClient.getDocuments();

      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();
      expect(response.data.length).toBeGreaterThan(0);
      expect(response.data[0]).toHaveProperty('documentId');
      expect(response.data[0]).toHaveProperty('documentName');
      expect(response.data[0]).toHaveProperty('fileSize');
    });
  });

  test.describe('DELETE /api/documents/{id}', () => {
    test('should delete existing document successfully', async () => {
      // Upload a document first
      const textContent = 'This is a test document for E2E testing.';
      const file = new File([textContent], 'sample.txt', { type: 'text/plain' });
      const uploadResponse = await apiClient.uploadDocument(file);
      const documentId = uploadResponse.data.documentId;

      // Delete the document
      const response = await apiClient.deleteDocument(documentId);

      expect(response.status).toBe(200);
      expect(response.data.status).toBe('deleted');
      expect(response.data.documentId).toBe(documentId);

      // Verify document is deleted
      const getResponse = await apiClient.getDocuments();
      const deletedDoc = getResponse.data?.find((doc: any) => doc.documentId === documentId);
      expect(deletedDoc).toBeUndefined();
    });

    test('should return error when deleting non-existent document', async () => {
      const fakeId = 'non-existent-id';
      const response = await apiClient.deleteDocument(fakeId);

      expect(response.status).toBe(500);
    });
  });

  test.describe('POST /api/documents/{id}/reindex', () => {
    test('should re-index existing document successfully', async () => {
      // Upload a document first
      const textContent = 'This is a test document for E2E testing.';
      const file = new File([textContent], 'sample.txt', { type: 'text/plain' });
      const uploadResponse = await apiClient.uploadDocument(file);
      const documentId = uploadResponse.data.documentId;

      // Re-index the document
      const response = await apiClient.reindexDocument(documentId);

      expect(response.status).toBe(200);
      expect(response.data.status).toBe('reindexing');
      expect(response.data.documentId).toBe(documentId);
    });

    test('should return error when re-indexing non-existent document', async () => {
      const fakeId = 'non-existent-id';
      const response = await apiClient.reindexDocument(fakeId);

      expect(response.status).toBe(500);
    });
  });

  test.describe('GET /api/documents/{id}/metadata', () => {
    test('should return metadata for existing document', async () => {
      // Upload a document first
      const textContent = 'This is a test document for E2E testing.';
      const file = new File([textContent], 'sample.txt', { type: 'text/plain' });
      const uploadResponse = await apiClient.uploadDocument(file);
      const documentId = uploadResponse.data.documentId;

      // Get metadata
      const response = await apiClient.getDocumentMetadata(documentId);

      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();
      expect(response.data).toHaveProperty('documentId');
      expect(response.data).toHaveProperty('documentName');
      expect(response.data).toHaveProperty('fileSize');
    });

    test('should return error for non-existent document', async () => {
      const fakeId = 'non-existent-id';
      const response = await apiClient.getDocumentMetadata(fakeId);

      expect(response.status).toBe(500);
    });
  });
});
