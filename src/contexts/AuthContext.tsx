import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
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
    console.log('🔄 AuthProvider: Initializing auth state...');
    
    // Проверяем текущую сессию Supabase
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('❌ AuthProvider: Error getting session:', error);
        setLoading(false);
        return;
      }

      if (session?.user) {
        console.log('✅ AuthProvider: Found existing session for user:', session.user.id);
        loadUserProfile(session.user);
      } else {
        console.log('ℹ️ AuthProvider: No existing session found');
        setLoading(false);
      }
    });

    // Слушаем изменения авторизации
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 AuthProvider: Auth state changed:', event);
        
        if (session?.user) {
          console.log('✅ AuthProvider: User signed in:', session.user.id);
          await loadUserProfile(session.user);
        } else if (event === 'SIGNED_OUT') {
          console.log('ℹ️ AuthProvider: User signed out');
          setUser(null);
          setLoading(false);
        }
      }
    );

    return () => {
      console.log('🧹 AuthProvider: Cleaning up auth subscription');
      subscription.unsubscribe();
    };
  }, []);

  const loadUserProfile = async (authUser: any) => {
    console.log('🔍 AuthProvider: Loading profile for user:', authUser.id);
    
    // Устанавливаем таймаут на весь процесс
    const timeoutId = setTimeout(() => {
      console.warn('⏰ AuthProvider: Profile loading timeout, using fallback');
      const fallbackUser = createFallbackUser(authUser);
      setUser(fallbackUser);
      setLoading(false);
    }, 8000); // 8 секунд таймаут

    try {
      // Сразу создаем fallback пользователя
      const fallbackUser = createFallbackUser(authUser);
      
      console.log('🔍 AuthProvider: Attempting to load profile from database...');
      
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
          console.log('✅ AuthProvider: Profile loaded from database:', profile.name);
          clearTimeout(timeoutId);
          setUser(profile);
          setLoading(false);
          return;
        }

        if (error?.code === 'PGRST116') {
          console.log('🔧 AuthProvider: Profile not found, creating...');
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
              console.log('✅ AuthProvider: Profile created successfully');
              clearTimeout(timeoutId);
              setUser(newProfile);
              setLoading(false);
              return;
            }
          } catch (createError) {
            console.warn('⚠️ AuthProvider: Failed to create profile, using fallback');
          }
        }
      } catch (dbError) {
        console.warn('⚠️ AuthProvider: Database operation failed:', dbError);
      }

      // Если дошли сюда - используем fallback
      console.log('🔧 AuthProvider: Using fallback user data');
      clearTimeout(timeoutId);
      setUser(fallbackUser);
      setLoading(false);

    } catch (error) {
      console.error('❌ AuthProvider: Critical error in loadUserProfile:', error);
      clearTimeout(timeoutId);
      const fallbackUser = createFallbackUser(authUser);
      setUser(fallbackUser);
      setLoading(false);
    }
  };

  const createFallbackUser = (authUser: any): User => {
    console.log('🔧 AuthProvider: Creating fallback user');
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
    console.log('🔄 AuthProvider: Starting Google sign in...');
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
      
      if (error) {
        console.error('❌ AuthProvider: Google sign in error:', error);
        throw error;
      }
      
      console.log('✅ AuthProvider: Google sign in initiated');
    } catch (error) {
      console.error('❌ AuthProvider: Error in signInWithGoogle:', error);
      throw error;
    }
  };

  const signOut = async () => {
    console.log('🔄 AuthProvider: Signing out...');
    
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('❌ AuthProvider: Sign out error:', error);
        throw error;
      }
      console.log('✅ AuthProvider: Successfully signed out');
    } catch (error) {
      console.error('❌ AuthProvider: Error in signOut:', error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    signInWithGoogle,
    signOut
  };

  console.log('🔄 AuthProvider: Rendering with state:', { 
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