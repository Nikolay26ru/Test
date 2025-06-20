import React, { useState } from 'react';
import { Header } from './components/Header';
import { FeedPage } from './pages/FeedPage';
import { WishlistsPage } from './pages/WishlistsPage';
import { ProfilePage } from './pages/ProfilePage';
import { ErrorBoundary } from './components/ErrorBoundary';

function App() {
  const [activeTab, setActiveTab] = useState('feed');

  const renderCurrentPage = () => {
    switch (activeTab) {
      case 'feed':
        return <FeedPage />;
      case 'wishlists':
        return <WishlistsPage />;
      case 'profile':
        return <ProfilePage />;
      default:
        return <FeedPage />;
    }
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-neutral-50">
        <Header activeTab={activeTab} onTabChange={setActiveTab} />
        <main className="pb-8 transition-all duration-300">
          {renderCurrentPage()}
        </main>
        
        {/* Enhanced Footer */}
        <footer className="bg-white border-t border-neutral-200 py-8 mt-12">
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    {/* Enhanced Gift box with gradient */}
                    <div className="w-8 h-8 relative">
                      {/* Box base */}
                      <div className="w-6 h-5 bg-gradient-to-br from-primary to-accent rounded-lg absolute bottom-0 left-1 shadow-sm"></div>
                      {/* Box lid */}
                      <div className="w-6 h-1.5 bg-gradient-to-br from-primary to-accent rounded-t-lg absolute top-1.5 left-1 shadow-sm"></div>
                      {/* Ribbon vertical */}
                      <div className="w-0.5 h-6 bg-gradient-to-b from-primary to-accent absolute top-1 left-1/2 transform -translate-x-1/2"></div>
                      {/* Ribbon horizontal */}
                      <div className="w-6 h-0.5 bg-gradient-to-r from-primary to-accent absolute top-3 left-1"></div>
                      {/* Bow */}
                      <div className="absolute -top-0.5 left-1/2 transform -translate-x-1/2">
                        <div className="w-2 h-1.5 bg-gradient-to-br from-primary to-accent rounded-full shadow-sm"></div>
                        <div className="w-0.5 h-0.5 bg-gradient-to-br from-accent to-primary rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
                      </div>
                      {/* Heart in center */}
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 mt-0.5">
                        <div className="w-2 h-2 bg-white rounded-full flex items-center justify-center shadow-sm">
                          <div className="w-1 h-1 bg-gradient-to-br from-secondary to-accent rounded-full"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <span className="text-xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                    WishFlick
                  </span>
                </div>
                <p className="text-neutral-600 text-sm leading-relaxed">
                  Социальная платформа для исполнения желаний. 
                  Мечтайте, делитесь, воплощайте в жизнь!
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold text-neutral-900 mb-3">Продукт</h4>
                <ul className="space-y-2 text-sm text-neutral-600">
                  <li><a href="#" className="hover:text-primary transition-colors hover:underline">Как это работает</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors hover:underline">Безопасность</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors hover:underline">Мобильное приложение</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors hover:underline">API</a></li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-neutral-900 mb-3">Сообщество</h4>
                <ul className="space-y-2 text-sm text-neutral-600">
                  <li><a href="#" className="hover:text-primary transition-colors hover:underline">Блог</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors hover:underline">Истории успеха</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors hover:underline">Помощь</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors hover:underline">Контакты</a></li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-neutral-900 mb-3">Компания</h4>
                <ul className="space-y-2 text-sm text-neutral-600">
                  <li><a href="#" className="hover:text-primary transition-colors hover:underline">О нас</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors hover:underline">Карьера</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors hover:underline">Пресса</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors hover:underline">Партнерство</a></li>
                </ul>
              </div>
            </div>
            
            <div className="mt-8 pt-8 border-t border-neutral-200 flex flex-col md:flex-row justify-between items-center">
              <p className="text-neutral-600 text-sm">
                © 2024 WishFlick. Все права защищены.
              </p>
              <div className="flex items-center space-x-6 mt-4 md:mt-0">
                <a href="#" className="text-neutral-600 hover:text-primary transition-colors text-sm hover:underline">
                  Политика конфиденциальности
                </a>
                <a href="#" className="text-neutral-600 hover:text-primary transition-colors text-sm hover:underline">
                  Условия использования
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </ErrorBoundary>
  );
}

export default App;