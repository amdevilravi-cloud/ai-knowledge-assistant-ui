/**
 * API Client Helper for Backend Integration Tests
 * Provides typed methods for calling backend API endpoints
 */

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8080';

interface ApiResponse<T> {
  data?: T;
  status: number;
  statusText: string;
  error?: string;
}

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json().catch(() => null);

    return {
      data,
      status: response.status,
      statusText: response.statusText,
      error: !response.ok ? data?.error || response.statusText : undefined,
    };
  }

  // Document API Methods
  async uploadDocument(file: File): Promise<ApiResponse<any>> {
    const formData = new FormData();
    formData.append('file', file);
    
    return this.request('/api/documents/upload', {
      method: 'POST',
      headers: {}, // Let browser set Content-Type for FormData
      body: formData,
    });
  }

  async getDocuments(): Promise<ApiResponse<any[]>> {
    return this.request('/api/documents');
  }

  async deleteDocument(documentId: string): Promise<ApiResponse<any>> {
    return this.request(`/api/documents/${documentId}`, {
      method: 'DELETE',
    });
  }

  async reindexDocument(documentId: string): Promise<ApiResponse<any>> {
    return this.request(`/api/documents/${documentId}/reindex`, {
      method: 'POST',
    });
  }

  async getDocumentMetadata(documentId: string): Promise<ApiResponse<any>> {
    return this.request(`/api/documents/${documentId}/metadata`);
  }

  // Knowledge Base API Methods
  async createKnowledgeBase(name: string, description?: string): Promise<ApiResponse<any>> {
    const params = new URLSearchParams();
    params.append('name', name);
    if (description) params.append('description', description);
    
    return this.request(`/api/knowledge-bases?${params.toString()}`, {
      method: 'POST',
    });
  }

  async getKnowledgeBases(): Promise<ApiResponse<any[]>> {
    return this.request('/api/knowledge-bases');
  }

  async getKnowledgeBase(id: string): Promise<ApiResponse<any>> {
    return this.request(`/api/knowledge-bases/${id}`);
  }

  async updateKnowledgeBase(id: string, name: string, description?: string): Promise<ApiResponse<any>> {
    const params = new URLSearchParams();
    params.append('name', name);
    if (description) params.append('description', description);
    
    return this.request(`/api/knowledge-bases/${id}?${params.toString()}`, {
      method: 'PUT',
    });
  }

  async deleteKnowledgeBase(id: string): Promise<ApiResponse<any>> {
    return this.request(`/api/knowledge-bases/${id}`, {
      method: 'DELETE',
    });
  }

  // Collection API Methods
  async createCollection(knowledgeBaseId: string, name: string, description?: string): Promise<ApiResponse<any>> {
    const params = new URLSearchParams();
    params.append('knowledgeBaseId', knowledgeBaseId);
    params.append('name', name);
    if (description) params.append('description', description);

    return this.request(`/api/collections?${params.toString()}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
  }

  async getCollections(): Promise<ApiResponse<any[]>> {
    return this.request('/api/collections');
  }

  async getCollection(id: string): Promise<ApiResponse<any>> {
    return this.request(`/api/collections/${id}`);
  }

  async getCollectionsByKnowledgeBase(knowledgeBaseId: string): Promise<ApiResponse<any[]>> {
    return this.request(`/api/collections/knowledge-base/${knowledgeBaseId}`);
  }

  async updateCollection(id: string, name: string, description?: string): Promise<ApiResponse<any>> {
    const params = new URLSearchParams();
    params.append('name', name);
    if (description) params.append('description', description);

    return this.request(`/api/collections/${id}?${params.toString()}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
  }

  async deleteCollection(id: string): Promise<ApiResponse<any>> {
    return this.request(`/api/collections/${id}`, {
      method: 'DELETE',
    });
  }

  // Chat API Methods
  async simpleChat(message: string): Promise<ApiResponse<string>> {
    return this.request(`/api/chat?message=${encodeURIComponent(message)}`);
  }

  async ragChat(message: string, vectorTopK: number = 20, finalTopN: number = 5): Promise<ApiResponse<any>> {
    return this.request(
      `/api/chat/rag?message=${encodeURIComponent(message)}&vectorTopK=${vectorTopK}&finalTopN=${finalTopN}`
    );
  }

  async startConversation(): Promise<ApiResponse<{ conversationId: string }>> {
    return this.request('/api/chat/converse/start', {
      method: 'POST',
    });
  }

  async continueConversation(conversationId: string, message: string, historyDepth: number = 5): Promise<ApiResponse<any>> {
    return this.request(`/api/chat/converse?conversationId=${conversationId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, historyDepth }),
    });
  }

  async getConversations(): Promise<ApiResponse<any[]>> {
    return this.request('/api/chat/conversations');
  }

  async deleteConversation(conversationId: string): Promise<ApiResponse<any>> {
    return this.request(`/api/chat/conversations/${conversationId}`, {
      method: 'DELETE',
    });
  }

  async regenerateResponse(conversationId: string): Promise<ApiResponse<any>> {
    return this.request(`/api/chat/conversations/${conversationId}/regenerate`, {
      method: 'POST',
    });
  }

  async generateFollowUpQuestions(conversationId: string): Promise<ApiResponse<string[]>> {
    return this.request(`/api/chat/conversations/${conversationId}/follow-up`, {
      method: 'POST',
    });
  }
}

export const apiClient = new ApiClient();
