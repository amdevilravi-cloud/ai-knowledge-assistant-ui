import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService, Message, ChatResponse } from '../core/services/chat.service';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="chat-container d-flex h-100 flex-column">
      <div class="chat-header p-3 border-bottom bg-light">
        <h5 class="mb-0">Enterprise AI Chat Assistant</h5>
        <small class="text-muted">
          {{ isLoading ? 'Processing...' : 'Ready to chat' }}
        </small>
      </div>

      <div class="messages-container flex-grow-1 overflow-auto p-3">
        <div *ngIf="messages.length === 0" class="text-center mt-5">
          <p class="text-muted">Start a conversation by typing a message below</p>
        </div>

        <div *ngFor="let msg of messages" class="mb-3">
          <div
            class="message"
            [ngClass]="{
              'message-user': msg.sender === 'user',
              'message-assistant': msg.sender === 'assistant'
            }"
          >
            <strong>{{ msg.sender === 'user' ? 'You' : 'Assistant' }}:</strong>
            <p class="mt-2">{{ msg.content }}</p>
            <div
              *ngIf="msg.citations && msg.citations.length > 0"
              class="citations mt-2 pt-2 border-top"
            >
              <small class="text-muted d-block mb-1">Sources:</small>
              <div *ngFor="let citation of msg.citations" class="citation-item">
                <small>
                  <strong>{{ citation.documentName }}</strong>
                  <span *ngIf="citation.pageNumber"> (page {{ citation.pageNumber }})</span>
                </small>
              </div>
            </div>
          </div>
        </div>

        <div *ngIf="errorMessage" class="alert alert-danger alert-dismissible fade show" role="alert">
          {{ errorMessage }}
          <button type="button" class="btn-close" (click)="errorMessage = ''"></button>
        </div>
      </div>

      <div class="message-input p-3 border-top">
        <div class="input-group">
          <input
            type="text"
            class="form-control"
            placeholder="Ask a question (e.g., 'What is in the documents?')..."
            [(ngModel)]="newMessage"
            (keyup.enter)="sendMessage()"
            [disabled]="isLoading"
          />
          <button
            class="btn btn-primary"
            (click)="sendMessage()"
            [disabled]="!newMessage || isLoading"
          >
            {{ isLoading ? 'Sending...' : 'Send' }}
          </button>
        </div>
        <small class="text-muted d-block mt-2">
          💡 Tip: Ask questions about your uploaded documents
        </small>
      </div>
    </div>
  `,
  styles: [`
    .chat-container {
      height: 100%;
    }
    .messages-container {
      display: flex;
      flex-direction: column;
      overflow-y: auto;
    }
    .message {
      padding: 0.75rem 1rem;
      border-radius: 0.5rem;
      margin-bottom: 0.5rem;
      max-width: 80%;
    }
    .message-user {
      background-color: #e3f2fd;
      margin-left: auto;
    }
    .message-assistant {
      background-color: #f5f5f5;
      margin-right: auto;
    }
    .message p {
      margin: 0;
    }
    .citations {
      font-size: 0.85rem;
    }
    .citation-item {
      padding: 0.25rem 0;
      word-break: break-word;
    }
  `],
})
export class ChatComponent implements OnInit {
  private chatService = inject(ChatService);

  messages: Message[] = [];
  newMessage = '';
  isLoading = false;
  errorMessage = '';
  conversationId = '';

  ngOnInit(): void {
    this.startNewConversation();
  }

  startNewConversation(): void {
    this.chatService.startConversation().subscribe({
      next: (response) => {
        this.conversationId = response.conversationId;
        this.messages = [];
        console.log('New conversation started:', this.conversationId);
      },
      error: (error) => {
        console.error('Failed to start conversation:', error);
        this.errorMessage = 'Failed to start conversation. Is the backend running?';
      },
    });
  }

  sendMessage(): void {
    if (!this.newMessage.trim()) {
      return;
    }

    const userMessage = this.newMessage;
    this.newMessage = '';
    this.isLoading = true;
    this.errorMessage = '';

    // Add user message to display
    this.messages.push({
      id: Date.now().toString(),
      content: userMessage,
      timestamp: new Date(),
      sender: 'user',
    });

    // Send message to backend
    this.chatService.sendMessage(this.conversationId, userMessage).subscribe({
      next: (response: ChatResponse) => {
        // Add assistant response
        this.messages.push({
          id: (Date.now() + 1).toString(),
          content: response.answer,
          timestamp: new Date(),
          sender: 'assistant',
          citations: this.extractCitations(response),
        });
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error sending message:', error);
        this.isLoading = false;
        this.errorMessage =
          error.status === 0
            ? 'Connection failed. Backend is not running at http://localhost:8080'
            : `Error: ${error.status} - ${error.statusText}`;
      },
    });
  }

  private extractCitations(response: ChatResponse): Citation[] {
    const citations: Citation[] = [];
    if (response.sourceDocuments) {
      response.sourceDocuments.forEach((doc) => {
        if (doc.citations) {
          citations.push(...doc.citations);
        }
      });
    }
    return citations;
  }
}

interface Citation {
  documentName: string;
  documentId: string;
  pageNumber?: number;
  chunkIndex?: number;
  relevanceScore?: number;
  content: string;
}
