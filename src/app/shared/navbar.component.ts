import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
      <div class="container-fluid">
        <a class="navbar-brand" routerLink="/">Enterprise AI Assistant</a>
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
                Chat
              </a>
            </li>
            <li class="nav-item">
              <a
                class="nav-link"
                routerLink="/conversations"
                routerLinkActive="active"
              >
                Conversations
              </a>
            </li>
            <li class="nav-item">
              <a
                class="nav-link"
                routerLink="/documents"
                routerLinkActive="active"
              >
                Documents
              </a>
            </li>
            <li class="nav-item">
              <a
                class="nav-link"
                routerLink="/analytics"
                routerLinkActive="active"
              >
                Analytics
              </a>
            </li>
            <li class="nav-item">
              <a
                class="nav-link"
                routerLink="/settings"
                routerLinkActive="active"
              >
                Settings
              </a>
            </li>
            <li class="nav-item">
              <button
                class="btn btn-outline-light"
                (click)="logout()"
                *ngIf="(authSvc.currentUser$ | async) as user"
              >
                Logout
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  `,
})
export class NavbarComponent {
  authSvc = inject(AuthService);

  logout(): void {
    this.authSvc.logout().subscribe(() => {
      window.location.href = '/login';
    });
  }
}
