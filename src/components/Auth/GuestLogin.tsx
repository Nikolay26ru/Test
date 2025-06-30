import React, { useState } from 'react';
import { UserX, ArrowRight } from 'lucide-react';
import { useAuth } from './EnhancedAuthProvider';

interface GuestLoginProps {
  onSuccess: () => void;
}

export const GuestLogin: React.FC<GuestLoginProps> = ({ onSuccess }) => {
  const { signInAsGuest } = useAuth();
  const [loading, setLoading] = useState(false);
  const [guestName, setGuestName] = useState('');

  const handleGuestSignIn = async () => {
    setLoading(true);
    try {
      await signInAsGuest(guestName);
      onSuccess();
    } catch (error) {
      console.error('Ошибка гостевого входа:', error);
      alert('Не удалось войти как гость. Попробуйте еще раз.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
      <div className="text-center mb-4">
        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <UserX className="h-6 w-6 text-gray-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Войти как гость
        </h3>
        <p className="text-sm text-gray-600">
          Попробуйте WishFlick без регистрации
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Как вас называть? (необязательно)
          </label>
          <input
            type="text"
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            placeholder="Введите имя или оставьте пустым"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            maxLength={50}
            disabled={loading}
          />
        </div>

        <button
          onClick={handleGuestSignIn}
          disabled={loading}
          className="w-full bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
          ) : (
            <>
              <span>Продолжить как гость</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>

        <div className="text-xs text-gray-500 space-y-1">
          <p>• Ваши данные будут сохранены локально</p>
          <p>• Вы сможете создавать списки и получать рекомендации</p>
          <p>• Для полного доступа рекомендуем зарегистрироваться</p>
          <p>• Гостевая сессия действует 24 часа</p>
        </div>
      </div>
    </div>
  );
};