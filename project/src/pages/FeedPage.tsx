import React, { useState } from 'react';
import { WishlistCard } from '../components/WishlistCard';
import { ActivityFeed } from '../components/ActivityFeed';
import { wishlists, activities } from '../data/mockData';

export const FeedPage: React.FC = () => {
  const [selectedWishlist, setSelectedWishlist] = useState<string | null>(null);

  const handleLike = (wishlistId: string) => {
    // Handle like action
    console.log('Liked wishlist:', wishlistId);
  };

  const handleViewWishlist = (wishlistId: string) => {
    setSelectedWishlist(wishlistId);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Feed */}
        <div className="lg:col-span-2 space-y-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-neutral-900 mb-2">
              Лента желаний
            </h1>
            <p className="text-neutral-600">
              Узнайте о мечтах друзей и помогите их осуществить
            </p>
          </div>

          <div className="space-y-6">
            {wishlists.map((wishlist) => (
              <WishlistCard
                key={wishlist.id}
                wishlist={wishlist}
                onLike={() => handleLike(wishlist.id)}
                onView={() => handleViewWishlist(wishlist.id)}
              />
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <ActivityFeed activities={activities} />
          
          {/* Trending Tags */}
          <div className="bg-white rounded-xl shadow-md p-4">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">
              Популярные теги
            </h3>
            <div className="flex flex-wrap gap-2">
              {['Техника', 'Путешествия', 'Образование', 'Спорт', 'Красота', 'Дом'].map((tag) => (
                <button
                  key={tag}
                  className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm hover:bg-primary/20 transition-colors"
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="bg-gradient-to-r from-primary to-accent text-white rounded-xl p-4">
            <h3 className="text-lg font-semibold mb-3">Статистика сообщества</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Активных пользователей:</span>
                <span className="font-semibold">12,534</span>
              </div>
              <div className="flex justify-between">
                <span>Исполненных желаний:</span>
                <span className="font-semibold">2,891</span>
              </div>
              <div className="flex justify-between">
                <span>Собрано средств:</span>
                <span className="font-semibold">45.2M ₽</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};