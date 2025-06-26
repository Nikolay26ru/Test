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
      console.log('🔍 AuthProvider: Initial session check', { session: !!session, error });
      
      if (error) {
        console.error('❌ AuthProvider: Session error:', error);
        setLoading(false);
        return;
      }

      if (session?.user) {
        console.log('✅ AuthProvider: Found existing session, loading profile...');
        loadUserProfile(session.user);
      } else {
        console.log('ℹ️ AuthProvider: No existing session found');
        setLoading(false);
      }
    });

    // Слушаем изменения авторизации
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 AuthProvider: Auth state changed', { event, session: !!session });
        
        if (session?.user) {
          console.log('✅ AuthProvider: User signed in, loading profile...');
          await loadUserProfile(session.user);
        } else {
          console.log('❌ AuthProvider: User signed out');
          setUser(null);
          setLoading(false);
        }
      }
    );

    return () => {
      console.log('🧹 AuthProvider: Cleaning up subscription');
      subscription.unsubscribe();
    };
  }, []);

  const loadUserProfile = async (authUser: any) => {
    console.log('🔄 AuthProvider: Loading profile for user:', authUser.id);
    
    try {
      setLoading(true);
      
      // Пытаемся загрузить профиль из таблицы profiles
      console.log('🔍 AuthProvider: Querying profiles table...');
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      console.log('📊 AuthProvider: Profile query result', { profile: !!profile, error });

      if (error && error.code !== 'PGRST116') {
        console.error('❌ AuthProvider: Profile query error:', error);
        throw error;
      }

      // Если профиль не найден, создаем его
      if (!profile) {
        console.log('➕ AuthProvider: Profile not found, creating new one...');
        
        const newProfile = {
          id: authUser.id,
          email: authUser.email,
          name: authUser.user_metadata?.full_name || authUser.email || 'Пользователь',
          username: authUser.user_metadata?.username || authUser.email?.split('@')[0] || `user_${authUser.id.substring(0, 8)}`,
          avatar_url: authUser.user_metadata?.avatar_url,
          privacy_settings: 'public',
          is_guest: authUser.is_anonymous || false
        };

        console.log('📝 AuthProvider: Creating profile with data:', newProfile);

        const { data: createdProfile, error: createError } = await supabase
          .from('profiles')
          .insert(newProfile)
          .select()
          .single();

        if (createError) {
          console.error('❌ AuthProvider: Profile creation error:', createError);
          // Fallback к данным из auth
          console.log('🔄 AuthProvider: Using fallback auth data');
          setUser({
            id: authUser.id,
            email: authUser.email || '',
            name: authUser.user_metadata?.full_name || authUser.email || 'Пользователь',
            avatar_url: authUser.user_metadata?.avatar_url,
            created_at: authUser.created_at,
            is_guest: authUser.is_anonymous || false
          });
        } else {
          console.log('✅ AuthProvider: Profile created successfully');
          setUser(createdProfile);
        }
      } else {
        console.log('✅ AuthProvider: Profile loaded successfully');
        setUser(profile);
      }
    } catch (error) {
      console.error('❌ AuthProvider: Error in loadUserProfile:', error);
      
      // Fallback к данным из auth
      console.log('🔄 AuthProvider: Using fallback auth data due to error');
      setUser({
        id: authUser.id,
        email: authUser.email || '',
        name: authUser.user_metadata?.full_name || authUser.email || 'Пользователь',
        avatar_url: authUser.user_metadata?.avatar_url,
        created_at: authUser.created_at,
        is_guest: authUser.is_anonymous || false
      });
    } finally {
      console.log('🏁 AuthProvider: Profile loading completed');
      setLoading(false);
    }
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
      console.error('❌ AuthProvider: Google sign in failed:', error);
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
      
      console.log('✅ AuthProvider: Signed out successfully');
    } catch (error) {
      console.error('❌ AuthProvider: Sign out failed:', error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    signInWithGoogle,
    signOut
  };

  console.log('🎯 AuthProvider: Current state', { 
    hasUser: !!user, 
    loading, 
    userId: user?.id 
  });

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};