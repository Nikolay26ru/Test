import React, { useState } from 'react';
import { UserCheck, Mail, Lock, User, ArrowRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface GuestToFullRegistrationProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const GuestToFullRegistration: React.FC<GuestToFullRegistrationProps> = ({
  onSuccess,
  onCancel
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: user?.name || '',
    username: user?.username || ''
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email обязателен';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Неверный формат email';
    }

    if (!formData.password) {
      newErrors.password = 'Пароль обязателен';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Пароль должен содержать минимум 6 символов';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Пароли не совпадают';
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Имя обязательно';
    }

    if (!formData.username.trim()) {
      newErrors.username = 'Имя пользователя обязательно';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      const oldUserId = user?.id;
      
      // Создаем полноценный аккаунт
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.name,
            username: formData.username
          }
        }
      });

      if (authError) throw authError;

      if (authData.user && oldUserId) {
        // Обновляем профиль
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: authData.user.id,
            email: formData.email,
            name: formData.name,
            username: formData.username,
            is_guest: false,
            privacy_settings: 'public'
          });

        if (profileError) {
          console.warn('Profile update error:', profileError);
        }

        // Переносим данные гостя
        await transferGuestData(oldUserId, authData.user.id);

        onSuccess();
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      setErrors({ general: error.message || 'Ошибка регистрации' });
    } finally {
      setLoading(false);
    }
  };

  const transferGuestData = async (guestId: string, newUserId: string) => {
    try {
      console.log('🔄 Transferring guest data from', guestId, 'to', newUserId);
      
      // Переносим списки желаний
      const { error: wishlistsError } = await supabase
        .from('wishlists')
        .update({ user_id: newUserId })
        .eq('user_id', guestId);

      if (wishlistsError) {
        console.warn('Error transferring wishlists:', wishlistsError);
      }

      // Переносим интересы пользователя
      const { error: interestsError } = await supabase
        .from('user_interests')
        .update({ user_id: newUserId })
        .eq('user_id', guestId);

      if (interestsError) {
        console.warn('Error transferring interests:', interestsError);
      }

      // Переносим AI рекомендации
      const { error: aiError } = await supabase
        .from('ai_recommendations')
        .update({ user_id: newUserId })
        .eq('user_id', guestId);

      if (aiError) {
        console.warn('Error transferring AI recommendations:', aiError);
      }

      // Переносим просмотры товаров
      const { error: viewsError } = await supabase
        .from('product_views')
        .update({ user_id: newUserId })
        .eq('user_id', guestId);

      if (viewsError) {
        console.warn('Error transferring product views:', viewsError);
      }

      // Переносим рекомендации товаров
      const { error: recommendationsError } = await supabase
        .from('product_recommendations')
        .update({ user_id: newUserId })
        .eq('user_id', guestId);

      if (recommendationsError) {
        console.warn('Error transferring product recommendations:', recommendationsError);
      }

      // Удаляем старый профиль гостя
      const { error: deleteError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', guestId);

      if (deleteError) {
        console.warn('Error deleting old guest profile:', deleteError);
      }

      console.log('✅ Guest data transfer completed');
    } catch (error) {
      console.error('Error transferring guest data:', error);
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200 max-w-md mx-auto">
      <div className="text-center mb-6">
        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <UserCheck className="h-6 w-6 text-purple-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Создать полноценный аккаунт
        </h3>
        <p className="text-sm text-gray-600">
          Зарегистрируйтесь для сохранения данных и получения всех возможностей
        </p>
      </div>

      {errors.general && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <p className="text-red-700 text-sm">{errors.general}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email *
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                errors.email ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="your@email.com"
            />
          </div>
          {errors.email && <p className="text-red-600 text-xs mt-1">{errors.email}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Пароль *
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                errors.password ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Минимум 6 символов"
            />
          </div>
          {errors.password && <p className="text-red-600 text-xs mt-1">{errors.password}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Подтвердите пароль *
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Повторите пароль"
            />
          </div>
          {errors.confirmPassword && <p className="text-red-600 text-xs mt-1">{errors.confirmPassword}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Имя *
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                errors.name ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Ваше имя"
            />
          </div>
          {errors.name && <p className="text-red-600 text-xs mt-1">{errors.name}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Имя пользователя *
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">@</span>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })}
              className={`w-full pl-8 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                errors.username ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="username"
            />
          </div>
          {errors.username && <p className="text-red-600 text-xs mt-1">{errors.username}</p>}
        </div>

        <div className="flex space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Отмена
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
            ) : (
              <>
                <span>Зарегистрироваться</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </form>

      <div className="mt-4 text-xs text-gray-500 space-y-1">
        <p>• Ваши списки желаний и данные будут сохранены</p>
        <p>• Вы получите доступ ко всем функциям приложения</p>
        <p>• Данные будут синхронизированы между устройствами</p>
      </div>
    </div>
  );
};