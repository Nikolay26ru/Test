import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Gift, Heart, User, LogOut, Plus, Users, Sparkles, UserCheck } from 'lucide-react';
import { useAuth } from '../Auth/EnhancedAuthProvider';

interface HeaderProps {
  onCreateWishlist: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onCreateWishlist }) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [showUpgradePrompt, setShowUpgradePrompt] = React.useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/auth');
    } catch (error) {
      console.error('Ошибка выхода:', error);
    }
  };

  const handleUpgradeAccount = () => {
    // Перенаправляем на страницу регистрации для гостей
    navigate('/auth?mode=register');
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div 
            className="flex items-center space-x-3 cursor-pointer"
            onClick={() => navigate('/')}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-teal-500 rounded-xl flex items-center justify-center">
              <Gift className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-teal-500 bg-clip-text text-transparent">
                WishFlick
              </h1>
              <p className="text-xs text-gray-500">Списки желаний</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <button 
              onClick={() => navigate('/')}
              className="text-gray-700 hover:text-purple-600 transition-colors font-medium"
            >
              Мои списки
            </button>
            {!user?.is_guest && (
              <>
                <button 
                  onClick={() => navigate('/friends')}
                  className="text-gray-700 hover:text-purple-600 transition-colors font-medium flex items-center space-x-1"
                >
                  <Users className="h-4 w-4" />
                  <span>Друзья</span>
                </button>
                <button 
                  onClick={() => navigate('/recommendations')}
                  className="text-gray-700 hover:text-purple-600 transition-colors font-medium flex items-center space-x-1"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>Рекомендации</span>
                </button>
              </>
            )}
          </nav>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {/* Guest Upgrade Prompt */}
            {user?.is_guest && (
              <div className="relative">
                <button
                  onClick={() => setShowUpgradePrompt(!showUpgradePrompt)}
                  className="bg-gradient-to-r from-purple-600 to-teal-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1 hover:from-purple-700 hover:to-teal-600 transition-all"
                >
                  <UserCheck className="h-3 w-3" />
                  <span>Создать аккаунт</span>
                </button>
                
                {showUpgradePrompt && (
                  <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50">
                    <div className="text-sm">
                      <h4 className="font-semibold text-gray-900 mb-2">
                        Создайте полноценный аккаунт
                      </h4>
                      <p className="text-gray-600 mb-3">
                        Сохраните свои данные навсегда и получите доступ ко всем функциям
                      </p>
                      <div className="space-y-2 text-xs text-gray-500 mb-3">
                        <p>✓ Синхронизация между устройствами</p>
                        <p>✓ Расширенные настройки приватности</p>
                        <p>✓ Полный доступ к социальным функциям</p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setShowUpgradePrompt(false)}
                          className="flex-1 px-3 py-1 text-gray-600 border border-gray-300 rounded text-xs hover:bg-gray-50"
                        >
                          Позже
                        </button>
                        <button
                          onClick={handleUpgradeAccount}
                          className="flex-1 px-3 py-1 bg-purple-600 text-white rounded text-xs hover:bg-purple-700"
                        >
                          Создать
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            <button
              onClick={onCreateWishlist}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Создать список</span>
            </button>

            {user && (
              <div className="flex items-center space-x-3">
                <div 
                  className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 rounded-lg p-2 transition-colors"
                  onClick={() => navigate('/profile')}
                >
                  {user.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.name}
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-purple-600" />
                    </div>
                  )}
                  <div className="hidden sm:block">
                    <span className="text-sm font-medium text-gray-700">
                      {user.name}
                    </span>
                    {user.is_guest && (
                      <span className="block text-xs text-orange-600">Гость</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={handleSignOut}
                  className="text-gray-500 hover:text-gray-700 transition-colors p-2"
                  title="Выйти"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};