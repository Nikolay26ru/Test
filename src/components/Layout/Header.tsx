import React from 'react';
import { Gift, Heart, User, LogOut, Plus } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface HeaderProps {
  onCreateWishlist: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onCreateWishlist }) => {
  const { user, signOut } = useAuth();

  return (
    <header className="bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
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
            <a href="#" className="text-gray-700 hover:text-purple-600 transition-colors font-medium">
              Мои списки
            </a>
            <a href="#" className="text-gray-700 hover:text-purple-600 transition-colors font-medium">
              Популярное
            </a>
            <a href="#" className="text-gray-700 hover:text-purple-600 transition-colors font-medium">
              Друзья
            </a>
          </nav>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            <button
              onClick={onCreateWishlist}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Создать список</span>
            </button>

            {user && (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
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
                  <span className="hidden sm:inline text-sm font-medium text-gray-700">
                    {user.name}
                  </span>
                </div>
                <button
                  onClick={signOut}
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