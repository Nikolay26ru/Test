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
    
    // Получаем текущую сессию
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
        } else {
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
    
    try {
      // Сначала пытаемся загрузить существующий профиль
      console.log('🔍 AuthProvider: Checking for existing profile...');
      const { data: existingProfile, error: selectError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (existingProfile) {
        console.log('✅ AuthProvider: Found existing profile:', existingProfile.name);
        setUser(existingProfile);
        setLoading(false);
        return;
      }

      // Если профиль не найден, создаем новый
      if (selectError?.code === 'PGRST116') {
        console.log('🔧 AuthProvider: Profile not found, creating new one...');
        
        const newProfileData = {
          id: authUser.id,
          email: authUser.email || '',
          name: authUser.user_metadata?.full_name || authUser.email || 'Пользователь',
          username: authUser.user_metadata?.username || 
                   authUser.email?.split('@')[0] || 
                   `user_${authUser.id.substring(0, 8)}`,
          avatar_url: authUser.user_metadata?.avatar_url || null,
          privacy_settings: 'public',
          is_guest: authUser.is_anonymous || false
        };

        console.log('🔧 AuthProvider: Creating profile with data:', newProfileData);

        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert(newProfileData)
          .select()
          .single();

        if (insertError) {
          console.error('❌ AuthProvider: Error creating profile:', insertError);
          // Используем fallback данные
          const fallbackUser = createFallbackUser(authUser);
          setUser(fallbackUser);
          console.log('⚠️ AuthProvider: Using fallback user data');
        } else {
          console.log('✅ AuthProvider: Profile created successfully:', newProfile.name);
          setUser(newProfile);
        }
      } else {
        console.error('❌ AuthProvider: Unexpected error loading profile:', selectError);
        // Используем fallback данные
        const fallbackUser = createFallbackUser(authUser);
        setUser(fallbackUser);
        console.log('⚠️ AuthProvider: Using fallback user data due to error');
      }
    } catch (error) {
      console.error('❌ AuthProvider: Critical error in loadUserProfile:', error);
      // Последний fallback
      const fallbackUser = createFallbackUser(authUser);
      setUser(fallbackUser);
      console.log('⚠️ AuthProvider: Using emergency fallback');
    } finally {
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
    userName: user?.name 
  });

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};