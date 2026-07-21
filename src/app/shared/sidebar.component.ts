import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <div class="sidebar bg-light border-end">
      <ul class="nav flex-column">
        <li class="nav-item">
          <a
            routerLink="/chat"
            routerLinkActive="active"
            class="nav-link d-flex align-items-center"
          >
            <i class="bi bi-chat-dots me-2"></i> Chat
          </a>
        </li>
        <li class="nav-item">
          <a
            routerLink="/documents"
            routerLinkActive="active"
            class="nav-link d-flex align-items-center"
          >
            <i class="bi bi-file-earmark-pdf me-2"></i> Documents
          </a>
        </li>
      </ul>
      <hr class="my-3" />
      <div class="px-3 text-muted">
        <small>
          <p class="mb-2">💡 <strong>Tips:</strong></p>
          <ul class="ps-3">
            <li>Upload PDFs, TXT, or DOCX files</li>
            <li>Ask questions about your documents</li>
            <li>Get AI-powered answers with citations</li>
          </ul>
        </small>
      </div>
    </div>
  `,
  styles: [`
    .sidebar {
      height: calc(100vh - 56px);
      overflow-y: auto;
      padding: 1rem 0;
      position: sticky;
      top: 56px;
    }
    .nav-link {
      padding: 0.75rem 1rem;
      color: #666;
      text-decoration: none;
      border-left: 3px solid transparent;
    }
    .nav-link:hover {
      background-color: #f5f5f5;
      color: #333;
    }
    .nav-link.active {
      background-color: #e9ecef;
      border-left-color: #0d6efd;
      color: #0d6efd;
      font-weight: 500;
    }
  `],
})
export class SidebarComponent {}
