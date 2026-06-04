import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { catchError, finalize, Observable, of, tap, throwError } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  AuthResponse,
  LoginRequest,
  RefreshRequest,
  RegisterRequest,
  SessionState,
  UserRole,
  UserSession,
} from '../models/auth.model';

const ACCESS_TOKEN_KEY = 'tf_access_token';
const REFRESH_TOKEN_KEY = 'tf_refresh_token';
const USER_KEY = 'tf_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly sessionState = signal<SessionState>(this.loadSession());

  readonly currentUser = computed(() => this.sessionState().user);
  readonly isAuthenticated = computed(() => Boolean(this.sessionState().accessToken));
  readonly role = computed(() => this.sessionState().user?.role ?? null);

  login(payload: LoginRequest) {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, payload).pipe(
      tap((response) => this.storeSession(response))
    );
  }

  register(payload: RegisterRequest) {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/register`, payload).pipe(
      tap((response) => this.storeSession(response))
    );
  }

  refreshToken() {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/refresh`, {
      refreshToken,
    } satisfies RefreshRequest).pipe(
      tap((response) => this.storeSession(response))
    );
  }

  logout(): Observable<void> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      this.forceLogout();
      return of(void 0);
    }

    return this.http.post<void>(`${environment.apiUrl}/auth/logout`, {
      refreshToken,
    } satisfies RefreshRequest).pipe(
      catchError(() => of(void 0)),
      finalize(() => this.forceLogout())
    );
  }

  forceLogout(): void {
    this.sessionState.set({ user: null, accessToken: null, refreshToken: null });
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(ACCESS_TOKEN_KEY);
      window.localStorage.removeItem(REFRESH_TOKEN_KEY);
      window.localStorage.removeItem(USER_KEY);
    }
  }

  getAccessToken(): string | null {
    return this.sessionState().accessToken;
  }

  getRefreshToken(): string | null {
    return this.sessionState().refreshToken;
  }

  hasAnyRole(roles: readonly UserRole[]): boolean {
    const userRole = this.sessionState().user?.role;
    return userRole ? roles.includes(userRole) : false;
  }

  private storeSession(response: AuthResponse): void {
    const nextSession: SessionState = {
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
      user: response.user,
    };

    this.sessionState.set(nextSession);

    if (typeof window !== 'undefined') {
      window.localStorage.setItem(ACCESS_TOKEN_KEY, response.accessToken);
      window.localStorage.setItem(REFRESH_TOKEN_KEY, response.refreshToken);
      window.localStorage.setItem(USER_KEY, JSON.stringify(response.user));
    }
  }

  private loadSession(): SessionState {
    if (typeof window === 'undefined') {
      return { user: null, accessToken: null, refreshToken: null };
    }

    const userRaw = window.localStorage.getItem(USER_KEY);
    const accessToken = window.localStorage.getItem(ACCESS_TOKEN_KEY);
    const refreshToken = window.localStorage.getItem(REFRESH_TOKEN_KEY);
    const user = userRaw ? (JSON.parse(userRaw) as UserSession) : null;

    return {
      user,
      accessToken,
      refreshToken,
    };
  }
}
