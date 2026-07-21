import { Routes } from '@angular/router';
import { ChatComponent } from './chat/chat.component';
import { DocumentsComponent } from './documents/documents.component';
import { AnalyticsComponent } from './analytics/analytics.component';
import { ConversationsComponent } from './conversations/conversations.component';
import { SettingsComponent } from './settings/settings.component';
import { LoginComponent } from './auth/login.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/chat', pathMatch: 'full' },
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'chat',
    component: ChatComponent,
    canActivate: [authGuard],
  },
  {
    path: 'conversations',
    component: ConversationsComponent,
    canActivate: [authGuard],
  },
  {
    path: 'documents',
    component: DocumentsComponent,
    canActivate: [authGuard],
  },
  {
    path: 'analytics',
    component: AnalyticsComponent,
    canActivate: [authGuard],
  },
  {
    path: 'settings',
    component: SettingsComponent,
    canActivate: [authGuard],
  },
  { path: '**', redirectTo: '/chat' },
];
