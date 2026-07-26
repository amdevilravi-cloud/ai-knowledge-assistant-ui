/**
 * Database Cleaner Helper
 * Provides utilities to clean up test data after tests
 */

import { apiClient } from './api-client';

export class DatabaseCleaner {
  /**
   * Clean up all test data
   * This should be called after each test suite
   */
  static async cleanupAll() {
    try {
      // Delete all conversations
      const conversations = await apiClient.getConversations();
      if (conversations.data) {
        for (const conv of conversations.data) {
          await apiClient.deleteConversation(conv.conversationId);
        }
      }

      // Delete all documents
      const documents = await apiClient.getDocuments();
      if (documents.data) {
        for (const doc of documents.data) {
          await apiClient.deleteDocument(doc.documentId);
        }
      }

      // Delete all collections
      const collections = await apiClient.getCollections();
      if (collections.data) {
        for (const coll of collections.data) {
          await apiClient.deleteCollection(coll.id);
        }
      }

      // Delete all knowledge bases
      const knowledgeBases = await apiClient.getKnowledgeBases();
      if (knowledgeBases.data) {
        for (const kb of knowledgeBases.data) {
          await apiClient.deleteKnowledgeBase(kb.id);
        }
      }
    } catch (error) {
      console.error('Error during database cleanup:', error);
    }
  }

  /**
   * Clean up specific document
   */
  static async cleanupDocument(documentId: string) {
    try {
      await apiClient.deleteDocument(documentId);
    } catch (error) {
      console.error(`Error cleaning up document ${documentId}:`, error);
    }
  }

  /**
   * Clean up specific knowledge base
   */
  static async cleanupKnowledgeBase(knowledgeBaseId: string) {
    try {
      // First delete all collections in the knowledge base
      const collections = await apiClient.getCollectionsByKnowledgeBase(knowledgeBaseId);
      if (collections.data) {
        for (const coll of collections.data) {
          await apiClient.deleteCollection(coll.id);
        }
      }
      // Then delete the knowledge base
      await apiClient.deleteKnowledgeBase(knowledgeBaseId);
    } catch (error) {
      console.error(`Error cleaning up knowledge base ${knowledgeBaseId}:`, error);
    }
  }

  /**
   * Clean up specific collection
   */
  static async cleanupCollection(collectionId: string) {
    try {
      await apiClient.deleteCollection(collectionId);
    } catch (error) {
      console.error(`Error cleaning up collection ${collectionId}:`, error);
    }
  }

  /**
   * Clean up specific conversation
   */
  static async cleanupConversation(conversationId: string) {
    try {
      await apiClient.deleteConversation(conversationId);
    } catch (error) {
      console.error(`Error cleaning up conversation ${conversationId}:`, error);
    }
  }
}
