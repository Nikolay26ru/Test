import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Edit3, Trash2, Check, X, ShoppingCart, Star, Heart, Users, UserPlus } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { FriendsService } from '../../lib/friendsService';
import { ProductRecommendationService } from '../../lib/productRecommendationService';
import type { WishList, WishItem, FriendshipStatus } from '../../types';

export const WishlistDetailScreen: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState<WishList | null>(null);
  const [items, setItems] = useState<WishItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [friendshipStatus, setFriendshipStatus] = useState<FriendshipStatus>('none');
  const [friendsCount, setFriendsCount] = useState(0);

  const [newItem, setNewItem] = useState({
    title: '',
    description: '',
    price: '',
    image_url: '',
    store_url: '',
    priority: 'medium' as const
  });

  useEffect(() => {
    if (id) {
      loadWishlistData();
    }
  }, [id]);

  useEffect(() => {
    if (wishlist && user && wishlist.user_id !== user.id) {
      loadFriendshipData();
    }
  }, [wishlist, user]);

  const loadWishlistData = async () => {
    if (!id) return;

    setLoading(true);
    try {
      // Загружаем список желаний
      const { data: wishlistData, error: wishlistError } = await supabase
        .from('wishlists')
        .select(`
          *,
          profiles (
            id,
            name,
            username,
            avatar_url,
            bio
          )
        `)
        .eq('id', id)
        .single();

      if (wishlistError) throw wishlistError;

      // Проверяем доступ
      if (!wishlistData.is_public && wishlistData.user_id !== user?.id) {
        navigate('/');
        return;
      }

      setWishlist(wishlistData);

      // Загружаем элементы списка
      const { data: itemsData, error: itemsError } = await supabase
        .from('wishlist_items')
        .select('*')
        .eq('wishlist_id', id)
        .order('created_at', { ascending: false });

      if (itemsError) throw itemsError;

      setItems(itemsData || []);

      // Записываем просмотры товаров для рекомендаций (только если это не наш список)
      if (user && wishlistData.user_id !== user.id && itemsData) {
        for (const item of itemsData.slice(0, 3)) { // Записываем только первые 3 товара
          await ProductRecommendationService.recordProductView(user.id, item.id);
        }
      }
    } catch (error) {
      console.error('Error loading wishlist:', error);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const loadFriendshipData = async () => {
    if (!user || !wishlist) return;

    try {
      const [status, count] = await Promise.all([
        FriendsService.getFriendshipStatus(user.id, wishlist.user_id),
        FriendsService.getFriendsCount(wishlist.user_id)
      ]);

      setFriendshipStatus(status);
      setFriendsCount(count);
    } catch (error) {
      console.error('Error loading friendship data:', error);
    }
  };

  const handleSendFriendRequest = async () => {
    if (!user || !wishlist) return;

    const result = await FriendsService.sendFriendRequest(user.id, wishlist.user_id);
    
    if (result.success) {
      setFriendshipStatus('pending_sent');
      alert(result.message);
    } else {
      alert(result.message);
    }
  };

  const addItem = async () => {
    if (!wishlist || !user || !newItem.title.trim()) return;

    try {
      const { data, error } = await supabase
        .from('wishlist_items')
        .insert({
          ...newItem,
          price: newItem.price ? parseFloat(newItem.price) : null,
          wishlist_id: wishlist.id
        })
        .select()
        .single();

      if (error) throw error;

      setItems([data, ...items]);
      setNewItem({
        title: '',
        description: '',
        price: '',
        image_url: '',
        store_url: '',
        priority: 'medium'
      });
      setShowAddForm(false);
    } catch (error) {
      console.error('Error adding item:', error);
      alert('Не удалось добавить товар');
    }
  };

  const togglePurchased = async (itemId: string, isPurchased: boolean) => {
    try {
      const { error } = await supabase
        .from('wishlist_items')
        .update({ 
          is_purchased: !isPurchased,
          purchased_by: !isPurchased ? user?.id : null
        })
        .eq('id', itemId);

      if (error) throw error;

      setItems(items.map(item => 
        item.id === itemId 
          ? { ...item, is_purchased: !isPurchased, purchased_by: !isPurchased ? user?.id : null }
          : item
      ));
    } catch (error) {
      console.error('Error updating item:', error);
      alert('Не удалось обновить статус товара');
    }
  };

  const deleteItem = async (itemId: string) => {
    if (!confirm('Удалить этот товар из списка?')) return;

    try {
      const { error } = await supabase
        .from('wishlist_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;

      setItems(items.filter(item => item.id !== itemId));
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Не удалось удалить товар');
    }
  };

  const handleItemClick = async (item: WishItem) => {
    // Записываем просмотр товара для рекомендаций
    if (user && wishlist && wishlist.user_id !== user.id) {
      await ProductRecommendationService.recordProductView(user.id, item.id);
    }

    // Открываем ссылку на товар если есть
    if (item.store_url) {
      window.open(item.store_url, '_blank');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high': return 'Высокий';
      case 'medium': return 'Средний';
      case 'low': return 'Низкий';
      default: return 'Средний';
    }
  };

  const getFriendshipStatusText = (status: FriendshipStatus) => {
    switch (status) {
      case 'friends': return 'В друзьях';
      case 'pending_sent': return 'Запрос отправлен';
      case 'pending_received': return 'Входящий запрос';
      default: return 'Добавить в друзья';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка списка...</p>
        </div>
      </div>
    );
  }

  if (!wishlist) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Список не найден</h2>
          <p className="text-gray-600 mb-4">Возможно, список был удален или у вас нет доступа</p>
          <button
            onClick={() => navigate('/')}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
          >
            Вернуться на главную
          </button>
        </div>
      </div>
    );
  }

  const isOwner = user?.id === wishlist.user_id;
  const completedItems = items.filter(item => item.is_purchased).length;
  const progressPercent = items.length > 0 ? (completedItems / items.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">{wishlist.title}</h1>
              <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                <div className="flex items-center space-x-2">
                  <span>Автор: {wishlist.profiles?.name || 'Неизвестно'}</span>
                  {!isOwner && (
                    <div className="flex items-center space-x-2">
                      <span>•</span>
                      <Users className="h-4 w-4" />
                      <span>{friendsCount} друзей</span>
                    </div>
                  )}
                </div>
                <span>•</span>
                <span>{items.length} товаров</span>
                <span>•</span>
                <span>{completedItems} выполнено</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Friend Request Button */}
              {!isOwner && user && (
                <button
                  onClick={handleSendFriendRequest}
                  disabled={friendshipStatus !== 'none'}
                  className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
                    friendshipStatus === 'friends' 
                      ? 'bg-green-100 text-green-700'
                      : friendshipStatus === 'pending_sent'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-purple-600 text-white hover:bg-purple-700'
                  } disabled:opacity-50`}
                >
                  <UserPlus className="h-4 w-4" />
                  <span>{getFriendshipStatusText(friendshipStatus)}</span>
                </button>
              )}

              {isOwner && (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Добавить товар</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Wishlist Info */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
          {wishlist.cover_image && (
            <img
              src={wishlist.cover_image}
              alt={wishlist.title}
              className="w-full h-48 object-cover rounded-lg mb-4"
            />
          )}
          
          {wishlist.description && (
            <p className="text-gray-600 mb-4">{wishlist.description}</p>
          )}

          {/* Progress */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Прогресс выполнения</span>
              <span className="text-sm text-gray-500">{progressPercent.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-purple-600 to-teal-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Add Item Form */}
        {showAddForm && isOwner && (
          <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Добавить новый товар</h3>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Название *
                </label>
                <input
                  type="text"
                  value={newItem.title}
                  onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Название товара"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Цена (₽)
                </label>
                <input
                  type="number"
                  value={newItem.price}
                  onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Описание
                </label>
                <textarea
                  value={newItem.description}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows={2}
                  placeholder="Описание товара"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ссылка на изображение
                </label>
                <input
                  type="url"
                  value={newItem.image_url}
                  onChange={(e) => setNewItem({ ...newItem, image_url: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Приоритет
                </label>
                <select
                  value={newItem.priority}
                  onChange={(e) => setNewItem({ ...newItem, priority: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="low">Низкий</option>
                  <option value="medium">Средний</option>
                  <option value="high">Высокий</option>
                </select>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowAddForm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Отмена
              </button>
              <button
                onClick={addItem}
                disabled={!newItem.title.trim()}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
              >
                Добавить товар
              </button>
            </div>
          </div>
        )}

        {/* Items List */}
        <div className="space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Список пуст
              </h3>
              <p className="text-gray-600">
                {isOwner ? 'Добавьте первый товар в ваш список желаний' : 'В этом списке пока нет товаров'}
              </p>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className={`bg-white rounded-xl shadow-sm border p-6 transition-all cursor-pointer hover:shadow-md ${
                  item.is_purchased ? 'opacity-75 bg-gray-50' : ''
                }`}
                onClick={() => handleItemClick(item)}
              >
                <div className="flex items-start space-x-4">
                  {/* Image */}
                  <div className="flex-shrink-0">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                        <ShoppingCart className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className={`text-lg font-semibold ${
                          item.is_purchased ? 'line-through text-gray-500' : 'text-gray-900'
                        }`}>
                          {item.title}
                        </h3>
                        
                        {item.description && (
                          <p className="text-gray-600 text-sm mt-1">{item.description}</p>
                        )}

                        <div className="flex items-center space-x-4 mt-2">
                          {item.price && (
                            <span className="text-lg font-bold text-purple-600">
                              {item.price.toLocaleString()} ₽
                            </span>
                          )}
                          
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(item.priority)}`}>
                            <Star className="h-3 w-3 inline mr-1" />
                            {getPriorityLabel(item.priority)}
                          </span>

                          {item.is_purchased && (
                            <span className="text-green-600 text-sm font-medium flex items-center">
                              <Check className="h-4 w-4 mr-1" />
                              Куплено
                            </span>
                          )}
                        </div>

                        {item.store_url && (
                          <p className="text-purple-600 hover:text-purple-700 text-sm mt-2">
                            Посмотреть в магазине →
                          </p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            togglePurchased(item.id, item.is_purchased);
                          }}
                          className={`p-2 rounded-lg transition-colors ${
                            item.is_purchased
                              ? 'bg-green-100 text-green-600 hover:bg-green-200'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                          title={item.is_purchased ? 'Отметить как не купленное' : 'Отметить как купленное'}
                        >
                          <Check className="h-4 w-4" />
                        </button>

                        {isOwner && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteItem(item.id);
                            }}
                            className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                            title="Удалить товар"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};