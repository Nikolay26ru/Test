import React, { useState, useEffect } from 'react';
import { WishlistCard } from '../components/WishlistCard';
import { ActivityFeed } from '../components/ActivityFeed';
import { SkeletonLoader } from '../components/SkeletonLoader';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { wishlists, activities } from '../data/mockData';

export const FeedPage: React.FC = () => {
  const [selectedWishlist, setSelectedWishlist] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Симуляция загрузки данных
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Симуляция задержки сети
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Здесь будет реальная загрузка данных из Supabase
        // const { data, error } = await supabase.from('wishlists').select('*');
        
        setIsLoading(false);
      } catch (err) {
        setError('Ошибка при загрузке данных');
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const handleLike = (wishlistId: string) => {
    console.log('Liked wishlist:', wishlistId);
    // Здесь будет логика лайка через Supabase
  };

  const handleViewWishlist = (wishlistId: string) => {
    setSelectedWishlist(wishlistId);
    console.log('Viewing wishlist:', wishlistId);
  };

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="text-center py-12">
          <div className="bg-red-50 rounded-xl p-8 max-w-md mx-auto">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-red-500 text-2xl">⚠️</span>
            </div>
            <h3 className="text-lg font-semibold text-red-900 mb-2">
              Ошибка загрузки
            </h3>
            <p className="text-red-700 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
            >
              Попробовать снова
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Feed */}
          <div className="lg:col-span-2 space-y-6">
            <div className="text-center mb-8 animate-fade-in">
              <h1 className="text-3xl font-bold text-neutral-900 mb-2">
                Лента желаний
              </h1>
              <p className="text-neutral-600">
                Узнайте о мечтах друзей и помогите их осуществить
              </p>
            </div>

            <div className="space-y-6">
              {isLoading ? (
                <SkeletonLoader variant="wishlist" count={3} />
              ) : (
                wishlists.map((wishlist, index) => (
                  <div 
                    key={wishlist.id}
                    style={{ animationDelay: `${index * 100}ms` }}
                    className="animate-fade-in"
                  >
                    <WishlistCard
                      wishlist={wishlist}
                      onLike={() => handleLike(wishlist.id)}
                      onView={() => handleViewWishlist(wishlist.id)}
                    />
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <ActivityFeed activities={activities} isLoading={isLoading} />
            
            {/* Trending Tags */}
            <div className="bg-white rounded-xl shadow-md p-4 animate-fade-in">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">
                Популярные теги
              </h3>
              <div className="flex flex-wrap gap-2">
                {['Техника', 'Путешествия', 'Образование', 'Спорт', 'Красота', 'Дом'].map((tag, index) => (
                  <button
                    key={tag}
                    style={{ animationDelay: `${index * 50}ms` }}
                    className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm hover:bg-primary/20 transition-all duration-200 hover:scale-105 animate-fade-in"
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="bg-gradient-to-r from-primary to-accent text-white rounded-xl p-4 animate-fade-in">
              <h3 className="text-lg font-semibold mb-3">Статистика сообщества</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span>Активных пользователей:</span>
                  <span className="font-semibold">12,534</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Исполненных желаний:</span>
                  <span className="font-semibold">2,891</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Собрано средств:</span>
                  <span className="font-semibold">45.2M ₽</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};