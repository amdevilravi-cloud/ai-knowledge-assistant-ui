import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService, Message, ChatResponse } from '../core/services/chat.service';
import { DomSanitizer } from '@angular/platform-browser';
import { marked } from 'marked';
import { Clipboard } from '@angular/cdk/clipboard';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
})
export class ChatComponent implements OnInit {
  private chatService = inject(ChatService);
  private sanitizer = inject(DomSanitizer);
  private clipboard = inject(Clipboard);

  messages: Message[] = [];
  newMessage = '';
  isLoading = false;
  errorMessage = '';
  conversationId = '';
  useStreaming = true;
  expandedCitations: Set<string> = new Set();
  followUpQuestions: string[] = [];
  showFollowUp = false;

  ngOnInit(): void {
    this.startNewConversation();
  }

  startNewConversation(): void {
    this.chatService.startConversation().subscribe({
      next: (response) => {
        this.conversationId = response.conversationId;
        this.messages = [];
        this.followUpQuestions = [];
        this.showFollowUp = false;
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
    this.showFollowUp = false;

    // Add user message to display
    this.messages.push({
      id: Date.now().toString(),
      content: userMessage,
      timestamp: new Date(),
      sender: 'user',
    });

    // Use streaming if enabled
    if (this.useStreaming) {
      this.sendStreamingMessage(userMessage);
    } else {
      this.sendRegularMessage(userMessage);
    }
  }

  private sendStreamingMessage(userMessage: string): void {
    this.chatService.streamChat(userMessage).subscribe({
      next: (response: string) => {
        // Add assistant response
        this.messages.push({
          id: (Date.now() + 1).toString(),
          content: response,
          timestamp: new Date(),
          sender: 'assistant',
        });
        this.isLoading = false;
        this.generateFollowUpQuestions();
      },
      error: (error) => {
        console.error('Error in streaming message:', error);
        this.isLoading = false;
        this.errorMessage = 'Streaming failed. Falling back to regular chat.';
        // Fallback to regular chat
        this.sendRegularMessage(userMessage);
      },
    });
  }

  private sendRegularMessage(userMessage: string): void {
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
        this.generateFollowUpQuestions();
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

  regenerateResponse(): void {
    if (!this.conversationId || this.messages.length < 2) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    // Remove the last assistant message
    this.messages.pop();

    this.chatService.regenerateResponse(this.conversationId).subscribe({
      next: (response: ChatResponse) => {
        // Add regenerated assistant response
        this.messages.push({
          id: (Date.now() + 1).toString(),
          content: response.answer,
          timestamp: new Date(),
          sender: 'assistant',
          citations: this.extractCitations(response),
        });
        this.isLoading = false;
        this.generateFollowUpQuestions();
      },
      error: (error) => {
        console.error('Error regenerating response:', error);
        this.isLoading = false;
        this.errorMessage = 'Failed to regenerate response';
      },
    });
  }

  generateFollowUpQuestions(): void {
    if (!this.conversationId) {
      return;
    }

    this.chatService.generateFollowUpQuestions(this.conversationId).subscribe({
      next: (questions: string[]) => {
        this.followUpQuestions = questions;
        this.showFollowUp = questions.length > 0;
      },
      error: (error) => {
        console.error('Error generating follow-up questions:', error);
        this.showFollowUp = false;
      },
    });
  }

  selectFollowUpQuestion(question: string): void {
    this.newMessage = question;
    this.sendMessage();
  }

  copyToClipboard(text: string): void {
    this.clipboard.copy(text);
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

  parseMarkdown(content: string): string {
    return marked.parse(content) as string;
  }

  toggleCitation(citationId: string): void {
    if (this.expandedCitations.has(citationId)) {
      this.expandedCitations.delete(citationId);
    } else {
      this.expandedCitations.add(citationId);
    }
  }

  isCitationExpanded(citationId: string): boolean {
    return this.expandedCitations.has(citationId);
  }

  getCitationId(citation: Citation, index: number): string {
    return `${citation.documentId}-${citation.chunkIndex}-${index}`;
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
