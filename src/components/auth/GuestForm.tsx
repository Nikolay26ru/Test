import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { UserX, ArrowRight } from 'lucide-react';
import { guestSchema } from '../../lib/validation';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

interface GuestFormProps {
  onSuccess: () => void;
}

interface GuestFormData {
  name?: string;
}

export const GuestForm: React.FC<GuestFormProps> = ({ onSuccess }) => {
  const { signInAsGuest } = useAuth();
  const [loading, setLoading] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<GuestFormData>({
    resolver: yupResolver(guestSchema)
  });

  const onSubmit = async (data: GuestFormData) => {
    setLoading(true);
    try {
      await signInAsGuest(data.name);
      toast.success('Добро пожаловать, гость!');
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || 'Ошибка гостевого входа');
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

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Как вас называть? (необязательно)
          </label>
          <input
            {...register('name')}
            type="text"
            placeholder="Введите имя или оставьте пустым"
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors ${
              errors.name ? 'border-red-300' : 'border-gray-300'
            }`}
            disabled={loading}
          />
          {errors.name && (
            <p className="text-red-600 text-xs mt-1">{errors.name.message}</p>
          )}
        </div>

        <button
          type="submit"
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
          <p>• Ваши данные будут сохранены в браузере</p>
          <p>• Вы сможете создавать списки и получать рекомендации</p>
          <p>• Для полного доступа рекомендуем зарегистрироваться</p>
          <p>• Гостевая сессия действует до закрытия браузера</p>
        </div>
      </form>
    </div>
  );
};