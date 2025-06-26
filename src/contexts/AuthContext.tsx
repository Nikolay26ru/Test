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
      // Сначала пытаемся создать профиль если его нет
      await ensureProfileExists(authUser);
      
      // Затем загружаем профиль
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (error) {
        console.error('❌ AuthProvider: Error loading profile:', error);
        // Fallback к данным из auth
        const fallbackUser = createFallbackUser(authUser);
        setUser(fallbackUser);
        console.log('⚠️ AuthProvider: Using fallback user data');
      } else {
        console.log('✅ AuthProvider: Profile loaded successfully:', profile.name);
        setUser(profile);
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

  const ensureProfileExists = async (authUser: any) => {
    console.log('🔧 AuthProvider: Ensuring profile exists for:', authUser.id);
    
    try {
      const profileData = {
        id: authUser.id,
        email: authUser.email,
        name: authUser.user_metadata?.full_name || authUser.email || 'Пользователь',
        username: authUser.user_metadata?.username || 
                 authUser.email?.split('@')[0] || 
                 `user_${authUser.id.substring(0, 8)}`,
        avatar_url: authUser.user_metadata?.avatar_url,
        privacy_settings: 'public',
        is_guest: authUser.is_anonymous || false
      };

      const { error } = await supabase
        .from('profiles')
        .upsert(profileData, { 
          onConflict: 'id',
          ignoreDuplicates: false 
        });

      if (error) {
        console.error('❌ AuthProvider: Error upserting profile:', error);
      } else {
        console.log('✅ AuthProvider: Profile ensured for:', profileData.name);
      }
    } catch (error) {
      console.error('❌ AuthProvider: Error in ensureProfileExists:', error);
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
      created_at: authUser.created_at
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