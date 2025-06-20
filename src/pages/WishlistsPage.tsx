import React, { useState, useEffect } from 'react';
import { Plus, Filter, Search, Grid, List } from 'lucide-react';
import { GiftCard } from '../components/GiftCard';
import { WishlistCard } from '../components/WishlistCard';
import { SkeletonLoader } from '../components/SkeletonLoader';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { giftItems, wishlists } from '../data/mockData';

export const WishlistsPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeTab, setActiveTab] = useState<'all' | 'my' | 'following'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Симуляция загрузки данных
  useEffect(() => {
    const loadWishlists = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Симуляция задержки сети
        await new Promise(resolve => setTimeout(resolve, 1200));
        
        // Здесь будет реальная загрузка данных из Supabase
        // const { data, error } = await supabase.from('wishlists').select('*');
        
        setIsLoading(false);
      } catch (err) {
        setError('Ошибка при загрузке вишлистов');
        setIsLoading(false);
      }
    };

    loadWishlists();
  }, [activeTab]);

  const handleContribute = (giftId: string) => {
    console.log('Contributing to gift:', giftId);
    // Здесь будет логика взноса через Supabase
  };

  const filteredItems = giftItems.filter(item => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="text-center py-12">
          <div className="bg-red-50 rounded-xl p-8 max-w-md mx-auto">
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
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900 mb-2">
                Списки желаний
              </h1>
              <p className="text-neutral-600">
                Откройте для себя удивительные желания и помогите их осуществить
              </p>
            </div>
            
            <button className="mt-4 sm:mt-0 bg-gradient-to-r from-primary to-accent text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all duration-200 flex items-center space-x-2 hover:scale-105">
              <Plus className="w-5 h-5" />
              <span>Создать вишлист</span>
            </button>
          </div>

          {/* Tabs */}
          <div className="flex items-center space-x-1 bg-neutral-100 p-1 rounded-lg mb-4">
            {[
              { id: 'all', label: 'Все' },
              { id: 'my', label: 'Мои' },
              { id: 'following', label: 'Подписки' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-md transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-white text-primary shadow-sm scale-105'
                    : 'text-neutral-600 hover:text-neutral-900 hover:scale-105'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input
                type="text"
                placeholder="Поиск по желаниям..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all duration-200"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <button className="flex items-center space-x-2 px-4 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-all duration-200 hover:scale-105">
                <Filter className="w-4 h-4" />
                <span>Фильтры</span>
              </button>
              
              <div className="flex items-center bg-neutral-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-all duration-200 ${
                    viewMode === 'grid' ? 'bg-white shadow-sm scale-105' : 'hover:bg-neutral-200'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-all duration-200 ${
                    viewMode === 'list' ? 'bg-white shadow-sm scale-105' : 'hover:bg-neutral-200'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="space-y-8">
            <section>
              <div className="h-6 bg-neutral-200 rounded w-48 mb-4 animate-pulse"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SkeletonLoader variant="wishlist" count={2} />
              </div>
            </section>
            <section>
              <div className="h-6 bg-neutral-200 rounded w-32 mb-4 animate-pulse"></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <SkeletonLoader variant="card" count={6} />
              </div>
            </section>
          </div>
        ) : (
          <>
            {activeTab === 'all' && (
              <div className="space-y-8">
                {/* Popular Wishlists */}
                <section className="animate-fade-in">
                  <h2 className="text-xl font-semibold text-neutral-900 mb-4">
                    Популярные вишлисты
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {wishlists.slice(0, 2).map((wishlist, index) => (
                      <div 
                        key={wishlist.id}
                        style={{ animationDelay: `${index * 100}ms` }}
                        className="animate-fade-in"
                      >
                        <WishlistCard
                          wishlist={wishlist}
                          onLike={() => console.log('Liked', wishlist.id)}
                          onView={() => console.log('Viewed', wishlist.id)}
                        />
                      </div>
                    ))}
                  </div>
                </section>

                {/* All Gifts */}
                <section className="animate-fade-in">
                  <h2 className="text-xl font-semibold text-neutral-900 mb-4">
                    Все желания
                  </h2>
                  <div className={viewMode === 'grid' 
                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                    : "space-y-4"
                  }>
                    {filteredItems.map((gift, index) => (
                      <div 
                        key={gift.id}
                        style={{ animationDelay: `${index * 50}ms` }}
                        className="animate-fade-in"
                      >
                        <GiftCard
                          gift={gift}
                          onContribute={() => handleContribute(gift.id)}
                        />
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            )}

            {activeTab === 'my' && (
              <div className="text-center py-12 animate-fade-in">
                <div className="bg-neutral-50 rounded-xl p-8 max-w-md mx-auto">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Plus className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                    У вас пока нет вишлистов
                  </h3>
                  <p className="text-neutral-600 mb-4">
                    Создайте свой первый список желаний и поделитесь им с друзьями
                  </p>
                  <button className="bg-gradient-to-r from-primary to-accent text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all duration-200 hover:scale-105">
                    Создать первый вишлист
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'following' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {wishlists.slice(1).map((wishlist, index) => (
                  <div 
                    key={wishlist.id}
                    style={{ animationDelay: `${index * 100}ms` }}
                    className="animate-fade-in"
                  >
                    <WishlistCard
                      wishlist={wishlist}
                      onLike={() => console.log('Liked', wishlist.id)}
                      onView={() => console.log('Viewed', wishlist.id)}
                    />
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </ErrorBoundary>
  );
};