import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { LoadingSpinner } from '../ui/LoadingSpinner';

export const AuthCallback: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        if (data.session) {
          navigate('/', { replace: true });
        } else {
          navigate('/auth', { replace: true });
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        navigate('/auth', { replace: true });
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <LoadingSpinner size="lg" text="Завершаем авторизацию..." />
    </div>
  );
};