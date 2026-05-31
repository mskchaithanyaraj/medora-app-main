import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { UserService } from './user.service';
import {
  LoginRequest,
  LoginResponse,
  RegistrationRequest,
  RegistrationResponse,
  CurrentUser
} from '../models/user.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = environment.apiUrl;
  
  private http = inject(HttpClient);
  private userService = inject(UserService);

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.API_URL}/login`, credentials).pipe(
      tap(response => {
        const currentUser: CurrentUser = {
          token: response.token,
          username: response.username,
          roles: response.roles,
          expiresAt: Date.now() + (response.expiresIn * 1000)
        };
        this.userService.setUser(currentUser);
      })
    );
  }

  register(data: RegistrationRequest): Observable<RegistrationResponse> {
    return this.http.post<RegistrationResponse>(`${this.API_URL}/register`, data);
  }

  logout(): Observable<string> {
    return this.http.post(`${this.API_URL}/logout`, {}, { responseType: 'text' }).pipe(
      tap(() => {
        this.userService.clearUser();
      })
    );
  }

  // Logout locally without API call (for expired tokens)
  logoutLocally(): void {
    this.userService.clearUser();
  }
}
