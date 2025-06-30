import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { ErrorHandler } from '../lib/error/ErrorHandler';
import { LoggingService } from '../lib/logging/LoggingService';
import type { AuthContextType, User } from '../types';

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signInWithGoogle: async () => {},
  signOut: async () => {}
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    LoggingService.info('AuthProvider: Инициализация состояния авторизации');
    
    // Проверяем текущую сессию Supabase
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        LoggingService.error('AuthProvider: Ошибка получения сессии', error);
        ErrorHandler.logError(error, { operation: 'get_session' });
        setLoading(false);
        return;
      }

      if (session?.user) {
        LoggingService.info('AuthProvider: Найдена существующая сессия', { userId: session.user.id });
        loadUserProfile(session.user);
      } else {
        LoggingService.info('AuthProvider: Существующая сессия не найдена');
        setLoading(false);
      }
    });

    // Слушаем изменения авторизации
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        LoggingService.info('AuthProvider: Изменение состояния авторизации', { event });
        
        if (session?.user) {
          LoggingService.info('AuthProvider: Пользователь вошел в систему', { userId: session.user.id });
          await loadUserProfile(session.user);
        } else if (event === 'SIGNED_OUT') {
          LoggingService.info('AuthProvider: Пользователь вышел из системы');
          setUser(null);
          setLoading(false);
        }
      }
    );

    return () => {
      LoggingService.info('AuthProvider: Очистка подписки на изменения авторизации');
      subscription.unsubscribe();
    };
  }, []);

  const loadUserProfile = async (authUser: any) => {
    LoggingService.info('AuthProvider: Загрузка профиля пользователя', { userId: authUser.id });
    
    // Устанавливаем таймаут на весь процесс
    const timeoutId = setTimeout(() => {
      LoggingService.warn('AuthProvider: Таймаут загрузки профиля, используем fallback');
      const fallbackUser = createFallbackUser(authUser);
      setUser(fallbackUser);
      setLoading(false);
    }, 8000);

    try {
      // Сразу создаем fallback пользователя
      const fallbackUser = createFallbackUser(authUser);
      
      LoggingService.info('AuthProvider: Попытка загрузки профиля из базы данных');
      
      // Пытаемся загрузить профиль с коротким таймаутом
      const profilePromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      // Ждем максимум 5 секунд
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Database timeout')), 5000);
      });

      try {
        const { data: profile, error } = await Promise.race([profilePromise, timeoutPromise]) as any;
        
        if (profile && !error) {
          LoggingService.info('AuthProvider: Профиль загружен из базы данных', { name: profile.name });
          clearTimeout(timeoutId);
          setUser(profile);
          setLoading(false);
          return;
        }

        if (error?.code === 'PGRST116') {
          LoggingService.info('AuthProvider: Профиль не найден, создаем новый');
          // Пытаемся создать профиль, но не ждем долго
          const createPromise = supabase
            .from('profiles')
            .insert(fallbackUser)
            .select()
            .single();

          const createTimeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Create timeout')), 3000);
          });

          try {
            const { data: newProfile } = await Promise.race([createPromise, createTimeoutPromise]) as any;
            if (newProfile) {
              LoggingService.info('AuthProvider: Профиль успешно создан');
              clearTimeout(timeoutId);
              setUser(newProfile);
              setLoading(false);
              return;
            }
          } catch (createError) {
            LoggingService.warn('AuthProvider: Не удалось создать профиль, используем fallback');
            ErrorHandler.logError(createError, { operation: 'create_profile', userId: authUser.id });
          }
        }
      } catch (dbError) {
        LoggingService.warn('AuthProvider: Операция с базой данных не удалась', dbError);
        ErrorHandler.logError(dbError, { operation: 'load_profile', userId: authUser.id });
      }

      // Если дошли сюда - используем fallback
      LoggingService.info('AuthProvider: Используем fallback данные пользователя');
      clearTimeout(timeoutId);
      setUser(fallbackUser);
      setLoading(false);

    } catch (error) {
      LoggingService.error('AuthProvider: Критическая ошибка в loadUserProfile', error);
      ErrorHandler.logError(error, { operation: 'load_user_profile', userId: authUser.id });
      clearTimeout(timeoutId);
      const fallbackUser = createFallbackUser(authUser);
      setUser(fallbackUser);
      setLoading(false);
    }
  };

  const createFallbackUser = (authUser: any): User => {
    LoggingService.info('AuthProvider: Создание fallback пользователя');
    return {
      id: authUser.id,
      email: authUser.email || '',
      name: authUser.user_metadata?.full_name || authUser.email || 'Пользователь',
      avatar_url: authUser.user_metadata?.avatar_url,
      username: authUser.user_metadata?.username || 
               authUser.email?.split('@')[0] || 
               `user_${authUser.id.substring(0, 8)}`,
      privacy_settings: 'public',
      is_guest: authUser.is_anonymous || false,
      created_at: authUser.created_at || new Date().toISOString()
    };
  };

  const signInWithGoogle = async () => {
    LoggingService.info('AuthProvider: Начало входа через Google');
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
      
      if (error) {
        LoggingService.error('AuthProvider: Ошибка входа через Google', error);
        ErrorHandler.logError(error, { operation: 'google_signin' });
        ErrorHandler.showToast(ErrorHandler.handleAuthError(error), 'error');
        throw error;
      }
      
      LoggingService.info('AuthProvider: Вход через Google инициирован');
    } catch (error) {
      LoggingService.error('AuthProvider: Ошибка в signInWithGoogle', error);
      ErrorHandler.logError(error, { operation: 'google_signin' });
      throw error;
    }
  };

  const signOut = async () => {
    LoggingService.info('AuthProvider: Начало выхода из системы');
    
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        LoggingService.error('AuthProvider: Ошибка выхода из системы', error);
        ErrorHandler.logError(error, { operation: 'signout' });
        ErrorHandler.showToast(ErrorHandler.handleAuthError(error), 'error');
        throw error;
      }
      LoggingService.info('AuthProvider: Успешный выход из системы');
      ErrorHandler.showToast('Вы успешно вышли из системы', 'success');
    } catch (error) {
      LoggingService.error('AuthProvider: Ошибка в signOut', error);
      ErrorHandler.logError(error, { operation: 'signout' });
      throw error;
    }
  };

  const value = {
    user,
    loading,
    signInWithGoogle,
    signOut
  };

  LoggingService.debug('AuthProvider: Рендеринг с состоянием', { 
    hasUser: !!user, 
    loading, 
    userName: user?.name,
    isGuest: user?.is_guest 
  });

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};