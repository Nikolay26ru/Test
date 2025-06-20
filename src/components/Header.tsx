import React, { useState } from 'react';
import { Heart, User, Plus, Search, Menu, X, Gift } from 'lucide-react';
import { currentUser } from '../data/mockData';
import { OptimizedImage } from './OptimizedImage';
import { generateAvatar } from '../utils/imageUtils';

interface HeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, onTabChange }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { id: 'feed', label: 'Лента', icon: Heart },
    { id: 'wishlists', label: 'Вишлисты', icon: Gift },
    { id: 'profile', label: 'Профиль', icon: User },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm border-b border-neutral-200">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="relative">
              {/* Enhanced Gift box with gradient */}
              <div className="w-10 h-10 relative">
                {/* Box base */}
                <div className="w-8 h-6 bg-gradient-to-br from-primary to-accent rounded-lg absolute bottom-0 left-1 shadow-sm"></div>
                {/* Box lid */}
                <div className="w-8 h-2 bg-gradient-to-br from-primary to-accent rounded-t-lg absolute top-2 left-1 shadow-sm"></div>
                {/* Ribbon vertical */}
                <div className="w-1 h-8 bg-gradient-to-b from-primary to-accent absolute top-1 left-1/2 transform -translate-x-1/2"></div>
                {/* Ribbon horizontal */}
                <div className="w-8 h-1 bg-gradient-to-r from-primary to-accent absolute top-4 left-1"></div>
                {/* Bow */}
                <div className="absolute -top-1 left-1/2 transform -translate-x-1/2">
                  <div className="w-3 h-2 bg-gradient-to-br from-primary to-accent rounded-full shadow-sm"></div>
                  <div className="w-1 h-1 bg-gradient-to-br from-accent to-primary rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
                </div>
                {/* Heart in center */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 mt-1">
                  <Heart className="w-3 h-3 text-white fill-current drop-shadow-sm" />
                </div>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                WishFlick
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                    activeTab === item.id
                      ? 'bg-primary/10 text-primary scale-105'
                      : 'text-neutral-600 hover:text-primary hover:bg-neutral-50 hover:scale-105'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Поиск..."
                className="pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none w-64 transition-all duration-200 focus:w-72"
              />
            </div>
            
            <button className="bg-gradient-to-r from-primary to-accent text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all duration-200 flex items-center space-x-2 hover:scale-105 active:scale-95">
              <Plus className="w-4 h-4" />
              <span>Создать</span>
            </button>
            
            <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-neutral-200 hover:border-primary transition-colors">
              <OptimizedImage
                src={currentUser.avatar || generateAvatar(currentUser.name, 32)}
                alt={currentUser.name}
                className="w-full h-full object-cover"
                showLoader={false}
              />
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-neutral-100 transition-colors"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden pb-4 animate-slide-up">
            <div className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onTabChange(item.id);
                      setIsMenuOpen(false);
                    }}
                    className={`flex items-center w-full space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      activeTab === item.id
                        ? 'bg-primary/10 text-primary'
                        : 'text-neutral-600 hover:bg-neutral-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}
            </div>
            
            <div className="mt-4 pt-4 border-t border-neutral-200 space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Поиск..."
                  className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                />
              </div>
              
              <button className="w-full bg-gradient-to-r from-primary to-accent text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all duration-200 flex items-center justify-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>Создать вишлист</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};