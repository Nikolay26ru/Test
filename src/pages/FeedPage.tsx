import React, { useState, useEffect } from 'react';
import { WishlistCard } from '../components/WishlistCard';
import { ActivityFeed } from '../components/ActivityFeed';
import { SkeletonLoader } from '../components/SkeletonLoader';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { wishlists, activities } from '../data/mockData';

export const FeedPage: React.FC = () => {
  // Основные состояния (без дублирования)
  const [selectedWishlist, setSelectedWishlist] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [wishlistsState, setWishlistsState] = useState(wishlists.slice(0, 3));
  const [wishlistsAll] = useState(wishlists);
  const [activitiesState, setActivitiesState] = useState(activities.slice(0, 4));
  const [activitiesAll] = useState(activities);
  const [showedWishlists, setShowedWishlists] = useState(3);
  const [showedActivities, setShowedActivities] = useState(4);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalWishlist, setModalWishlist] = useState<any>(null);
  // Для редактирования и удаления
  const [editMode, setEditMode] = useState(false);
  const [editWishlist, setEditWishlist] = useState<any>(null);
  const [editForm, setEditForm] = useState({ title: '', description: '' });
  // Модалка подтверждения удаления
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // --- END ---


  // Симуляция загрузки данных
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        await new Promise(resolve => setTimeout(resolve, 1200));
        setIsLoading(false);
      } catch (err) {
        setError('Ошибка при загрузке данных');
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // Лайк/анлайк вишлиста
  const handleLike = (wishlistId: string) => {
    setWishlistsState(prev => prev.map(w =>
      w.id === wishlistId
        ? { ...w, isLiked: !w.isLiked, likes: w.likes + (w.isLiked ? -1 : 1) }
        : w
    ));
  };

  // Удаление вишлиста
  const handleDeleteWishlist = (wishlistId: string) => {
    setWishlistsState(prev => prev.filter(w => w.id !== wishlistId));
    setShowModal(false);
    setModalWishlist(null);
  };

  // Открытие модалки редактирования
  const handleEditWishlist = (wishlist: any) => {
    setEditMode(true);
    setEditWishlist(wishlist);
    setEditForm({ title: wishlist.title, description: wishlist.description });
    setShowModal(false);
  };

  // Сохранение изменений редактирования
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    setWishlistsState(prev => prev.map(w =>
      w.id === editWishlist.id
        ? { ...w, title: editForm.title, description: editForm.description }
        : w
    ));
    setEditMode(false);
    setEditWishlist(null);
    setEditForm({ title: '', description: '' });
  };

  // Отмена редактирования
  const handleCancelEdit = () => {
    setEditMode(false);
    setEditWishlist(null);
    setEditForm({ title: '', description: '' });
  };


  // Открытие модалки просмотра вишлиста
  const handleViewWishlist = (wishlistId: string) => {
    const found = wishlistsAll.find(w => w.id === wishlistId);
    if (found) {
      setModalWishlist(found);
      setShowModal(true);
    }
    setSelectedWishlist(wishlistId);
  };


  const handleTagClick = (tag: string) => {
    setActiveTag(tag === activeTag ? null : tag);
    if (tag === activeTag) {
      setWishlistsState(wishlistsAll.slice(0, showedWishlists));
    } else {
      const filtered = wishlistsAll.filter(w => w.items.some(item => item.tags.includes(tag)));
      setWishlistsState(filtered.slice(0, showedWishlists));
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setModalWishlist(null);
  };

  const handleShowMoreWishlists = () => {
    const next = showedWishlists + 3;
    setWishlistsState(wishlistsAll.slice(0, next));
    setShowedWishlists(next);
  };

  const handleShowMoreActivities = () => {
    const next = showedActivities + 4;
    setActivitiesState(activitiesAll.slice(0, next));
    setShowedActivities(next);
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
                wishlistsState.map((wishlist, index) => (
                  <div 
                    key={wishlist.id}
                    style={{ animationDelay: `${index * 100}ms` }}
                    className="animate-fade-in"
                  >
                    <WishlistCard
                      wishlist={wishlist}
                      onLike={() => handleLike(wishlist.id)}
                      onView={() => handleViewWishlist(wishlist.id)}
                    >
                      <div className="flex gap-2 mt-2">
                        <button
                          className="bg-red-100 text-red-600 px-3 py-1 rounded hover:bg-red-200 transition-colors text-xs"
                          onClick={() => handleDeleteWishlist(wishlist.id)}
                        >
                          Удалить
                        </button>
                        <button
                          className="bg-blue-100 text-blue-600 px-3 py-1 rounded hover:bg-blue-200 transition-colors text-xs"
                          onClick={() => handleEditWishlist(wishlist)}
                        >
                          Редактировать
                        </button>
                      </div>
                    </WishlistCard>
                  </div>
                ))
              )}
              {!isLoading && wishlistsState.length < wishlistsAll.length && (
                <div className="text-center mt-4">
                  <button
                    onClick={handleShowMoreWishlists}
                    className="bg-gradient-to-r from-primary to-accent text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all duration-200 hover:scale-105"
                  >
                    Показать больше вишлистов
                  </button>
                </div>
              )}
              {activeTag && (
                <div className="text-center mt-2">
                  <button
                    onClick={() => handleTagClick(activeTag)}
                    className="bg-neutral-200 text-neutral-700 px-4 py-1 rounded-lg hover:bg-neutral-300 transition-colors text-sm"
                  >
                    Сбросить фильтр по тегу: #{activeTag}
                  </button>
                </div>
              )}
            </div> 
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <ActivityFeed activities={activitiesState} isLoading={isLoading} />
            {!isLoading && activitiesState.length < activitiesAll.length && (
              <div className="text-center mt-2">
                <button
                  onClick={handleShowMoreActivities}
                  className="bg-gradient-to-r from-primary to-accent text-white px-4 py-1 rounded-lg hover:shadow-lg transition-all duration-200 hover:scale-105 text-sm"
                >
                  Показать больше активности
                </button>
              </div>
            )}
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
                    className={`px-3 py-1 rounded-full text-sm transition-all duration-200 hover:scale-105 animate-fade-in ${activeTag === tag ? 'bg-primary text-white' : 'bg-primary/10 text-primary hover:bg-primary/20'}`}
                    onClick={() => handleTagClick(tag)}
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

      {/* Модалка просмотра вишлиста */}
      {showModal && modalWishlist && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full relative animate-fade-in">
            <button type="button" onClick={handleCloseModal} className="absolute top-2 right-2 text-neutral-400 hover:text-neutral-700 text-2xl">×</button>
            <h2 className="text-2xl font-bold mb-4">Вишлист</h2>
            <div className="mb-4">
              <label className="block text-neutral-700 mb-1">Название</label>
              <p className="text-neutral-900">{modalWishlist.title}</p>
            </div>
            <div className="mb-4">
              <label className="block text-neutral-700 mb-1">Описание</label>
              <p className="text-neutral-900">{modalWishlist.description}</p>
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={handleCloseModal} className="bg-neutral-200 text-neutral-700 px-4 py-2 rounded-lg hover:bg-neutral-300">Закрыть</button>
            </div>
          </div>
        </div>
      )}

      {/* Модалка редактирования вишлиста */}
      {editMode && editWishlist && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <form onSubmit={handleSaveEdit} className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full relative animate-fade-in">
            <button type="button" onClick={handleCancelEdit} className="absolute top-2 right-2 text-neutral-400 hover:text-neutral-700 text-2xl">×</button>
            <h2 className="text-2xl font-bold mb-4">Редактировать вишлист</h2>
            <div className="mb-4">
              <label className="block text-neutral-700 mb-1">Название</label>
              <input
                type="text"
                className="w-full border rounded-lg px-3 py-2"
                value={editForm.title}
                onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))}
                required
                maxLength={40}
              />
            </div>
            <div className="mb-4">
              <label className="block text-neutral-700 mb-1">Описание</label>
              <textarea
                className="w-full border rounded-lg px-3 py-2"
                value={editForm.description}
                onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))}
                rows={3}
                required
              />
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={handleCancelEdit} className="bg-neutral-200 text-neutral-700 px-4 py-2 rounded-lg hover:bg-neutral-300">Отмена</button>
              <button type="submit" className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-accent transition-colors">Сохранить</button>
            </div>
          </form>
        </div>
      )}

      {/* Модалка подтверждения удаления */}
      {showDeleteModal && editWishlist && !editMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl p-8 max-w-sm w-full relative animate-fade-in">
            <button type="button" onClick={() => { setShowDeleteModal(false); setEditWishlist(null); }} className="absolute top-2 right-2 text-neutral-400 hover:text-neutral-700 text-2xl">×</button>
            <h2 className="text-2xl font-bold mb-4">Удалить вишлист?</h2>
            <p className="mb-6 text-neutral-700">Вы уверены, что хотите удалить этот вишлист? Это действие необратимо.</p>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => { setShowDeleteModal(false); setEditWishlist(null); }} className="bg-neutral-200 text-neutral-700 px-4 py-2 rounded-lg hover:bg-neutral-300">Отмена</button>
              <button type="button" onClick={() => { handleDeleteWishlist(editWishlist.id); setShowDeleteModal(false); setEditWishlist(null); }} className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors">Удалить</button>
            </div>
          </div>
        </div>
      )}
    </>
  </ErrorBoundary>
);