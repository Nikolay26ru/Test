import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authApi } from '../api/auth';
import type { User, AuthContextType } from '../types';
import { supabase } from '../lib/supabase';

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

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  // Инициализация
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const currentUser = await authApi.getCurrentUser();
        setUser(currentUser);
        setInitialized(true);
      } catch (error) {
        console.error('Ошибка инициализации авторизации:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Подписка на изменения авторизации
  useEffect(() => {
    if (!initialized) return;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event);

        try {
          if (session?.user) {
            const currentUser = await authApi.loadUserProfile(session.user);
            setUser(currentUser);
          } else if (event === 'SIGNED_OUT') {
            setUser(null);
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

  const signInWithGoogle = useCallback(async () => {
    const result = await authApi.signInWithGoogle();
    if (!result.success) {
      throw new Error(result.error);
    }
  }, []);

  const signInAsGuest = useCallback(async (guestName?: string) => {
    const result = await authApi.signInAsGuest();
    if (!result.success) {
      throw new Error(result.error);
    }
    if (result.data) {
      if (guestName) {
        result.data.name = guestName;
      }
      setUser(result.data);
    }
  }, []);

  const signOut = useCallback(async () => {
    const result = await authApi.signOut();
    if (!result.success) {
      throw new Error(result.error);
    }
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (updates: Partial<User>): Promise<boolean> => {
    if (!user) return false;

    try {
      if (user.is_guest) {
        // Для гостей обновляем локально
        setUser({ ...user, ...updates });
        return true;
      } else {
        // Для обычных пользователей обновляем в БД
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

        setUser({ ...user, ...updates });
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