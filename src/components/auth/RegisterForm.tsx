import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Mail, Lock, User, UserPlus, Eye, EyeOff } from 'lucide-react';
import { registerSchema } from '../../lib/validation';
import { authApi, type RegisterCredentials } from '../../api/auth';
import toast from 'react-hot-toast';

interface RegisterFormProps {
  onSuccess: () => void;
  onSwitchToLogin: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({
  onSuccess,
  onSwitchToLogin
}) => {
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<RegisterCredentials & { confirmPassword: string }>({
    resolver: yupResolver(registerSchema)
  });

  const onSubmit = async (data: RegisterCredentials & { confirmPassword: string }) => {
    setLoading(true);
    try {
      const result = await authApi.signUpWithEmail(data);
      
      if (result.success) {
        toast.success('Регистрация успешна! Проверьте email для подтверждения.');
        onSuccess();
      } else {
        toast.error(result.error || 'Ошибка регистрации');
      }
    } catch (error: any) {
      toast.error(error.message || 'Ошибка регистрации');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200">
      <div className="text-center mb-6">
        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <UserPlus className="h-6 w-6 text-green-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Создать аккаунт
        </h3>
        <p className="text-sm text-gray-600">
          Зарегистрируйтесь для полного доступа
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Имя *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                {...register('name')}
                type="text"
                className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
                  errors.name ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Ваше имя"
                disabled={loading}
              />
            </div>
            {errors.name && (
              <p className="text-red-600 text-xs mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Имя пользователя
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">@</span>
              <input
                {...register('username')}
                type="text"
                className={`w-full pl-8 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
                  errors.username ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="username"
                disabled={loading}
              />
            </div>
            {errors.username && (
              <p className="text-red-600 text-xs mt-1">{errors.username.message}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email *
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              {...register('email')}
              type="email"
              className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
                errors.email ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="your@email.com"
              disabled={loading}
            />
          </div>
          {errors.email && (
            <p className="text-red-600 text-xs mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Пароль *
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              {...register('password')}
              type={showPassword ? 'text' : 'password'}
              className={`w-full pl-10 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
                errors.password ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Минимум 6 символов"
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              disabled={loading}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-red-600 text-xs mt-1">{errors.password.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Подтвердите пароль *
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              {...register('confirmPassword')}
              type={showConfirmPassword ? 'text' : 'password'}
              className={`w-full pl-10 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
                errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Повторите пароль"
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              disabled={loading}
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-red-600 text-xs mt-1">{errors.confirmPassword.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
          ) : (
            <>
              <UserPlus className="h-4 w-4" />
              <span>Зарегистрироваться</span>
            </>
          )}
        </button>
      </form>

      <div className="mt-4 text-center">
        <button
          onClick={onSwitchToLogin}
          disabled={loading}
          className="text-sm text-green-600 hover:text-green-700 font-medium transition-colors disabled:opacity-50"
        >
          Уже есть аккаунт? Войти
        </button>
      </div>
    </div>
  );
};