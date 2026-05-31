import { Injectable, signal, computed } from '@angular/core';
import { CurrentUser, UserRole } from '../models/user.model';

const STORAGE_KEY = 'medora_user';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private currentUserSignal = signal<CurrentUser | null>(this.loadFromStorage());

  // Computed signals for reactive state
  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly isLoggedIn = computed(() => {
    const user = this.currentUserSignal();
    if (!user) return false;
    // Check if token is expired
    return user.expiresAt > Date.now();
  });
  readonly username = computed(() => this.currentUserSignal()?.username ?? '');
  readonly roles = computed(() => this.currentUserSignal()?.roles ?? []);
  readonly token = computed(() => this.currentUserSignal()?.token ?? '');

  // Role checks
  readonly isPatient = computed(() => this.hasRole('PATIENT'));
  readonly isDoctor = computed(() => this.hasRole('DOCTOR'));
  readonly isHospital = computed(() => this.hasRole('HOSPITAL'));
  readonly isAdmin = computed(() => this.hasRole('ADMIN'));

  private loadFromStorage(): CurrentUser | null {
    if (typeof window === 'undefined') return null;
    
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    
    try {
      const user: CurrentUser = JSON.parse(stored);
      // Check if expired
      if (user.expiresAt <= Date.now()) {
        localStorage.removeItem(STORAGE_KEY);
        return null;
      }
      return user;
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
  }

  setUser(user: CurrentUser): void {
    this.currentUserSignal.set(user);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    }
  }

  clearUser(): void {
    this.currentUserSignal.set(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  hasRole(role: UserRole): boolean {
    return this.roles().includes(role);
  }

  getPrimaryRole(): UserRole | null {
    const roles = this.roles();
    // Priority: ADMIN > HOSPITAL > DOCTOR > PATIENT
    if (roles.includes('ADMIN')) return 'ADMIN';
    if (roles.includes('HOSPITAL')) return 'HOSPITAL';
    if (roles.includes('DOCTOR')) return 'DOCTOR';
    if (roles.includes('PATIENT')) return 'PATIENT';
    return null;
  }

  getDashboardRoute(): string {
    const role = this.getPrimaryRole();
    switch (role) {
      case 'ADMIN': return '/admin';
      case 'HOSPITAL': return '/hospital';
      case 'DOCTOR': return '/doctor';
      case 'PATIENT': return '/patient';
      default: return '/';
    }
  }
}
