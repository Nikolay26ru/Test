/**
 * Эталонный провайдер авторизации
 * Обеспечивает надежную и безопасную авторизацию
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { AuthService } from '../../lib/auth/AuthService';
import { GuestService } from '../../lib/guest/GuestService';
import { LoggingService } from '../../lib/logging/LoggingService';
import { ErrorHandler } from '../../lib/error/ErrorHandler';
import type { AuthContextType, User, LoginCredentials, RegisterCredentials, AuthResult } from '../../types/auth';

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth должен использоваться внутри AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const EnhancedAuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  /**
   * Инициализация провайдера
   */
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        LoggingService.info('Инициализация AuthProvider');

        // Проверяем текущую сессию Supabase
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          LoggingService.error('Ошибка получения сессии', error);
        } else if (session?.user) {
          LoggingService.info('Найдена существующая сессия', { userId: session.user.id });
          const currentUser = await AuthService.getCurrentUser();
          setUser(currentUser);
        } else {
          // Проверяем гостевую сессию
          const guestSession = GuestService.getGuestSession();
          if (guestSession) {
            LoggingService.info('Найдена гостевая сессия', { userId: guestSession.user.id });
            setUser(guestSession.user);
          }
        }

        setInitialized(true);
      } catch (error) {
        LoggingService.error('Ошибка инициализации авторизации', error);
        ErrorHandler.showToast('Ошибка инициализации авторизации', 'error');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  /**
   * Подписка на изменения авторизации
   */
  useEffect(() => {
    if (!initialized) return;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        LoggingService.info('Изменение состояния авторизации', { event, userId: session?.user?.id });

        try {
          if (session?.user) {
            const currentUser = await AuthService.getCurrentUser();
            setUser(currentUser);
          } else if (event === 'SIGNED_OUT') {
            // Проверяем гостевую сессию после выхода
            const guestSession = GuestService.getGuestSession();
            setUser(guestSession?.user || null);
          }
        } catch (error) {
          LoggingService.error('Ошибка обработки изменения авторизации', error);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [initialized]);

  /**
   * Вход с email и паролем
   */
  const signInWithEmail = useCallback(async (credentials: LoginCredentials): Promise<AuthResult> => {
    setLoading(true);
    try {
      const result = await AuthService.signInWithEmail(credentials);
      
      if (result.success && result.user) {
        setUser(result.user);
        LoggingService.userAction('email_login', result.user.id);
      }
      
      return result;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Регистрация с email и паролем
   */
  const signUpWithEmail = useCallback(async (credentials: RegisterCredentials): Promise<AuthResult> => {
    setLoading(true);
    try {
      const result = await AuthService.signUpWithEmail(credentials);
      
      if (result.success) {
        LoggingService.userAction('email_registration', undefined, { email: credentials.email });
      }
      
      return result;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Вход через Google
   */
  const signInWithGoogle = useCallback(async (): Promise<AuthResult> => {
    setLoading(true);
    try {
      const result = await AuthService.signInWithGoogle();
      
      if (result.success) {
        LoggingService.userAction('google_login');
      }
      
      return result;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Гостевой вход
   */
  const signInAsGuest = useCallback(async (guestName?: string): Promise<AuthResult> => {
    setLoading(true);
    try {
      const result = await AuthService.signInAsGuest(guestName);
      
      if (result.success && result.user) {
        setUser(result.user);
        LoggingService.userAction('guest_login', result.user.id, { guestName });
      }
      
      return result;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Выход
   */
  const signOut = useCallback(async (): Promise<AuthResult> => {
    setLoading(true);
    try {
      const currentUserId = user?.id;
      const result = await AuthService.signOut();
      
      if (result.success) {
        // Очищаем гостевую сессию если была
        if (user?.is_guest) {
          GuestService.clearGuestSession();
        }
        
        setUser(null);
        LoggingService.userAction('logout', currentUserId);
      }
      
      return result;
    } finally {
      setLoading(false);
    }
  }, [user]);

  /**
   * Восстановление пароля
   */
  const resetPassword = useCallback(async (email: string): Promise<AuthResult> => {
    try {
      const result = await AuthService.resetPassword(email);
      
      if (result.success) {
        LoggingService.userAction('password_reset_request', undefined, { email });
      }
      
      return result;
    } catch (error: any) {
      LoggingService.error('Ошибка восстановления пароля', error);
      return {
        success: false,
        error: error.message,
        message: 'Не удалось отправить запрос восстановления'
      };
    }
  }, []);

  /**
   * Обновление профиля
   */
  const updateProfile = useCallback(async (updates: Partial<User>): Promise<AuthResult> => {
    if (!user) {
      return {
        success: false,
        error: 'Пользователь не авторизован',
        message: 'Необходимо войти в систему'
      };
    }

    try {
      if (user.is_guest) {
        // Обновляем гостевой профиль
        const success = GuestService.updateGuestUser(updates);
        
        if (success) {
          const updatedUser = { ...user, ...updates };
          setUser(updatedUser);
          LoggingService.userAction('guest_profile_update', user.id, { updates: Object.keys(updates) });
          
          return {
            success: true,
            user: updatedUser,
            message: 'Профиль обновлен'
          };
        } else {
          throw new Error('Не удалось обновить гостевой профиль');
        }
      } else {
        // Обновляем обычный профиль
        const { error } = await supabase
          .from('profiles')
          .update({
            ...updates,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id);

        if (error) {
          throw error;
        }

        const updatedUser = { ...user, ...updates };
        setUser(updatedUser);
        LoggingService.userAction('profile_update', user.id, { updates: Object.keys(updates) });

        return {
          success: true,
          user: updatedUser,
          message: 'Профиль обновлен'
        };
      }
    } catch (error: any) {
      LoggingService.error('Ошибка обновления профиля', error, { userId: user.id });
      return {
        success: false,
        error: ErrorHandler.handleSupabaseError(error, 'profile update'),
        message: 'Не удалось обновить профиль'
      };
    }
  }, [user]);

  const contextValue: AuthContextType = {
    user,
    loading,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signInAsGuest,
    signOut,
    resetPassword,
    updateProfile
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};