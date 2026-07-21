import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService, Conversation, Message } from '../core/services/chat.service';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="chat-container d-flex h-100">
      <div class="chat-sidebar border-end" style="width: 250px;">
        <button
          class="btn btn-primary w-100 mb-3"
          (click)="newConversation()"
        >
          + New Chat
        </button>
        <div class="list-group">
          <button
            *ngFor="let conv of conversations$ | async"
            class="list-group-item list-group-item-action text-start"
            [class.active]="selectedConversation?.id === conv.id"
            (click)="selectConversation(conv)"
          >
            {{ conv.title }}
          </button>
        </div>
      </div>
      <div class="chat-main flex-grow-1 d-flex flex-column">
        <div class="messages-container flex-grow-1 overflow-auto p-3">
          <div *ngIf="!selectedConversation" class="text-center mt-5">
            <h5>Select or start a conversation</h5>
          </div>
          <div *ngFor="let msg of selectedConversation?.messages" class="mb-3">
            <div
              class="message"
              [ngClass]="{
                'message-user': msg.sender === 'user',
                'message-assistant': msg.sender === 'assistant'
              }"
            >
              <strong>{{ msg.sender === 'user' ? 'You' : 'Assistant' }}:</strong>
              <p>{{ msg.content }}</p>
            </div>
          </div>
        </div>
        <div class="message-input p-3 border-top" *ngIf="selectedConversation">
          <div class="input-group">
            <input
              type="text"
              class="form-control"
              placeholder="Type your message..."
              [(ngModel)]="newMessage"
              (keyup.enter)="sendMessage()"
            />
            <button
              class="btn btn-primary"
              (click)="sendMessage()"
              [disabled]="!newMessage"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .chat-container {
      height: 100%;
    }
    .chat-sidebar {
      overflow-y: auto;
    }
    .chat-main {
      display: flex;
      flex-direction: column;
    }
    .messages-container {
      display: flex;
      flex-direction: column;
    }
    .message {
      padding: 0.75rem 1rem;
      border-radius: 0.5rem;
      margin-bottom: 0.5rem;
    }
    .message-user {
      background-color: #e3f2fd;
      margin-left: 20%;
    }
    .message-assistant {
      background-color: #f5f5f5;
      margin-right: 20%;
    }
  `],
})
export class ChatComponent implements OnInit {
  private chatService = inject(ChatService);
  private route = inject(ActivatedRoute);

  conversations$!: Observable<Conversation[]>;
  selectedConversation: Conversation | null = null;
  newMessage = '';

  ngOnInit(): void {
    this.conversations$ = this.chatService.getConversations();
  }

  newConversation(): void {
    const title = prompt('Enter conversation title:');
    if (title) {
      this.chatService.createConversation(title).subscribe((conv) => {
        this.selectedConversation = conv;
        this.conversations$ = this.chatService.getConversations();
      });
    }
  }

  selectConversation(conversation: Conversation): void {
    this.chatService.getConversation(conversation.id).subscribe((conv) => {
      this.selectedConversation = conv;
    });
  }

  sendMessage(): void {
    if (this.newMessage && this.selectedConversation) {
      this.chatService
        .sendMessage(this.selectedConversation.id, this.newMessage)
        .subscribe((message) => {
          this.selectedConversation?.messages.push(message);
          this.newMessage = '';
        });
    }
  }
}
