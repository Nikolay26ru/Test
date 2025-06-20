import React, { useState, useEffect } from 'react';
import { Settings, Plus, Grid, List, Calendar, Award } from 'lucide-react';
import { UserProfile } from '../components/UserProfile';
import { GiftCard } from '../components/GiftCard';
import { WishlistCard } from '../components/WishlistCard';
import { SkeletonLoader } from '../components/SkeletonLoader';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { currentUser, giftItems, wishlists } from '../data/mockData';

export const ProfilePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'wishlists' | 'contributions' | 'achievements'>('wishlists');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const myWishlists = wishlists.filter(w => w.user.id === currentUser.id);
  const myContributions = giftItems.filter(g => g.contributors > 0);

  // Симуляция загрузки данных профиля
  useEffect(() => {
    const loadProfileData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Симуляция задержки сети
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Здесь будет реальная загрузка данных профиля из Supabase
        // const { data, error } = await supabase.from('users').select('*').eq('id', currentUser.id);
        
        setIsLoading(false);
      } catch (err) {
        setError('Ошибка при загрузке профиля');
        setIsLoading(false);
      }
    };

    loadProfileData();
  }, []);

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="text-center py-12">
          <div className="bg-red-50 rounded-xl p-8 max-w-md mx-auto">
            <h3 className="text-lg font-semibold text-red-900 mb-2">
              Ошибка загрузки профиля
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
          {/* Profile Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <UserProfile user={currentUser} isOwnProfile={true} isLoading={isLoading} />
            
            {/* Quick Stats */}
            {isLoading ? (
              <div className="bg-white rounded-xl shadow-md p-4 animate-pulse">
                <div className="h-5 bg-neutral-200 rounded w-32 mb-4"></div>
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex justify-between">
                      <div className="h-4 bg-neutral-200 rounded w-24"></div>
                      <div className="h-4 bg-neutral-200 rounded w-8"></div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-md p-4 animate-fade-in">
                <h3 className="text-lg font-semibold text-neutral-900 mb-4">
                  Ваша активность
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-600">Вишлистов создано:</span>
                    <span className="font-semibold text-neutral-900">3</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-600">Желаний добавлено:</span>
                    <span className="font-semibold text-neutral-900">12</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-600">Поддержано проектов:</span>
                    <span className="font-semibold text-neutral-900">24</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-600">Потрачено на подарки:</span>
                    <span className="font-semibold text-neutral-900">45,670 ₽</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Header */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                <h1 className="text-2xl font-bold text-neutral-900">
                  Мой профиль
                </h1>
                <button className="mt-2 sm:mt-0 bg-gradient-to-r from-primary to-accent text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all duration-200 flex items-center space-x-2 hover:scale-105">
                  <Plus className="w-4 h-4" />
                  <span>Создать вишлист</span>
                </button>
              </div>

              {/* Tabs */}
              <div className="flex items-center space-x-1 bg-neutral-100 p-1 rounded-lg">
                {[
                  { id: 'wishlists', label: 'Мои вишлисты', icon: Grid },
                  { id: 'contributions', label: 'Мои взносы', icon: Calendar },
                  { id: 'achievements', label: 'Достижения', icon: Award },
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-all duration-200 ${
                        activeTab === tab.id
                          ? 'bg-white text-primary shadow-sm scale-105'
                          : 'text-neutral-600 hover:text-neutral-900 hover:scale-105'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Content */}
            {isLoading ? (
              <div className="space-y-6">
                <SkeletonLoader variant="card" count={2} />
              </div>
            ) : (
              <>
                {activeTab === 'wishlists' && (
                  <div className="space-y-6">
                    {myWishlists.length > 0 ? (
                      <div className="grid grid-cols-1 gap-6">
                        {myWishlists.map((wishlist, index) => (
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
                    ) : (
                      <div className="text-center py-12 animate-fade-in">
                        <div className="bg-neutral-50 rounded-xl p-8">
                          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Plus className="w-8 h-8 text-primary" />
                          </div>
                          <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                            У вас пока нет вишлистов
                          </h3>
                          <p className="text-neutral-600 mb-4">
                            Создайте свой первый список желаний и поделитесь им с друзьями
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'contributions' && (
                  <div className="space-y-6 animate-fade-in">
                    <div className="bg-white rounded-xl shadow-md p-6">
                      <h3 className="text-lg font-semibold text-neutral-900 mb-4">
                        Мои взносы
                      </h3>
                      <div className="space-y-4">
                        {myContributions.slice(0, 3).map((gift, index) => (
                          <div 
                            key={gift.id}
                            style={{ animationDelay: `${index * 100}ms` }}
                            className="flex items-center space-x-4 p-3 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors animate-fade-in"
                          >
                            <img
                              src={gift.imageUrl}
                              alt={gift.title}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                            <div className="flex-1">
                              <h4 className="font-medium text-neutral-900">{gift.title}</h4>
                              <p className="text-sm text-neutral-600">
                                Внесено: 2,500 ₽ • 5 дней назад
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-medium text-green-600">
                                +5 баллов
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'achievements' && (
                  <div className="space-y-6 animate-fade-in">
                    <div className="bg-white rounded-xl shadow-md p-6">
                      <h3 className="text-lg font-semibold text-neutral-900 mb-4">
                        Достижения
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[
                          {
                            title: 'Первый вишлист',
                            description: 'Создали свой первый список желаний',
                            icon: '🎯',
                            earned: true,
                          },
                          {
                            title: 'Щедрый друг',
                            description: 'Поддержали 10 желаний друзей',
                            icon: '💝',
                            earned: true,
                          },
                          {
                            title: 'Мечтатель',
                            description: 'Добавили 50 желаний',
                            icon: '✨',
                            earned: false,
                          },
                          {
                            title: 'Популярный',
                            description: 'Получили 100 лайков',
                            icon: '❤️',
                            earned: false,
                          },
                        ].map((achievement, index) => (
                          <div
                            key={index}
                            style={{ animationDelay: `${index * 100}ms` }}
                            className={`p-4 rounded-lg border-2 transition-all duration-200 hover:scale-105 animate-fade-in ${
                              achievement.earned
                                ? 'border-primary bg-primary/5'
                                : 'border-neutral-200 bg-neutral-50'
                            }`}
                          >
                            <div className="text-center">
                              <div className="text-2xl mb-2">{achievement.icon}</div>
                              <h4 className="font-semibold text-neutral-900 mb-1">
                                {achievement.title}
                              </h4>
                              <p className="text-sm text-neutral-600">
                                {achievement.description}
                              </p>
                              {achievement.earned && (
                                <div className="mt-2 text-xs text-primary font-medium">
                                  Получено!
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};