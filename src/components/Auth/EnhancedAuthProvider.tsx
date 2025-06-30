/**
 * Эталонный провайдер авторизации
 * Обеспечивает надежную и безопасную авторизацию
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { GuestService } from '../../lib/guest/GuestService';
import type { User } from '../../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInAsGuest: (guestName?: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<boolean>;
}

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
        console.log('🔄 Инициализация AuthProvider');

        // Проверяем текущую сессию Supabase
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Ошибка получения сессии:', error);
        } else if (session?.user) {
          console.log('✅ Найдена существующая сессия Supabase');
          const currentUser = await loadUserProfile(session.user);
          setUser(currentUser);
        } else {
          // Проверяем гостевую сессию
          const guestSession = GuestService.getGuestSession();
          if (guestSession) {
            console.log('✅ Найдена гостевая сессия');
            setUser({
              id: guestSession.user.id,
              email: '',
              name: guestSession.user.name,
              username: guestSession.user.username,
              is_guest: true,
              created_at: guestSession.user.created_at
            });
          }
        }

        setInitialized(true);
      } catch (error) {
        console.error('Ошибка инициализации авторизации:', error);
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
        console.log('🔄 Изменение состояния авторизации:', event);

        try {
          if (session?.user) {
            const currentUser = await loadUserProfile(session.user);
            setUser(currentUser);
          } else if (event === 'SIGNED_OUT') {
            // Проверяем гостевую сессию после выхода
            const guestSession = GuestService.getGuestSession();
            if (guestSession) {
              setUser({
                id: guestSession.user.id,
                email: '',
                name: guestSession.user.name,
                username: guestSession.user.username,
                is_guest: true,
                created_at: guestSession.user.created_at
              });
            } else {
              setUser(null);
            }
          }
        } catch (error) {
          console.error('Ошибка обработки изменения авторизации:', error);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [initialized]);

  /**
   * Загрузка профиля пользователя
   */
  const loadUserProfile = async (authUser: any): Promise<User> => {
    try {
      console.log('🔄 Загрузка профиля пользователя');
      
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Ошибка загрузки профиля:', error);
      }

      if (profile) {
        console.log('✅ Профиль загружен из базы данных');
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
      } else {
        // Создаем fallback пользователя
        console.log('⚠️ Профиль не найден, создаем fallback');
        return createFallbackUser(authUser);
      }
    } catch (error) {
      console.error('Ошибка в loadUserProfile:', error);
      return createFallbackUser(authUser);
    }
  };

  const createFallbackUser = (authUser: any): User => {
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

  /**
   * Вход через Google
   */
  const signInWithGoogle = useCallback(async () => {
    try {
      console.log('🔄 Начало входа через Google');
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
      
      if (error) {
        console.error('Ошибка входа через Google:', error);
        throw error;
      }
      
      console.log('✅ Вход через Google инициирован');
    } catch (error) {
      console.error('Ошибка в signInWithGoogle:', error);
      throw error;
    }
  }, []);

  /**
   * Гостевой вход
   */
  const signInAsGuest = useCallback(async (guestName?: string) => {
    try {
      console.log('🔄 Начало гостевого входа');
      
      const guestSession = GuestService.createGuestSession(guestName);
      
      setUser({
        id: guestSession.user.id,
        email: '',
        name: guestSession.user.name,
        username: guestSession.user.username,
        is_guest: true,
        created_at: guestSession.user.created_at
      });

      console.log('✅ Гостевой вход выполнен');
    } catch (error) {
      console.error('Ошибка гостевого входа:', error);
      throw error;
    }
  }, []);

  /**
   * Выход
   */
  const signOut = useCallback(async () => {
    try {
      console.log('🔄 Начало выхода из системы');
      
      if (user?.is_guest) {
        // Очищаем гостевую сессию
        GuestService.clearGuestSession();
      } else {
        // Выходим из Supabase
        const { error } = await supabase.auth.signOut();
        if (error) {
          console.error('Ошибка выхода из Supabase:', error);
          throw error;
        }
      }
      
      setUser(null);
      console.log('✅ Выход выполнен успешно');
    } catch (error) {
      console.error('Ошибка в signOut:', error);
      throw error;
    }
  }, [user]);

  /**
   * Обновление профиля
   */
  const updateProfile = useCallback(async (updates: Partial<User>): Promise<boolean> => {
    if (!user) return false;

    try {
      if (user.is_guest) {
        // Обновляем гостевой профиль
        const success = GuestService.updateGuestUser(updates);
        
        if (success) {
          const updatedUser = { ...user, ...updates };
          setUser(updatedUser);
          return true;
        }
        return false;
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
          console.error('Ошибка обновления профиля:', error);
          return false;
        }

        const updatedUser = { ...user, ...updates };
        setUser(updatedUser);
        return true;
      }
    } catch (error) {
      console.error('Ошибка в updateProfile:', error);
      return false;
    }
  }, [user]);

  const contextValue: AuthContextType = {
    user,
    loading,
    signInWithGoogle,
    signInAsGuest,
    signOut,
    updateProfile
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};