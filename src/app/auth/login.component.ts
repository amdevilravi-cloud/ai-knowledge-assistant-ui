import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../core/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="container d-flex justify-content-center align-items-center min-vh-100">
      <div class="card shadow" style="width: 100%; max-width: 400px;">
        <div class="card-body p-5">
          <h2 class="card-title text-center mb-4">Knowledge Assistant</h2>
          <p class="text-center text-muted mb-4">Sign in to your account</p>

          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
            <div class="mb-3">
              <label for="username" class="form-label">Username</label>
              <input
                type="text"
                class="form-control"
                id="username"
                formControlName="username"
                placeholder="Enter username"
                [class.is-invalid]="username?.invalid && username?.touched"
              />
              <div class="invalid-feedback" *ngIf="username?.invalid && username?.touched">
                Username is required
              </div>
            </div>

            <div class="mb-3">
              <label for="password" class="form-label">Password</label>
              <input
                type="password"
                class="form-control"
                id="password"
                formControlName="password"
                placeholder="Enter password"
                [class.is-invalid]="password?.invalid && password?.touched"
              />
              <div class="invalid-feedback" *ngIf="password?.invalid && password?.touched">
                Password is required
              </div>
            </div>

            <div *ngIf="errorMessage" class="alert alert-danger alert-dismissible fade show" role="alert">
              {{ errorMessage }}
              <button type="button" class="btn-close" (click)="errorMessage = ''"></button>
            </div>

            <button
              type="submit"
              class="btn btn-primary w-100"
              [disabled]="loginForm.invalid || isLoading"
            >
              <span *ngIf="!isLoading">Sign In</span>
              <span *ngIf="isLoading">
                <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Signing in...
              </span>
            </button>
          </form>

          <hr class="my-4" />

          <p class="text-center text-muted small">
            Demo credentials: Use test account or contact administrator
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .min-vh-100 {
      min-height: 100vh;
    }
    .card {
      border: none;
      border-radius: 0.5rem;
    }
  `]
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.createForm();
  }

  ngOnInit(): void {
    // If user is already logged in, redirect to chat
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.router.navigate(['/chat']);
      }
    });
  }

  createForm(): void {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]],
    });
  }

  get username() {
    return this.loginForm.get('username');
  }

  get password() {
    return this.loginForm.get('password');
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const { username, password } = this.loginForm.value;

    this.authService.login(username, password).subscribe({
      next: () => {
        this.router.navigate(['/chat']);
      },
      error: (error) => {
        console.error('Login error:', error);
        this.isLoading = false;
        this.errorMessage = error?.error?.message || 'Login failed. Please try again.';
      },
    });
  }
}
