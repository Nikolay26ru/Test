import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, ShoppingCart } from 'lucide-react';
import { useWishlist } from '../../hooks/useWishlists';
import { useWishItems } from '../../hooks/useWishItems';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { EmptyState } from '../ui/EmptyState';
import { CreateWishItemModal } from './CreateWishItemModal';
import { WishItemCard } from './WishItemCard';

export const WishlistDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { wishlist, items, isLoading } = useWishlist(id!);
  const { createItem, updateItem, deleteItem, togglePurchased } = useWishItems(id!);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Загрузка списка..." />
      </div>
    );
  }

  if (!wishlist) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Список не найден</h2>
          <button
            onClick={() => navigate('/')}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
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

  const handleCreateItem = (data: any) => {
    createItem({ ...data, wishlist_id: id! });
    setIsCreateModalOpen(false);
  };

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
                <span>Автор: {wishlist.profiles?.name || 'Неизвестно'}</span>
                <span>•</span>
                <span>{items.length} товаров</span>
                <span>•</span>
                <span>{completedItems} выполнено</span>
              </div>
            </div>
            
            {isOwner && (
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Добавить товар</span>
              </button>
            )}
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
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
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

        {/* Items List */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Товары в списке
          </h2>
          
          {items.length === 0 ? (
            <EmptyState
              icon={ShoppingCart}
              title="Список пуст"
              description={isOwner ? 'Добавьте первый товар в ваш список желаний' : 'В этом списке пока нет товаров'}
              action={isOwner ? {
                label: "Добавить товар",
                onClick: () => setIsCreateModalOpen(true)
              } : undefined}
            />
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <WishItemCard
                  key={item.id}
                  item={item}
                  isOwner={isOwner}
                  onTogglePurchased={(isPurchased) => togglePurchased({ id: item.id, isPurchased })}
                  onUpdate={(data) => updateItem({ id: item.id, data })}
                  onDelete={() => deleteItem(item.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <CreateWishItemModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateItem}
      />
    </div>
  );
};