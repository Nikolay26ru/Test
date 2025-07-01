import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { X, Camera, Globe, Lock } from 'lucide-react';
import { wishlistSchema } from '../../lib/validation';
import type { CreateWishlistData } from '../../api/wishlists';

interface CreateWishlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateWishlistData) => void;
  isLoading?: boolean;
}

export const CreateWishlistModal: React.FC<CreateWishlistModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch
  } = useForm<CreateWishlistData>({
    resolver: yupResolver(wishlistSchema),
    defaultValues: {
      is_public: true
    }
  });

  const isPublic = watch('is_public');

  const handleClose = () => {
    if (!isLoading) {
      reset();
      onClose();
    }
  };

  const handleFormSubmit = (data: CreateWishlistData) => {
    onSubmit(data);
    reset();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">
            Создать новый список
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
          {/* Cover Image */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Обложка
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors">
              <Camera className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500 mb-2">
                Вставьте ссылку на изображение
              </p>
              <input
                {...register('cover_image')}
                type="url"
                placeholder="https://example.com/image.jpg"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm transition-colors ${
                  errors.cover_image ? 'border-red-300' : 'border-gray-300'
                }`}
                disabled={isLoading}
              />
              {errors.cover_image && (
                <p className="text-red-600 text-xs mt-1">{errors.cover_image.message}</p>
              )}
            </div>
          </div>

          {/* Title */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Название списка *
            </label>
            <input
              {...register('title')}
              type="text"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors ${
                errors.title ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="День рождения, Свадьба, Новый год..."
              disabled={isLoading}
            />
            {errors.title && (
              <p className="text-red-600 text-xs mt-1">{errors.title.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Описание
            </label>
            <textarea
              {...register('description')}
              rows={3}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors ${
                errors.description ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Расскажите немного о вашем списке..."
              disabled={isLoading}
            />
            {errors.description && (
              <p className="text-red-600 text-xs mt-1">{errors.description.message}</p>
            )}
          </div>

          {/* Privacy */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Приватность
            </label>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  {...register('is_public')}
                  type="radio"
                  value="true"
                  className="mr-3 text-purple-600 focus:ring-purple-500"
                  disabled={isLoading}
                />
                <div className="flex items-center space-x-2">
                  <Globe className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">Публичный</span>
                </div>
                <span className="text-xs text-gray-500 ml-2">
                  Все могут видеть этот список
                </span>
              </label>
              <label className="flex items-center">
                <input
                  {...register('is_public')}
                  type="radio"
                  value="false"
                  className="mr-3 text-purple-600 focus:ring-purple-500"
                  disabled={isLoading}
                />
                <div className="flex items-center space-x-2">
                  <Lock className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium">Приватный</span>
                </div>
                <span className="text-xs text-gray-500 ml-2">
                  Только вы видите этот список
                </span>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
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
                <span>Создать список</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};