import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Message {
  id: string;
  content: string;
  timestamp: Date;
  sender: 'user' | 'assistant';
  citations?: Citation[];
}

export interface Citation {
  id: string;
  source: string;
  title: string;
  excerpt: string;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  messages: Message[];
}

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private apiUrl = '/api/chat';

  constructor(private http: HttpClient) {}

  getConversations(): Observable<Conversation[]> {
    return this.http.get<Conversation[]>(`${this.apiUrl}/conversations`);
  }

  getConversation(id: string): Observable<Conversation> {
    return this.http.get<Conversation>(`${this.apiUrl}/conversations/${id}`);
  }

  createConversation(title: string): Observable<Conversation> {
    return this.http.post<Conversation>(`${this.apiUrl}/conversations`, {
      title,
    });
  }

  sendMessage(conversationId: string, content: string): Observable<Message> {
    return this.http.post<Message>(
      `${this.apiUrl}/conversations/${conversationId}/messages`,
      { content }
    );
  }

  deleteConversation(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/conversations/${id}`);
  }

  updateConversationTitle(id: string, title: string): Observable<Conversation> {
    return this.http.put<Conversation>(`${this.apiUrl}/conversations/${id}`, {
      title,
    });
  }
}
