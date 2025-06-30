/**
 * Эталонный сервис авторизации
 * Обеспечивает безопасную и надежную авторизацию пользователей
 */

import { supabase } from '../supabase';
import { ValidationService } from '../validation/ValidationService';
import { LoggingService } from '../logging/LoggingService';
import { EmailService } from '../email/EmailService';
import { ErrorHandler } from '../error/ErrorHandler';
import type { User, AuthResult, LoginCredentials, RegisterCredentials } from '../../types/auth';

export class AuthService {
  private static readonly MAX_LOGIN_ATTEMPTS = 5;
  private static readonly LOCKOUT_DURATION = 15 * 60 * 1000; // 15 минут
  private static loginAttempts = new Map<string, { count: number; lastAttempt: number }>();

  /**
   * Вход пользователя с email и паролем
   */
  static async signInWithEmail(credentials: LoginCredentials): Promise<AuthResult> {
    const startTime = performance.now();
    
    try {
      LoggingService.info('Попытка входа пользователя', { email: credentials.email });

      // Проверяем блокировку по IP/email
      if (this.isBlocked(credentials.email)) {
        throw new Error('Слишком много неудачных попыток входа. Попробуйте позже.');
      }

      // Валидация входных данных
      const validation = ValidationService.validateLoginCredentials(credentials);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      // Попытка входа
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email.trim().toLowerCase(),
        password: credentials.password
      });

      if (error) {
        this.recordFailedAttempt(credentials.email);
        throw error;
      }

      if (!data.user) {
        throw new Error('Не удалось получить данные пользователя');
      }

      // Успешный вход - сбрасываем счетчик попыток
      this.clearFailedAttempts(credentials.email);

      // Обновляем статистику входа
      await this.updateLoginStats(data.user.id);

      // Загружаем профиль пользователя
      const profile = await this.loadUserProfile(data.user);

      const duration = performance.now() - startTime;
      LoggingService.info('Успешный вход пользователя', { 
        userId: data.user.id, 
        email: credentials.email,
        duration: `${duration.toFixed(2)}ms`
      });

      return {
        success: true,
        user: profile,
        message: 'Вход выполнен успешно'
      };

    } catch (error: any) {
      const duration = performance.now() - startTime;
      LoggingService.error('Ошибка входа пользователя', error, { 
        email: credentials.email,
        duration: `${duration.toFixed(2)}ms`
      });

      return {
        success: false,
        error: ErrorHandler.handleAuthError(error),
        message: 'Не удалось выполнить вход'
      };
    }
  }

  /**
   * Регистрация нового пользователя
   */
  static async signUpWithEmail(credentials: RegisterCredentials): Promise<AuthResult> {
    const startTime = performance.now();
    
    try {
      LoggingService.info('Попытка регистрации пользователя', { email: credentials.email });

      // Валидация входных данных
      const validation = ValidationService.validateRegisterCredentials(credentials);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      // Проверяем, не существует ли уже пользователь
      const existingUser = await this.checkUserExists(credentials.email);
      if (existingUser) {
        throw new Error('Пользователь с таким email уже существует');
      }

      // Регистрация
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

      if (error) {
        throw error;
      }

      if (!data.user) {
        throw new Error('Не удалось создать пользователя');
      }

      // Отправляем письмо подтверждения
      if (data.user.email && !data.user.email_confirmed_at) {
        await EmailService.sendConfirmationEmail(data.user.email, data.user.id);
      }

      const duration = performance.now() - startTime;
      LoggingService.info('Успешная регистрация пользователя', { 
        userId: data.user.id, 
        email: credentials.email,
        duration: `${duration.toFixed(2)}ms`
      });

      return {
        success: true,
        user: null, // Пользователь должен подтвердить email
        message: 'Регистрация успешна! Проверьте email для подтверждения аккаунта.'
      };

    } catch (error: any) {
      const duration = performance.now() - startTime;
      LoggingService.error('Ошибка регистрации пользователя', error, { 
        email: credentials.email,
        duration: `${duration.toFixed(2)}ms`
      });

      return {
        success: false,
        error: ErrorHandler.handleAuthError(error),
        message: 'Не удалось выполнить регистрацию'
      };
    }
  }

  /**
   * Вход через Google OAuth
   */
  static async signInWithGoogle(): Promise<AuthResult> {
    try {
      LoggingService.info('Попытка входа через Google');

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent'
          }
        }
      });

      if (error) {
        throw error;
      }

      LoggingService.info('Инициирован вход через Google');

      return {
        success: true,
        user: null, // Пользователь будет получен в callback
        message: 'Перенаправление на Google...'
      };

    } catch (error: any) {
      LoggingService.error('Ошибка входа через Google', error);

      return {
        success: false,
        error: ErrorHandler.handleAuthError(error),
        message: 'Не удалось выполнить вход через Google'
      };
    }
  }

  /**
   * Гостевой вход (анонимный)
   */
  static async signInAsGuest(guestName?: string): Promise<AuthResult> {
    try {
      LoggingService.info('Попытка гостевого входа', { guestName });

      const { data, error } = await supabase.auth.signInAnonymously();

      if (error) {
        throw error;
      }

      if (!data.user) {
        throw new Error('Не удалось создать гостевого пользователя');
      }

      // Создаем временный профиль
      const profile = await this.createGuestProfile(data.user.id, guestName);

      LoggingService.info('Успешный гостевой вход', { 
        userId: data.user.id,
        guestName: profile.name
      });

      return {
        success: true,
        user: profile,
        message: 'Добро пожаловать! Вы вошли как гость.'
      };

    } catch (error: any) {
      LoggingService.error('Ошибка гостевого входа', error);

      return {
        success: false,
        error: ErrorHandler.handleAuthError(error),
        message: 'Не удалось выполнить гостевой вход'
      };
    }
  }

  /**
   * Выход пользователя
   */
  static async signOut(): Promise<AuthResult> {
    try {
      LoggingService.info('Попытка выхода пользователя');

      const { error } = await supabase.auth.signOut();

      if (error) {
        throw error;
      }

      LoggingService.info('Успешный выход пользователя');

      return {
        success: true,
        user: null,
        message: 'Выход выполнен успешно'
      };

    } catch (error: any) {
      LoggingService.error('Ошибка выхода пользователя', error);

      return {
        success: false,
        error: ErrorHandler.handleAuthError(error),
        message: 'Не удалось выполнить выход'
      };
    }
  }

  /**
   * Восстановление пароля
   */
  static async resetPassword(email: string): Promise<AuthResult> {
    try {
      LoggingService.info('Запрос восстановления пароля', { email });

      const validation = ValidationService.validateEmail(email);
      if (!validation.isValid) {
        throw new Error(validation.error);
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      });

      if (error) {
        throw error;
      }

      LoggingService.info('Письмо восстановления пароля отправлено', { email });

      return {
        success: true,
        user: null,
        message: 'Письмо для восстановления пароля отправлено на ваш email'
      };

    } catch (error: any) {
      LoggingService.error('Ошибка восстановления пароля', error, { email });

      return {
        success: false,
        error: ErrorHandler.handleAuthError(error),
        message: 'Не удалось отправить письмо восстановления'
      };
    }
  }

  /**
   * Получение текущего пользователя
   */
  static async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return null;
      }

      return await this.loadUserProfile(user);
    } catch (error) {
      LoggingService.error('Ошибка получения текущего пользователя', error);
      return null;
    }
  }

  /**
   * Проверка существования пользователя
   */
  private static async checkUserExists(email: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email.trim().toLowerCase())
        .single();

      return !error && !!data;
    } catch {
      return false;
    }
  }

  /**
   * Загрузка профиля пользователя
   */
  private static async loadUserProfile(authUser: any): Promise<User> {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (error || !profile) {
        // Создаем профиль если его нет
        return await this.createUserProfile(authUser);
      }

      return {
        id: profile.id,
        email: profile.email || authUser.email,
        name: profile.name,
        username: profile.username,
        avatar_url: profile.avatar_url,
        bio: profile.bio,
        privacy_settings: profile.privacy_settings,
        is_guest: profile.is_guest,
        email_verified: profile.email_verified,
        interests: profile.interests,
        created_at: profile.created_at
      };
    } catch (error) {
      LoggingService.error('Ошибка загрузки профиля', error, { userId: authUser.id });
      return await this.createUserProfile(authUser);
    }
  }

  /**
   * Создание профиля пользователя
   */
  private static async createUserProfile(authUser: any): Promise<User> {
    const profile = {
      id: authUser.id,
      email: authUser.email,
      name: authUser.user_metadata?.full_name || authUser.email || 'Пользователь',
      username: authUser.user_metadata?.username || 
               authUser.email?.split('@')[0] || 
               `user_${authUser.id.substring(0, 8)}`,
      avatar_url: authUser.user_metadata?.avatar_url,
      privacy_settings: 'public',
      is_guest: authUser.is_anonymous || false,
      email_verified: !!authUser.email_confirmed_at,
      created_at: authUser.created_at || new Date().toISOString()
    };

    try {
      await supabase.from('profiles').upsert(profile);
    } catch (error) {
      LoggingService.error('Ошибка создания профиля', error, { userId: authUser.id });
    }

    return profile;
  }

  /**
   * Создание гостевого профиля
   */
  private static async createGuestProfile(userId: string, guestName?: string): Promise<User> {
    const name = guestName?.trim() || `Гость_${Math.random().toString(36).substring(7)}`;
    const username = name.toLowerCase().replace(/\s+/g, '_');

    const profile = {
      id: userId,
      email: null,
      name,
      username,
      privacy_settings: 'public',
      is_guest: true,
      email_verified: false,
      created_at: new Date().toISOString()
    };

    try {
      await supabase.from('profiles').upsert(profile);
    } catch (error) {
      LoggingService.error('Ошибка создания гостевого профиля', error, { userId });
    }

    return profile;
  }

  /**
   * Обновление статистики входа
   */
  private static async updateLoginStats(userId: string): Promise<void> {
    try {
      await supabase.rpc('update_login_stats', { user_id: userId });
    } catch (error) {
      LoggingService.error('Ошибка обновления статистики входа', error, { userId });
    }
  }

  /**
   * Проверка блокировки пользователя
   */
  private static isBlocked(email: string): boolean {
    const attempts = this.loginAttempts.get(email);
    if (!attempts) return false;

    const now = Date.now();
    const timeSinceLastAttempt = now - attempts.lastAttempt;

    // Сбрасываем счетчик если прошло достаточно времени
    if (timeSinceLastAttempt > this.LOCKOUT_DURATION) {
      this.loginAttempts.delete(email);
      return false;
    }

    return attempts.count >= this.MAX_LOGIN_ATTEMPTS;
  }

  /**
   * Запись неудачной попытки входа
   */
  private static recordFailedAttempt(email: string): void {
    const now = Date.now();
    const attempts = this.loginAttempts.get(email) || { count: 0, lastAttempt: now };
    
    attempts.count++;
    attempts.lastAttempt = now;
    
    this.loginAttempts.set(email, attempts);
  }

  /**
   * Очистка неудачных попыток
   */
  private static clearFailedAttempts(email: string): void {
    this.loginAttempts.delete(email);
  }
}