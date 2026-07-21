import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
      <div class="container-fluid">
        <a class="navbar-brand" routerLink="/">
          <i class="bi bi-robot"></i> Enterprise AI Assistant
        </a>
        <button
          class="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav ms-auto">
            <li class="nav-item">
              <a class="nav-link" routerLink="/chat" routerLinkActive="active">
                <i class="bi bi-chat-dots"></i> Chat
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link" routerLink="/documents" routerLinkActive="active">
                <i class="bi bi-file-earmark-pdf"></i> Documents
              </a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .navbar-brand {
      font-weight: 600;
      font-size: 1.25rem;
    }
    .nav-link {
      margin-left: 1rem;
    }
  `],
})
export class NavbarComponent {}
