import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';

interface User {
  id: string;
  username: string;
  email: string;
  roles: string[];
}

interface AuthResponse {
  user: User;
  token?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = '/api/auth';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    this.checkCurrentUser();
  }

  checkCurrentUser(): void {
    this.http
      .get<AuthResponse>(`${this.apiUrl}/me`)
      .pipe(
        tap((response) => {
          this.currentUserSubject.next(response.user);
        })
      )
      .subscribe({
        error: (error) => {
          console.warn('Auth check failed - user not authenticated:', error);
          this.currentUserSubject.next(null);
        },
      });
  }

  login(username: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/login`, { username, password })
      .pipe(
        tap((response) => {
          this.currentUserSubject.next(response.user);
        })
      );
  }

  logout(): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/logout`, {}).pipe(
      tap(() => {
        this.currentUserSubject.next(null);
      })
    );
  }

  isAuthenticated(): Observable<boolean> {
    return this.currentUser$.pipe(map((user) => !!user));
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }
}
