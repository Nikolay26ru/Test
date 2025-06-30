/**
 * Типы для системы авторизации
 */

export interface User {
  id: string;
  email: string;
  name: string;
  username?: string;
  avatar_url?: string;
  bio?: string;
  privacy_settings?: 'public' | 'friends' | 'private';
  is_guest?: boolean;
  email_verified?: boolean;
  interests?: string[];
  created_at: string;
  last_login?: string;
  login_count?: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  username?: string;
}

export interface AuthResult {
  success: boolean;
  user?: User | null;
  error?: string;
  message: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithEmail: (credentials: LoginCredentials) => Promise<AuthResult>;
  signUpWithEmail: (credentials: RegisterCredentials) => Promise<AuthResult>;
  signInWithGoogle: () => Promise<AuthResult>;
  signInAsGuest: (guestName?: string) => Promise<AuthResult>;
  signOut: () => Promise<AuthResult>;
  resetPassword: (email: string) => Promise<AuthResult>;
  updateProfile: (updates: Partial<User>) => Promise<AuthResult>;
}