/**
 * Data Factory for generating test data
 */

export class TestDataFactory {
  // Knowledge Base Data
  static createKnowledgeBaseData(overrides?: Partial<{ name: string; description: string }>) {
    return {
      name: overrides?.name || `Test Knowledge Base ${Date.now()}`,
      description: overrides?.description || 'Test knowledge base for E2E testing',
    };
  }

  // Collection Data
  static createCollectionData(knowledgeBaseId: string, overrides?: Partial<{ name: string; description: string }>) {
    return {
      knowledgeBaseId,
      name: overrides?.name || `Test Collection ${Date.now()}`,
      description: overrides?.description || 'Test collection for E2E testing',
    };
  }

  // Chat Data
  static createChatMessage(overrides?: Partial<{ message: string }>) {
    return {
      message: overrides?.message || 'What is the test question?',
    };
  }

  static createConversationRequest(message: string, historyDepth: number = 5) {
    return {
      message,
      historyDepth,
    };
  }

  // Document Data
  static createDocumentMetadata(overrides?: Partial<any>) {
    return {
      documentId: overrides?.documentId || `doc-${Date.now()}`,
      documentName: overrides?.documentName || 'test-document.pdf',
      fileName: overrides?.fileName || 'test-document.pdf',
      fileSize: overrides?.fileSize || 1024,
      uploadedAt: overrides?.uploadedAt || new Date().toISOString(),
      pages: overrides?.pages || 1,
      characters: overrides?.characters || 100,
      chunks: overrides?.chunks || 5,
      uploadSuccess: true,
      ...overrides,
    };
  }

  // Chat Response Data
  static createChatResponse(overrides?: Partial<any>) {
    return {
      answer: overrides?.answer || 'This is a test response',
      isFromContext: overrides?.isFromContext ?? true,
      retrievalCount: overrides?.retrievalCount || 3,
      sourceDocuments: overrides?.sourceDocuments || [],
      ...overrides,
    };
  }

  // Citation Data
  static createCitation(overrides?: Partial<any>) {
    return {
      documentName: overrides?.documentName || 'test-document.pdf',
      documentId: overrides?.documentId || 'doc-123',
      pageNumber: overrides?.pageNumber || 1,
      chunkIndex: overrides?.chunkIndex || 0,
      relevanceScore: overrides?.relevanceScore || 0.95,
      content: overrides?.content || 'Test content chunk',
      chunkHash: overrides?.chunkHash || 'hash-123',
      documentHash: overrides?.documentHash || 'doc-hash-123',
      embeddingModel: overrides?.embeddingModel || 'text-embedding-ada-002',
      embeddingDimension: overrides?.embeddingDimension || 1536,
      language: overrides?.language || 'en',
      version: overrides?.version || 1,
      updatedAt: overrides?.updatedAt || new Date().toISOString(),
      ...overrides,
    };
  }
}
