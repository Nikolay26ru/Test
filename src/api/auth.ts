import { supabase } from '../lib/supabase';
import type { User, ApiResponse } from '../types';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  name: string;
  username?: string;
}

export const authApi = {
  async signInWithEmail(credentials: LoginCredentials): Promise<ApiResponse<User>> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email.trim().toLowerCase(),
        password: credentials.password
      });

      if (error) throw error;

      if (!data.user) {
        throw new Error('Не удалось получить данные пользователя');
      }

      const user = await this.loadUserProfile(data.user);
      return { success: true, data: user };
    } catch (error: any) {
      return { 
        success: false, 
        error: this.handleAuthError(error) 
      };
    }
  },

  async signUpWithEmail(credentials: RegisterCredentials): Promise<ApiResponse<User>> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: credentials.email.trim().toLowerCase(),
        password: credentials.password,
        options: {
          data: {
            full_name: credentials.name.trim(),
            username: credentials.username?.trim().toLowerCase()
          }
        }
      });

      if (error) throw error;

      if (!data.user) {
        throw new Error('Не удалось создать пользователя');
      }

      return { 
        success: true, 
        data: null // Пользователь должен подтвердить email
      };
    } catch (error: any) {
      return { 
        success: false, 
        error: this.handleAuthError(error) 
      };
    }
  },

  async signInWithGoogle(): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      return { 
        success: false, 
        error: this.handleAuthError(error) 
      };
    }
  },

  async signInAsGuest(): Promise<ApiResponse<User>> {
    try {
      const { data, error } = await supabase.auth.signInAnonymously();

      if (error) throw error;

      if (!data.user) {
        throw new Error('Не удалось создать гостевого пользователя');
      }

      // Создаем временный профиль для гостя
      const guestUser: User = {
        id: data.user.id,
        name: `Гость_${Math.random().toString(36).substring(7)}`,
        username: `guest_${data.user.id.substring(0, 8)}`,
        is_guest: true,
        created_at: new Date().toISOString()
      };

      return { success: true, data: guestUser };
    } catch (error: any) {
      return { 
        success: false, 
        error: this.handleAuthError(error) 
      };
    }
  },

  async signOut(): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      return { 
        success: false, 
        error: this.handleAuthError(error) 
      };
    }
  },

  async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return null;

      return await this.loadUserProfile(user);
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },

  async loadUserProfile(authUser: any): Promise<User> {
    try {
      // Для анонимных пользователей возвращаем базовый профиль
      if (authUser.is_anonymous) {
        return {
          id: authUser.id,
          name: `Гость_${Math.random().toString(36).substring(7)}`,
          username: `guest_${authUser.id.substring(0, 8)}`,
          is_guest: true,
          created_at: authUser.created_at || new Date().toISOString()
        };
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading profile:', error);
      }

      if (profile) {
        return {
          id: profile.id,
          email: profile.email || authUser.email,
          name: profile.name,
          username: profile.username,
          avatar_url: profile.avatar_url,
          bio: profile.bio,
          privacy_settings: profile.privacy_settings,
          is_guest: profile.is_guest,
          interests: profile.interests,
          created_at: profile.created_at,
          updated_at: profile.updated_at
        };
      } else {
        // Создаем fallback профиль
        return {
          id: authUser.id,
          email: authUser.email || '',
          name: authUser.user_metadata?.full_name || authUser.email || 'Пользователь',
          username: authUser.user_metadata?.username || 
                   authUser.email?.split('@')[0] || 
                   `user_${authUser.id.substring(0, 8)}`,
          avatar_url: authUser.user_metadata?.avatar_url,
          privacy_settings: 'public',
          is_guest: false,
          created_at: authUser.created_at || new Date().toISOString()
        };
      }
    } catch (error) {
      console.error('Error in loadUserProfile:', error);
      // Возвращаем минимальный профиль в случае ошибки
      return {
        id: authUser.id,
        email: authUser.email || '',
        name: authUser.user_metadata?.full_name || 'Пользователь',
        username: `user_${authUser.id.substring(0, 8)}`,
        is_guest: false,
        created_at: authUser.created_at || new Date().toISOString()
      };
    }
  },

  handleAuthError(error: any): string {
    const errorMappings: Record<string, string> = {
      'invalid_credentials': 'Неверный email или пароль',
      'email_not_confirmed': 'Подтвердите email для входа',
      'user_already_exists': 'Пользователь с таким email уже существует',
      'weak_password': 'Пароль слишком слабый',
      'signup_disabled': 'Регистрация временно отключена',
      'email_address_invalid': 'Неверный формат email адреса',
      'anonymous_provider_disabled': 'Гостевой вход отключен'
    };

    if (error?.error_code && errorMappings[error.error_code]) {
      return errorMappings[error.error_code];
    }

    const message = error?.message?.toLowerCase() || '';
    
    if (message.includes('invalid login credentials')) {
      return 'Неверный email или пароль';
    }
    
    if (message.includes('email not confirmed')) {
      return 'Подтвердите email для входа';
    }
    
    if (message.includes('user already registered')) {
      return 'Пользователь с таким email уже существует';
    }

    if (message.includes('anonymous sign-ins are disabled')) {
      return 'Гостевой вход временно недоступен';
    }

    return error?.message || 'Произошла неизвестная ошибка';
  }
};