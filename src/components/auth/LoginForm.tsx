import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Mail, Lock, LogIn, Eye, EyeOff } from 'lucide-react';
import { loginSchema } from '../../lib/validation';
import { authApi, type LoginCredentials } from '../../api/auth';
import toast from 'react-hot-toast';

interface LoginFormProps {
  onSuccess: () => void;
  onSwitchToRegister: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSuccess,
  onSwitchToRegister
}) => {
  const [showPassword, setShowPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginCredentials>({
    resolver: yupResolver(loginSchema)
  });

  const onSubmit = async (data: LoginCredentials) => {
    setLoading(true);
    try {
      const result = await authApi.signInWithEmail(data);
      
      if (result.success) {
        toast.success('Добро пожаловать!');
        onSuccess();
      } else {
        toast.error(result.error || 'Ошибка входа');
      }
    } catch (error: any) {
      toast.error(error.message || 'Ошибка входа');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200">
      <div className="text-center mb-6">
        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <LogIn className="h-6 w-6 text-blue-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Вход в аккаунт
        </h3>
        <p className="text-sm text-gray-600">
          Войдите в свой существующий аккаунт
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              {...register('email')}
              type="email"
              className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
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
            Пароль
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              {...register('password')}
              type={showPassword ? 'text' : 'password'}
              className={`w-full pl-10 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                errors.password ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Ваш пароль"
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

        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
          ) : (
            <>
              <LogIn className="h-4 w-4" />
              <span>Войти</span>
            </>
          )}
        </button>
      </form>

      <div className="mt-4 text-center">
        <button
          onClick={onSwitchToRegister}
          disabled={loading}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors disabled:opacity-50"
        >
          Нет аккаунта? Зарегистрироваться
        </button>
      </div>
    </div>
  );
};