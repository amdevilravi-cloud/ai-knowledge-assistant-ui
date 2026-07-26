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
    this.chatService.getAllConversations().subscribe({
      next: (conversations: Conversation[]) => {
        // Calculate analytics from existing conversation data
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Calculate queries today
        const conversationsToday = conversations.filter(conv => {
          const convDate = new Date(conv.createdAt);
          convDate.setHours(0, 0, 0, 0);
          return convDate.getTime() === today.getTime();
        });
        this.stats.queriesToday = conversationsToday.length;

        // Calculate average response time (use average message count as proxy)
        const avgMessageCount = conversations.length > 0
          ? conversations.reduce((sum, conv) => sum + (conv.messageCount || 0), 0) / conversations.length
          : 0;
        this.stats.averageResponseTime = Math.round(avgMessageCount * 100); // Scale to milliseconds

        // Calculate queries over time (grouped by date)
        const queriesByDate: { [key: string]: number } = {};
        conversations.forEach(conv => {
          const date = new Date(conv.createdAt).toLocaleDateString();
          queriesByDate[date] = (queriesByDate[date] || 0) + 1;
        });

        this.analytics.queriesOverTime = Object.entries(queriesByDate)
          .map(([date, count]) => ({ date, count }))
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        // Calculate response time trends (using message count as proxy)
        const trendsByDate: { [key: string]: { total: number; count: number } } = {};
        conversations.forEach(conv => {
          const date = new Date(conv.createdAt).toLocaleDateString();
          if (!trendsByDate[date]) {
            trendsByDate[date] = { total: 0, count: 0 };
          }
          trendsByDate[date].total += conv.messageCount || 0;
          trendsByDate[date].count += 1;
        });

        this.analytics.responseTimeTrends = Object.entries(trendsByDate)
          .map(([date, data]) => ({
            date,
            avgTime: Math.round((data.total / data.count) * 100)
          }))
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        this.analytics.queriesToday = this.stats.queriesToday;
        this.analytics.averageResponseTime = this.stats.averageResponseTime;
      },
      error: (err) => {
        console.error('Error loading analytics:', err);
        // Set default values if API fails
        this.stats.queriesToday = 0;
        this.stats.averageResponseTime = 0;
        this.analytics = {
          queriesToday: 0,
          averageResponseTime: 0,
          queriesOverTime: [],
          responseTimeTrends: []
        };
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
