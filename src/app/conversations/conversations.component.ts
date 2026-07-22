import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService, Conversation } from '../core/services/chat.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-conversations',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './conversations.component.html',
})
export class ConversationsComponent implements OnInit {
  conversations: Conversation[] = [];
  filteredConversations: Conversation[] = [];
  searchQuery: string = '';
  loading = false;
  error: string | null = null;

  constructor(
    private chatService: ChatService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadConversations();
  }

  loadConversations(): void {
    this.loading = true;
    this.error = null;
    this.chatService.getAllConversations().subscribe({
      next: (data) => {
        this.conversations = data;
        this.filteredConversations = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load conversations';
        this.loading = false;
        console.error('Error loading conversations:', err);
      }
    });
  }

  onSearch(): void {
    if (!this.searchQuery.trim()) {
      this.filteredConversations = this.conversations;
      return;
    }

    this.loading = true;
    this.chatService.searchConversations(this.searchQuery).subscribe({
      next: (data) => {
        this.filteredConversations = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to search conversations';
        this.loading = false;
        console.error('Error searching conversations:', err);
      }
    });
  }

  deleteConversation(conversationId: string): void {
    if (!confirm('Are you sure you want to delete this conversation?')) {
      return;
    }

    this.chatService.deleteConversation(conversationId).subscribe({
      next: () => {
        this.conversations = this.conversations.filter(c => c.id !== conversationId);
        this.filteredConversations = this.filteredConversations.filter(c => c.id !== conversationId);
      },
      error: (err) => {
        this.error = 'Failed to delete conversation';
        console.error('Error deleting conversation:', err);
      }
    });
  }

  openConversation(conversationId: string): void {
    this.router.navigate(['/chat'], { queryParams: { conversationId } });
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
}
