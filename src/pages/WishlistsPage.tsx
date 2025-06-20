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
  const [giftItemsState, setGiftItemsState] = useState(giftItems);
  const [wishlistsState, setWishlistsState] = useState(wishlists);
  const [showedGifts, setShowedGifts] = useState(6);
  const [showedWishlists, setShowedWishlists] = useState(2);
  // Модальное окно просмотра вишлиста
  const [showModal, setShowModal] = useState(false);
  const [modalWishlist, setModalWishlist] = useState<any>(null);
  // Модалка создания
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newWishlist, setNewWishlist] = useState({ title: '', description: '' });
  // Модалка редактирования
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ title: '', description: '' });
  // Модалка удаления
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // ...остальной код без изменений

  // Фильтрация
  const filteredItems = giftItemsState.filter(item => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const myWishlists = wishlistsState.filter(w => w.user.id === '1'); // currentUser.id === '1'
  const followingWishlists = wishlistsState.slice(1); // для примера

  useEffect(() => {
    const loadWishlists = async () => {
      try {
        setIsLoading(true);
        setError(null);
        await new Promise(resolve => setTimeout(resolve, 800));
        setIsLoading(false);
      } catch (err) {
        setError('Ошибка при загрузке вишлистов');
        setIsLoading(false);
      }
    };
    loadWishlists();
  }, [activeTab]);

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
      { id: newId, title: newWishlist.title, description: newWishlist.description, user: { id: '1', name: 'Вы' }, items: [], likes: 0, isLiked: false },
      ...prev
    ]);
    setShowCreateModal(false);
    setNewWishlist({ title: '', description: '' });
  };

  // Лайк подарка
  const handleLikeGift = (giftId: string) => {
    setGiftItemsState(prev => prev.map(g => g.id === giftId ? { ...g, isLiked: !g.isLiked, likes: g.likes ? g.likes + (g.isLiked ? -1 : 1) : (g.isLiked ? 0 : 1) } : g));
  };
  // Поддержать подарок
  const handleContribute = (giftId: string) => {
    setGiftItemsState(prev => prev.map(g => g.id === giftId ? { ...g, currentAmount: g.currentAmount + 1000, contributors: g.contributors + 1, isCompleted: g.currentAmount + 1000 >= g.goalAmount ? true : g.isCompleted } : g));
  };
  // Лайк вишлиста
  const handleLikeWishlist = (wishlistId: string) => {
    setWishlistsState(prev => prev.map(w => w.id === wishlistId ? { ...w, isLiked: !w.isLiked, likes: w.likes + (w.isLiked ? -1 : 1) } : w));
  };
  // Показать больше подарков
  const handleShowMoreGifts = () => {
    setShowedGifts(prev => prev + 6);
  };
  // Показать больше вишлистов
  const handleShowMoreWishlists = () => {
    setShowedWishlists(prev => prev + 2);
  };

  // Симуляция загрузки данных
  useEffect(() => {
    const loadWishlists = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Симуляция задержки сети
        await new Promise(resolve => setTimeout(resolve, 1200));
        
        // const { data, error } = await supabase.from('wishlists').select('*');
        
        setIsLoading(false);
      } catch (err) {
        setError('Ошибка при загрузке вишлистов');
        setIsLoading(false);
      }
    };

    loadWishlists();
  }, [activeTab]);

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
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-neutral-900">
                      Популярные вишлисты
                    </h2>
                    <button
                      className="bg-gradient-to-r from-primary to-accent text-white px-4 py-1 rounded-lg hover:shadow-lg transition-all duration-200 hover:scale-105 text-sm"
                      onClick={handleOpenCreateModal}
                    >
                      + Новый вишлист
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {wishlistsState.slice(0, 2).map((wishlist, index) => (
                      <div 
                        key={wishlist.id}
                        style={{ animationDelay: `${index * 100}ms` }}
                        className="animate-fade-in"
                      >
                        <WishlistCard
                          wishlist={wishlist}
                          onLike={() => handleLikeWishlist(wishlist.id)}
                          onView={() => handleViewWishlist(wishlist)}
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
                  <button
                    className="bg-gradient-to-r from-primary to-accent text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all duration-200 hover:scale-105"
                    onClick={handleOpenCreateModal}
                  >
                    Создать первый вишлист
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'following' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {followingWishlists.map((wishlist, index) => (
                  <div 
                    key={wishlist.id}
                    style={{ animationDelay: `${index * 100}ms` }}
                    className="animate-fade-in"
                  >
                    <WishlistCard
                      wishlist={wishlist}
                      onLike={() => handleLikeWishlist(wishlist.id)}
                      onView={() => handleViewWishlist(wishlist)}
                    />
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
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
          <div className="flex justify-end">
            <button onClick={handleCloseModal} className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-accent transition-colors">Закрыть</button>
          </div>
        </div>
      </div>
    )}

    {/* Модалки */}
    {showModal && modalWishlist && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
        <div className="bg-white rounded-xl shadow-xl p-8 max-w-lg w-full relative animate-fade-in">
          <button type="button" onClick={handleCloseModal} className="absolute top-2 right-2 text-neutral-400 hover:text-neutral-700 text-2xl">×</button>
          <h2 className="text-2xl font-bold mb-4">{modalWishlist.title}</h2>
          <p className="mb-4 text-neutral-600">{modalWishlist.description}</p>
          <div className="flex gap-2 mb-6">
            <button onClick={handleOpenEditModal} className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">Редактировать</button>
            <button onClick={handleOpenDeleteModal} className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors">Удалить</button>
          </div>
          {/* Здесь можно добавить остальной контент модалки просмотра */}
        </div>
      </div>
    )}
    {showEditModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
        <form onSubmit={handleSaveEdit} className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full relative animate-fade-in">
          <button type="button" onClick={handleCloseEditModal} className="absolute top-2 right-2 text-neutral-400 hover:text-neutral-700 text-2xl">×</button>
          <h2 className="text-2xl font-bold mb-4">Редактировать вишлист</h2>
          <div className="mb-4">
            <label className="block mb-1 text-sm font-medium">Название</label>
            <input
              type="text"
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              value={editForm.title}
              onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))}
              required
              maxLength={40}
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1 text-sm font-medium">Описание</label>
            <textarea
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary min-h-[60px]"
              value={editForm.description}
              onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))}
              maxLength={200}
            />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={handleCloseEditModal} className="bg-neutral-200 text-neutral-700 px-4 py-2 rounded-lg hover:bg-neutral-300">Отмена</button>
            <button type="submit" className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-accent transition-colors">Сохранить</button>
          </div>
        </form>
      </div>
    )}
    {showDeleteModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
        <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full relative animate-fade-in">
          <button type="button" onClick={handleCloseDeleteModal} className="absolute top-2 right-2 text-neutral-400 hover:text-neutral-700 text-2xl">×</button>
          <h2 className="text-xl font-bold mb-4">Удалить вишлист?</h2>
          <p className="mb-6 text-neutral-600">Вы уверены, что хотите удалить этот вишлист? Это действие необратимо.</p>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={handleCloseDeleteModal} className="bg-neutral-200 text-neutral-700 px-4 py-2 rounded-lg hover:bg-neutral-300">Отмена</button>
            <button type="button" onClick={handleDeleteWishlist} className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors">Удалить</button>
          </div>
        </div>
      </div>
    )}

    {/* Модалка создания нового вишлиста */}
    {showCreateModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
        <form onSubmit={handleCreateWishlist} className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full relative animate-fade-in">
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
        <button
          className="bg-gradient-to-r from-primary to-accent text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all duration-200 hover:scale-105"
          onClick={handleOpenCreateModal}
        >
          Создать первый вишлист
        </button>
      </div>
    </div>
  )}

  {activeTab === 'following' && (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {followingWishlists.map((wishlist, index) => (
        <div 
          key={wishlist.id}
          style={{ animationDelay: `${index * 100}ms` }}
          className="animate-fade-in"
        >
          <WishlistCard
            wishlist={wishlist}
            onLike={() => handleLikeWishlist(wishlist.id)}
            onView={() => handleViewWishlist(wishlist)}
          />
        </div>
      ))}
    </div>
  )}
</>

{showModal && modalWishlist && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
    <div className="bg-white rounded-xl shadow-xl p-8 max-w-lg w-full relative animate-fade-in">
      <button type="button" onClick={handleCloseModal} className="absolute top-2 right-2 text-neutral-400 hover:text-neutral-700 text-2xl">×</button>
      <h2 className="text-2xl font-bold mb-4">{modalWishlist.title}</h2>
      <p className="mb-4 text-neutral-600">{modalWishlist.description}</p>
      <div className="flex gap-2 mb-6">
        <button onClick={handleOpenEditModal} className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">Редактировать</button>
        <button onClick={handleOpenDeleteModal} className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors">Удалить</button>
      </div>
      {/* Здесь можно добавить остальной контент модалки просмотра */}
    </div>
  </div>
)}

{showEditModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
    <form onSubmit={handleSaveEdit} className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full relative animate-fade-in">
      <button type="button" onClick={handleCloseEditModal} className="absolute top-2 right-2 text-neutral-400 hover:text-neutral-700 text-2xl">×</button>
      <h2 className="text-2xl font-bold mb-4">Редактировать вишлист</h2>
      <div className="mb-4">
        <label className="block mb-1 text-sm font-medium">Название</label>
        <input
          type="text"
          className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
          value={editForm.title}
          onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))}
          required
          maxLength={40}
        />
      </div>
      <div className="mb-4">
        <label className="block mb-1 text-sm font-medium">Описание</label>
        <textarea
          className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary min-h-[60px]"
          value={editForm.description}
          onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))}
          maxLength={200}
        />
      </div>
      <div className="flex justify-end gap-2">
        <button type="button" onClick={handleCloseEditModal} className="bg-neutral-200 text-neutral-700 px-4 py-2 rounded-lg hover:bg-neutral-300">Отмена</button>
        <button type="submit" className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-accent transition-colors">Сохранить</button>
      </div>
    </form>
  </div>
)}

{showDeleteModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
    <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full relative animate-fade-in">
      <button type="button" onClick={handleCloseDeleteModal} className="absolute top-2 right-2 text-neutral-400 hover:text-neutral-700 text-2xl">×</button>
      <h2 className="text-xl font-bold mb-4">Удалить вишлист?</h2>
      <p className="mb-6 text-neutral-600">Вы уверены, что хотите удалить этот вишлист? Это действие необратимо.</p>
      <div className="flex justify-end gap-2">
        <button type="button" onClick={handleCloseDeleteModal} className="bg-neutral-200 text-neutral-700 px-4 py-2 rounded-lg hover:bg-neutral-300">Отмена</button>
        <button type="button" onClick={handleDeleteWishlist} className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors">Удалить</button>
      </div>
    </div>
  </div>
)}

{showCreateModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
    <form onSubmit={handleCreateWishlist} className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full relative animate-fade-in">
      <button type="button" onClick={handleCloseModal} className="absolute top-2 right-2 text-neutral-400 hover:text-neutral-700 text-2xl">×</button>
      <h2 className="text-2xl font-bold mb-4">Создать вишлист</h2>
      <div className="mb-4">
        <label className="block mb-1 text-sm font-medium">Название</label>
        <input
          type="text"
          className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
          value={newWishlist.title}
          onChange={e => setNewWishlist(f => ({ ...f, title: e.target.value }))}
          required
          maxLength={40}
        />
      </div>
      <div className="mb-4">
        <label className="block mb-1 text-sm font-medium">Описание</label>
        <textarea
          className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary min-h-[60px]"
          value={newWishlist.description}
          onChange={e => setNewWishlist(f => ({ ...f, description: e.target.value }))}
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

// --- Конец компонента ---
};