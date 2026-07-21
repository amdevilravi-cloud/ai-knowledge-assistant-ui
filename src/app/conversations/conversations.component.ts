import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatService, Conversation } from '../core/services/chat.service';
import { RouterLink } from '@angular/router';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-conversations',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container-fluid p-4">
      <h2 class="mb-4">My Conversations</h2>

      <div class="row">
        <div class="col-md-12">
          <div class="table-responsive">
            <table class="table table-hover">
              <thead class="table-light">
                <tr>
                  <th>Title</th>
                  <th>Created</th>
                  <th>Last Updated</th>
                  <th>Messages</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let conv of conversations$ | async">
                  <td>
                    <a [routerLink]="['/chat', conv.id]">{{ conv.title }}</a>
                  </td>
                  <td>{{ conv.createdAt | date: 'medium' }}</td>
                  <td>{{ conv.updatedAt | date: 'medium' }}</td>
                  <td>
                    <span class="badge bg-secondary">{{ (conv.messages || []).length }}</span>
                  </td>
                  <td>
                    <button
                      class="btn btn-sm btn-danger"
                      (click)="deleteConversation(conv.id)"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class ConversationsComponent implements OnInit {
  private chatService = inject(ChatService);
  conversations$!: Observable<Conversation[]>;

  ngOnInit(): void {
    this.loadConversations();
  }

  loadConversations(): void {
    this.conversations$ = this.chatService.getConversations();
  }

  deleteConversation(id: string): void {
    if (confirm('Are you sure you want to delete this conversation?')) {
      this.chatService.deleteConversation(id).subscribe(() => {
        this.loadConversations();
      });
    }
  }
}
