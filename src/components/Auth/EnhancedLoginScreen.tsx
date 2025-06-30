import React, { useState } from 'react';
import { Gift, Heart, Star, Users, Sparkles } from 'lucide-react';
import { useAuth } from './EnhancedAuthProvider';
import { GuestLogin } from './GuestLogin';
import { EmailPasswordLogin } from './EmailPasswordLogin';

export const EnhancedLoginScreen: React.FC = () => {
  const { signInWithGoogle, user } = useAuth();
  const [authMode, setAuthMode] = useState<'main' | 'guest' | 'email'>('main');
  const [loading, setLoading] = useState(false);

  const features = [
    {
      icon: Gift,
      title: "Создавайте списки желаний",
      description: "Организуйте свои мечты в красивые списки"
    },
    {
      icon: Sparkles,
      title: "AI-рекомендации",
      description: "Получайте персональные советы от искусственного интеллекта"
    },
    {
      icon: Heart,
      title: "Краудфандинг мечты",
      description: "Собирайте средства на дорогие покупки вместе с друзьями"
    },
    {
      icon: Users,
      title: "Делитесь с близкими",
      description: "Покажите друзьям и семье, что вам действительно нужно"
    }
  ];

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Ошибка входа через Google:', error);
      alert('Не удалось войти через Google. Попробуйте еще раз.');
    } finally {
      setLoading(false);
    }
  };

  const handleAuthSuccess = () => {
    // Перезагружаем страницу для обновления состояния
    window.location.href = '/';
  };

  // Если пользователь уже авторизован, перенаправляем
  if (user) {
    window.location.href = '/';
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-teal-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-teal-500 rounded-2xl flex items-center justify-center">
              <Gift className="h-8 w-8 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-teal-500 bg-clip-text text-transparent">
                WishFlick
              </h1>
              <p className="text-gray-600">Ваши желания в одном месте</p>
            </div>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Добро пожаловать в мир желаний
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Создавайте, делитесь и исполняйте свои мечты с помощью AI и поддержки сообщества
          </p>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Features */}
            <div className="space-y-8">
              <div className="grid grid-cols-1 gap-6">
                {features.map((feature, index) => (
                  <div
                    key={index}
                    className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <feature.icon className="h-6 w-6 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">
                          {feature.title}
                        </h3>
                        <p className="text-gray-600 text-sm">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* New Features Badge */}
              <div className="bg-gradient-to-r from-purple-600 to-teal-500 rounded-xl p-6 text-white">
                <div className="flex items-center space-x-2 mb-3">
                  <Sparkles className="h-5 w-5" />
                  <span className="font-semibold">Новые возможности</span>
                </div>
                <ul className="space-y-2 text-sm">
                  <li>• Умные рекомендации от GigaChat AI</li>
                  <li>• Краудфандинг для дорогих покупок</li>
                  <li>• Гостевой режим без регистрации</li>
                  <li>• Расширенные настройки приватности</li>
                </ul>
              </div>
            </div>

            {/* Auth Options */}
            <div className="space-y-6">
              {authMode === 'main' && (
                <>
                  {/* Google Login */}
                  <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                    <div className="text-center mb-6">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        Полный доступ
                      </h3>
                      <p className="text-gray-600">
                        Войдите через Google для всех возможностей
                      </p>
                    </div>

                    <button
                      onClick={handleGoogleSignIn}
                      disabled={loading}
                      className="w-full bg-white border-2 border-gray-200 text-gray-700 py-4 px-6 rounded-xl hover:border-purple-300 hover:bg-purple-50 transition-all duration-200 flex items-center justify-center space-x-3 font-medium mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600" />
                      ) : (
                        <>
                          <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path
                              fill="currentColor"
                              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                              fill="currentColor"
                              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                              fill="currentColor"
                              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            />
                            <path
                              fill="currentColor"
                              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            />
                          </svg>
                          <span>Войти через Google</span>
                        </>
                      )}
                    </button>

                    <div className="text-center space-y-2">
                      <button
                        onClick={() => setAuthMode('email')}
                        disabled={loading}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium block w-full disabled:opacity-50"
                      >
                        Войти через email и пароль
                      </button>
                      <button
                        onClick={() => setAuthMode('guest')}
                        disabled={loading}
                        className="text-sm text-purple-600 hover:text-purple-700 font-medium disabled:opacity-50"
                      >
                        Или попробовать как гость
                      </button>
                    </div>
                  </div>
                </>
              )}

              {authMode === 'email' && (
                <EmailPasswordLogin
                  onSuccess={handleAuthSuccess}
                  onSwitchToRegister={() => {}}
                />
              )}

              {authMode === 'guest' && (
                <GuestLogin onSuccess={handleAuthSuccess} />
              )}

              {/* Back Button */}
              {authMode !== 'main' && (
                <div className="text-center">
                  <button
                    onClick={() => setAuthMode('main')}
                    disabled={loading}
                    className="text-sm text-gray-600 hover:text-gray-700 font-medium disabled:opacity-50"
                  >
                    ← Назад к выбору входа
                  </button>
                </div>
              )}

              {/* Privacy Notice */}
              <div className="text-center">
                <p className="text-xs text-gray-500">
                  Продолжая, вы соглашаетесь с нашими условиями использования и политикой конфиденциальности
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-16 text-center">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="text-3xl font-bold text-purple-600 mb-2">15K+</div>
              <div className="text-gray-600">Списков создано</div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="text-3xl font-bold text-teal-600 mb-2">8K+</div>
              <div className="text-gray-600">Активных пользователей</div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="text-3xl font-bold text-orange-600 mb-2">2.5M ₽</div>
              <div className="text-gray-600">Собрано краудфандингом</div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="text-3xl font-bold text-green-600 mb-2">AI</div>
              <div className="text-gray-600">Умные рекомендации</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};