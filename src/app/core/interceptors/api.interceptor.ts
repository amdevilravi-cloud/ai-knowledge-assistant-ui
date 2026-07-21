import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const apiInterceptor: HttpInterceptorFn = (request, next) => {
  const router = inject(Router);

  // Only intercept API requests
  if (!request.url.includes('/api/')) {
    return next(request);
  }

  // Clone request and add credentials
  const apiRequest = request.clone({
    withCredentials: true,
  });

  return next(apiRequest).pipe(
    catchError((error: HttpErrorResponse) => {
      console.error('API Error:', error);
      if (error.status === 401) {
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};
