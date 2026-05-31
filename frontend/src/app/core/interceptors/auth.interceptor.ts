import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { UserService } from '../services/user.service';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const userService = inject(UserService);
  const authService = inject(AuthService);
  const toastService = inject(ToastService);
  const router = inject(Router);

  // Skip interceptor error handling for login/register
  const isAuthEndpoint = req.url.includes('/login') || req.url.includes('/register');
  const isPublicEndpoint = isAuthEndpoint || req.url.endsWith('/api/hospitals');

  // Add JWT token to requests if available
  const token = userService.token();
  
  if (token && !isPublicEndpoint) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Let login/register handle their own errors
      if (isAuthEndpoint) {
        return throwError(() => error);
      }

      if (error.status === 401) {
        // Token expired or invalid
        authService.logoutLocally();
        toastService.error('Session expired. Please login again.');
        router.navigate(['/']);
      }
      
      return throwError(() => error);
    })
  );
};
