import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { X } from 'lucide-react';
import { wishItemSchema } from '../../lib/validation';
import type { CreateWishItemData } from '../../api/wishlists';

interface CreateWishItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<CreateWishItemData, 'wishlist_id'>) => void;
  isLoading?: boolean;
}

export const CreateWishItemModal: React.FC<CreateWishItemModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<Omit<CreateWishItemData, 'wishlist_id'>>({
    resolver: yupResolver(wishItemSchema),
    defaultValues: {
      priority: 'medium'
    }
  });

  const handleClose = () => {
    if (!isLoading) {
      reset();
      onClose();
    }
  };

  const handleFormSubmit = (data: Omit<CreateWishItemData, 'wishlist_id'>) => {
    onSubmit(data);
    reset();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">
            Добавить товар
          </h2>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Название *
              </label>
              <input
                {...register('title')}
                type="text"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors ${
                  errors.title ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Название товара"
                disabled={isLoading}
              />
              {errors.title && (
                <p className="text-red-600 text-xs mt-1">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Цена (₽)
              </label>
              <input
                {...register('price', { valueAsNumber: true })}
                type="number"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors ${
                  errors.price ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="0"
                min="0"
                disabled={isLoading}
              />
              {errors.price && (
                <p className="text-red-600 text-xs mt-1">{errors.price.message}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Описание
              </label>
              <textarea
                {...register('description')}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors ${
                  errors.description ? 'border-red-300' : 'border-gray-300'
                }`}
                rows={2}
                placeholder="Описание товара"
                disabled={isLoading}
              />
              {errors.description && (
                <p className="text-red-600 text-xs mt-1">{errors.description.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ссылка на изображение
              </label>
              <input
                {...register('image_url')}
                type="url"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors ${
                  errors.image_url ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="https://..."
                disabled={isLoading}
              />
              {errors.image_url && (
                <p className="text-red-600 text-xs mt-1">{errors.image_url.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ссылка на магазин
              </label>
              <input
                {...register('store_url')}
                type="url"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors ${
                  errors.store_url ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="https://..."
                disabled={isLoading}
              />
              {errors.store_url && (
                <p className="text-red-600 text-xs mt-1">{errors.store_url.message}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Приоритет
              </label>
              <select
                {...register('priority')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                disabled={isLoading}
              >
                <option value="low">Низкий</option>
                <option value="medium">Средний</option>
                <option value="high">Высокий</option>
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3 mt-6">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              ) : (
                <span>Добавить товар</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};