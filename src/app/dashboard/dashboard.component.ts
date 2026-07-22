import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatService, Conversation } from '../core/services/chat.service';
import { DocumentService, DocumentUploadResponse } from '../core/services/document.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  stats = {
    totalConversations: 0,
    totalDocuments: 0,
    totalChunks: 0,
    recentActivity: [] as Conversation[]
  };
  loading = true;
  error: string | null = null;

  constructor(
    private chatService: ChatService,
    private documentService: DocumentService
  ) {}

  ngOnInit(): void {
    this.loadDashboardStats();
  }

  loadDashboardStats(): void {
    this.loading = true;
    this.error = null;

    // Load conversations
    this.chatService.getAllConversations().subscribe({
      next: (conversations: Conversation[]) => {
        this.stats.totalConversations = conversations.length;
        this.stats.recentActivity = conversations.slice(0, 5);
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Error loading conversations:', err);
        this.error = 'Failed to load dashboard statistics';
        this.loading = false;
      }
    });

    // Load documents
    this.documentService.getDocuments().subscribe({
      next: (documents: DocumentUploadResponse[]) => {
        this.stats.totalDocuments = documents.length;
        this.stats.totalChunks = documents.reduce((sum: number, doc: DocumentUploadResponse) => sum + (doc.chunks || 0), 0);
      },
      error: (err: any) => {
        console.error('Error loading documents:', err);
      }
    });
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
}
