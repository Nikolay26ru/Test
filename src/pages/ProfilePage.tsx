import React, { useState, useEffect } from 'react';
import { Settings, Plus, Grid, List, Calendar, Award } from 'lucide-react';
import { UserProfile } from '../components/UserProfile';
import { GiftCard } from '../components/GiftCard';
import { WishlistCard } from '../components/WishlistCard';
import { SkeletonLoader } from '../components/SkeletonLoader';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { currentUser, giftItems, wishlists } from '../data/mockData';

export const ProfilePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'gifts' | 'achievements' | 'stats'>('gifts');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [giftItemsState, setGiftItemsState] = useState(giftItems);
  const [showedGifts, setShowedGifts] = useState(6);
  const [wishlistsState, setWishlistsState] = useState(wishlists.filter(w => w.user.id === currentUser.id));
  const [showModal, setShowModal] = useState(false);
  const [modalWishlist, setModalWishlist] = useState<any>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newWishlist, setNewWishlist] = useState({ title: '', description: '' });

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        await new Promise(resolve => setTimeout(resolve, 900));
        setIsLoading(false);
      } catch (err) {
        setError('Ошибка при загрузке профиля');
        setIsLoading(false);
      }
    };
    loadData();
  }, [activeTab]);

  const handleLikeGift = (giftId: string) => {
    setGiftItemsState(prev => prev.map(g => g.id === giftId ? { ...g, isLiked: !g.isLiked, likes: g.likes ? g.likes + (g.isLiked ? -1 : 1) : (g.isLiked ? 0 : 1) } : g));
  };
  const handleContribute = (giftId: string) => {
    setGiftItemsState(prev => prev.map(g => g.id === giftId ? { ...g, currentAmount: g.currentAmount + 1000, contributors: g.contributors + 1, isCompleted: g.currentAmount + 1000 >= g.goalAmount ? true : g.isCompleted } : g));
  };
  const handleShowMoreGifts = () => {
    setShowedGifts(prev => prev + 6);
  };

  const myWishlists = wishlistsState;
  const myContributions = giftItems.filter(g => g.contributors > 0);

  // Открытие модалки просмотра вишлиста
  const handleViewWishlist = (wishlist: any) => {
    setModalWishlist(wishlist);
    setShowModal(true);
  };

  // Открытие модалки редактирования
  const handleOpenEditModal = () => {
    if (modalWishlist) {
      setEditForm({
        title: modalWishlist.title,
        description: modalWishlist.description || '',
      });
      setShowEditModal(true);
      setShowModal(false);
    }
  };

  // Сохранение изменений вишлиста
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm.title.trim()) return;
    setWishlistsState(prev => prev.map(w =>
      w.id === modalWishlist.id
        ? { ...w, title: editForm.title, description: editForm.description }
        : w
    ));
    setShowEditModal(false);
    setModalWishlist({ ...modalWishlist, ...editForm });
    setShowModal(true);
  };

  // Открытие модалки удаления
  const handleOpenDeleteModal = () => {
    setShowDeleteModal(true);
    setShowModal(false);
  };

  // Удаление вишлиста
  const handleDeleteWishlist = () => {
    setWishlistsState(prev => prev.filter(w => w.id !== modalWishlist.id));
    setShowDeleteModal(false);
    setModalWishlist(null);
    setShowModal(false);
  };

  // Открытие модалки создания
  const handleOpenCreateModal = () => {
    setShowCreateModal(true);
    setNewWishlist({ title: '', description: '' });
  };

  // Закрытие всех модалок
  const handleCloseModal = () => {
    setShowModal(false);
    setModalWishlist(null);
    setShowCreateModal(false);
    setShowEditModal(false);
    setShowDeleteModal(false);
  };

  // Сохранение нового вишлиста
  const handleCreateWishlist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWishlist.title.trim()) return;
    const newId = (wishlistsState.length + 1).toString();
    setWishlistsState(prev => [
      { id: newId, title: newWishlist.title, description: newWishlist.description, user: { id: currentUser.id, name: currentUser.name }, items: [], likes: 0, isLiked: false },
      ...prev
    ]);
    setShowCreateModal(false);
    setNewWishlist({ title: '', description: '' });
  };

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
                  Профиль
                </h1>
                <button
                  className="flex items-center gap-2 bg-gradient-to-r from-primary to-accent text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all duration-200 hover:scale-105"
                  onClick={handleOpenCreateModal}
                >
                  <Plus className="w-4 h-4" />
                  <span>Создать вишлист</span>
                </button>
              </div>

              {/* Tabs */}
              <div className="flex items-center space-x-1 bg-neutral-100 p-1 rounded-lg mb-6">
                {[
                  { id: 'gifts', label: 'Подарки' },
                  { id: 'achievements', label: 'Достижения' },
                  { id: 'stats', label: 'Статистика' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'bg-white text-primary shadow'
                        : 'text-neutral-600 hover:bg-white hover:text-primary'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Content */}
            {isLoading ? (
              <div className="space-y-6">
                <SkeletonLoader variant="card" count={2} />
              </div>
            ) : (
              <>
                {activeTab === 'gifts' && (
                  <>
                    <div className="mb-4 flex items-center justify-between">
                      <h2 className="text-xl font-semibold text-neutral-900">Мои вишлисты</h2>
                      <button
                        className="bg-gradient-to-r from-primary to-accent text-white px-4 py-1 rounded-lg hover:shadow-lg transition-all duration-200 hover:scale-105 text-sm"
                        onClick={handleOpenCreateModal}
                      >
                        + Новый вишлист
                      </button>
                    </div>
                    <div className={viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 gap-6" : "space-y-4"}>
                      {myWishlists.length === 0 ? (
                        <div className="col-span-2 text-center text-neutral-400 py-16">У вас пока нет вишлистов</div>
                      ) : (
                        myWishlists.map((wishlist, index) => (
                          <div
                            key={wishlist.id}
                            style={{ animationDelay: `${index * 50}ms` }}
                            className="animate-fade-in"
                          >
                            <WishlistCard
                              wishlist={wishlist}
                              onLike={() => {}}
                              onView={() => handleViewWishlist(wishlist)}
                            />
                          </div>
                        ))
                      )}
                    </div>
                  </>
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
    {/* Модалка просмотра подробностей вишлиста */}
    {showModal && modalWishlist && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
        <div className="bg-white rounded-xl shadow-xl p-8 max-w-lg w-full relative animate-fade-in">
          <button onClick={handleCloseModal} className="absolute top-2 right-2 text-neutral-400 hover:text-neutral-700 text-2xl">×</button>
          <h2 className="text-2xl font-bold mb-2">{modalWishlist.title}</h2>
          <p className="mb-4 text-neutral-600">{modalWishlist.description}</p>
          <div className="mb-4">
            <strong>Пользователь:</strong> {modalWishlist.user?.name}
          </div>
          <div className="mb-4">
            <strong>Желания:</strong>
            <ul className="list-disc pl-5">
              {modalWishlist.items?.length ? (
                modalWishlist.items.map((item: any) => (
                  <li key={item.id}>{item.title} — {item.goalAmount}₽</li>
                ))
              ) : (
                <li className="text-neutral-400">Нет желаний</li>
              )}
            </ul>
          </div>
          <div className="flex justify-between gap-2 mt-6">
            <div>
              <button onClick={handleOpenEditModal} className="bg-yellow-400 text-white px-4 py-2 rounded-lg hover:bg-yellow-500 transition-colors mr-2">Редактировать</button>
              <button onClick={handleOpenDeleteModal} className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors">Удалить</button>
            <div className="mb-4">
              <label className="block mb-1 text-sm font-medium">Название</label>
              <input
                type="text"
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                value={newWishlist.title}
                onChange={e => setNewWishlist(nw => ({ ...nw, title: e.target.value }))}
                required
                maxLength={40}
              />
            </div>
            <div className="mb-4">
              <label className="block mb-1 text-sm font-medium">Описание</label>
              <textarea
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary min-h-[60px]"
                value={newWishlist.description}
                onChange={e => setNewWishlist(nw => ({ ...nw, description: e.target.value }))}
                maxLength={200}
              />
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={handleCloseModal} className="bg-neutral-200 text-neutral-700 px-4 py-2 rounded-lg hover:bg-neutral-300">Отмена</button>
              <button type="submit" className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-accent transition-colors">Создать</button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};