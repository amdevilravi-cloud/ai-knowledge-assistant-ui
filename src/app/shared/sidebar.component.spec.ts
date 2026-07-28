import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { SidebarComponent } from './sidebar.component';
import { ChatService } from '../core/services/chat.service';

describe('SidebarComponent', () => {
  let component: SidebarComponent;
  let chatServiceSpy: jasmine.SpyObj<ChatService>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('ChatService', ['getAllConversations']);
    
    await TestBed.configureTestingModule({
      imports: [SidebarComponent, RouterTestingModule],
      providers: [
        { provide: ChatService, useValue: spy }
      ]
    }).compileComponents();

    component = TestBed.createComponent(SidebarComponent).componentInstance;
    chatServiceSpy = TestBed.inject(ChatService) as jasmine.SpyObj<ChatService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load recent conversations on init', () => {
    const mockConversations = [
      { id: '1', title: 'Test 1', createdAt: new Date().toISOString(), lastActivity: new Date().toISOString() },
      { id: '2', title: 'Test 2', createdAt: new Date().toISOString(), lastActivity: new Date().toISOString() }
    ];
    chatServiceSpy.getAllConversations.and.returnValue(of(mockConversations));
    
    component.ngOnInit();
    
    expect(chatServiceSpy.getAllConversations).toHaveBeenCalled();
    expect(component.recentConversations.length).toBe(2);
  });

  it('should limit recent conversations to 5', () => {
    const mockConversations = Array.from({ length: 10 }, (_, i) => ({
      id: i.toString(),
      title: `Test ${i}`,
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString()
    }));
    chatServiceSpy.getAllConversations.and.returnValue(of(mockConversations));
    
    component.ngOnInit();
    
    expect(component.recentConversations.length).toBe(5);
  });

  it('should sort conversations by last activity', () => {
    const mockConversations = [
      { id: '1', title: 'Old', createdAt: '2024-01-01', lastActivity: '2024-01-01' },
      { id: '2', title: 'New', createdAt: '2024-01-02', lastActivity: '2024-01-02' },
      { id: '3', title: 'Newest', createdAt: '2024-01-03', lastActivity: '2024-01-03' }
    ];
    chatServiceSpy.getAllConversations.and.returnValue(of(mockConversations));
    
    component.ngOnInit();
    
    expect(component.recentConversations[0].title).toBe('Newest');
  });

  it('should toggle conversations visibility', () => {
    component.showConversations = true;
    component.toggleConversations();
    expect(component.showConversations).toBe(false);
    
    component.toggleConversations();
    expect(component.showConversations).toBe(true);
  });

  it('should format date as Today for same day', () => {
    const today = new Date().toISOString();
    const formatted = component.formatDate(today);
    expect(formatted).toBe('Today');
  });

  it('should format date as Yesterday for previous day', () => {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const formatted = component.formatDate(yesterday);
    expect(formatted).toBe('Yesterday');
  });

  it('should format date as days ago for recent days', () => {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
    const formatted = component.formatDate(threeDaysAgo);
    expect(formatted).toBe('3d ago');
  });

  it('should format date as month day for older dates', () => {
    const oldDate = new Date('2024-01-15').toISOString();
    const formatted = component.formatDate(oldDate);
    expect(formatted).toContain('Jan');
    expect(formatted).toContain('15');
  });

  it('should handle loading state', () => {
    chatServiceSpy.getAllConversations.and.returnValue(of([]));
    
    component.loadRecentConversations();
    expect(component.loading).toBe(true);
  });
});
