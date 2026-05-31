import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { UserService } from '../services/user.service';
import { UserRole } from '../models/user.model';
import { ToastService } from '../services/toast.service';

// Guard to check if user is authenticated
export const authGuard: CanActivateFn = () => {
  const userService = inject(UserService);
  const router = inject(Router);
  const toastService = inject(ToastService);

  if (userService.isLoggedIn()) {
    return true;
  }

  toastService.warning('Please login to access this page.');
  router.navigate(['/']);
  return false;
};

// Guard to check if user has specific role
export const roleGuard = (allowedRoles: UserRole[]): CanActivateFn => {
  return () => {
    const userService = inject(UserService);
    const router = inject(Router);
    const toastService = inject(ToastService);

    if (!userService.isLoggedIn()) {
      toastService.warning('Please login to access this page.');
      router.navigate(['/']);
      return false;
    }

    const userRoles = userService.roles();
    const hasRole = allowedRoles.some(role => userRoles.includes(role));

    if (hasRole) {
      return true;
    }

    toastService.error('You do not have permission to access this page.');
    router.navigate([userService.getDashboardRoute()]);
    return false;
  };
};

// Guard to redirect logged-in users away from login page
export const guestGuard: CanActivateFn = () => {
  const userService = inject(UserService);
  const router = inject(Router);

  if (userService.isLoggedIn()) {
    router.navigate([userService.getDashboardRoute()]);
    return false;
  }

  return true;
};
