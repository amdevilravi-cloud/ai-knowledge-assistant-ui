import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-conversations',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container-fluid p-4">
      <h2 class="mb-4">My Conversations</h2>
      <div class="alert alert-info">
        <p>
          Conversation history tracking is not available in this version. Each chat session is
          independent.
        </p>
        <p>
          To maintain conversation context, keep the chat window open and continue asking related
          questions.
        </p>
      </div>
    </div>
  `,
})
export class ConversationsComponent {}
