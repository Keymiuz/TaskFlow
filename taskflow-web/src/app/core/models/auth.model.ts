export type UserRole = 'ADMIN' | 'MANAGER' | 'MEMBER';

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface RefreshRequest {
  refreshToken: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: UserSession;
}

export interface SessionState {
  user: UserSession | null;
  accessToken: string | null;
  refreshToken: string | null;
}
