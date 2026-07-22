import { Routes } from '@angular/router';
import { ChatComponent } from './chat/chat.component';
import { DocumentsComponent } from './documents/documents.component';
import { ConversationsComponent } from './conversations/conversations.component';
import { DashboardComponent } from './dashboard/dashboard.component';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  {
    path: 'chat',
    component: ChatComponent,
  },
  {
    path: 'documents',
    component: DocumentsComponent,
  },
  {
    path: 'conversations',
    component: ConversationsComponent,
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
  },
  { path: '**', redirectTo: '/dashboard' },
];
