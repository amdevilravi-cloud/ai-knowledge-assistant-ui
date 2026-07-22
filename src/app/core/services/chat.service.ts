import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Message {
  id: string;
  content: string;
  timestamp: Date;
  sender: 'user' | 'assistant';
  citations?: Citation[];
}

export interface Citation {
  documentName: string;
  documentId: string;
  pageNumber?: number;
  chunkIndex?: number;
  relevanceScore?: number;
  content: string;
}

export interface ChatResponse {
  answer: string;
  isFromContext: boolean;
  retrievalCount: number;
  sourceDocuments?: SourceDocument[];
}

export interface SourceDocument {
  documentName: string;
  documentId: string;
  citations: Citation[];
  chunkCount?: number;
}

export interface ConversationRequest {
  message: string;
  historyDepth?: number;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: string;
  lastActivity?: string;
  messageCount: number;
}

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private chatApiUrl = 'http://localhost:8080/api/chat';

  constructor(private http: HttpClient) {}

  /**
   * Start a new conversation session
   */
  startConversation(): Observable<{ conversationId: string }> {
    return this.http.post<{ conversationId: string }>(`${this.chatApiUrl}/converse/start`, {});
  }

  /**
   * Send a message in an existing conversation with history
   */
  sendMessage(
    conversationId: string,
    message: string,
    historyDepth: number = 5
  ): Observable<ChatResponse> {
    const request: ConversationRequest = { message, historyDepth };
    return this.http.post<ChatResponse>(
      `${this.chatApiUrl}/converse?conversationId=${conversationId}`,
      request
    );
  }

  /**
   * RAG-enhanced chat with document retrieval
   */
  ragChat(query: string, topK: number = 5): Observable<ChatResponse> {
    return this.http.get<ChatResponse>(`${this.chatApiUrl}/rag`, {
      params: { message: query, topK: topK.toString() },
    });
  }

  /**
   * Simple LLM chat without document retrieval
   */
  simpleChat(query: string): Observable<string> {
    return this.http.get(`${this.chatApiUrl}?message=${encodeURIComponent(query)}`, {
      responseType: 'text',
    });
  }

  /**
   * Get all conversations
   */
  getAllConversations(): Observable<Conversation[]> {
    return this.http.get<Conversation[]>(`${this.chatApiUrl}/conversations`);
  }

  /**
   * Delete a conversation
   */
  deleteConversation(conversationId: string): Observable<void> {
    return this.http.delete<void>(`${this.chatApiUrl}/conversations/${conversationId}`);
  }

  /**
   * Search conversations
   */
  searchConversations(query: string): Observable<Conversation[]> {
    return this.http.get<Conversation[]>(`${this.chatApiUrl}/conversations/search`, {
      params: { query },
    });
  }

  /**
   * Streaming chat using Server-Sent Events
   */
  streamChat(message: string): Observable<string> {
    return new Observable<string>((observer) => {
      const eventSource = new EventSource(
        `${this.chatApiUrl}/stream?message=${encodeURIComponent(message)}`
      );

      eventSource.addEventListener('message', (event: any) => {
        observer.next(event.data);
        eventSource.close();
        observer.complete();
      });

      eventSource.addEventListener('error', (event: any) => {
        observer.error(new Error(event.data));
        eventSource.close();
      });

      eventSource.onerror = (error) => {
        observer.error(error);
        eventSource.close();
      };

      return () => {
        eventSource.close();
      };
    });
  }
}
