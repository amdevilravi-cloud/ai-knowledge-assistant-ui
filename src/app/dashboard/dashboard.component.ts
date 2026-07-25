import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatService, Conversation } from '../core/services/chat.service';
import { DocumentService, DocumentUploadResponse } from '../core/services/document.service';
import { HttpClient } from '@angular/common/http';

interface KnowledgeBase {
  id: string;
  name: string;
  description: string;
}

interface Collection {
  id: string;
  knowledgeBaseId: string;
  name: string;
  description: string;
}

interface AnalyticsData {
  queriesToday: number;
  averageResponseTime: number;
  queriesOverTime: { date: string; count: number }[];
  responseTimeTrends: { date: string; avgTime: number }[];
}

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
    totalKnowledgeBases: 0,
    totalCollections: 0,
    queriesToday: 0,
    averageResponseTime: 0,
    recentActivity: [] as Conversation[]
  };
  analytics: AnalyticsData = {
    queriesToday: 0,
    averageResponseTime: 0,
    queriesOverTime: [],
    responseTimeTrends: []
  };
  loading = true;
  error: string | null = null;

  constructor(
    private chatService: ChatService,
    private documentService: DocumentService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.loadDashboardStats();
    this.loadKnowledgeBases();
    this.loadCollections();
    this.loadAnalytics();
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

  loadKnowledgeBases(): void {
    this.http.get<KnowledgeBase[]>('/api/knowledge-bases')
      .subscribe({
        next: (data) => {
          this.stats.totalKnowledgeBases = data.length;
        },
        error: (err) => {
          console.error('Error loading knowledge bases:', err);
        }
      });
  }

  loadCollections(): void {
    this.http.get<Collection[]>('/api/collections')
      .subscribe({
        next: (data) => {
          this.stats.totalCollections = data.length;
        },
        error: (err) => {
          console.error('Error loading collections:', err);
        }
      });
  }

  loadAnalytics(): void {
    this.http.get<AnalyticsData>('/api/analytics/dashboard')
      .subscribe({
        next: (data) => {
          this.analytics = data;
          this.stats.queriesToday = data.queriesToday;
          this.stats.averageResponseTime = data.averageResponseTime;
        },
        error: (err) => {
          console.error('Error loading analytics:', err);
          // Set default values if API fails
          this.stats.queriesToday = 0;
          this.stats.averageResponseTime = 0;
        }
      });
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  formatResponseTime(ms: number): string {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  }
}
