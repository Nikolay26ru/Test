import React, { useState } from 'react';
import { X, Camera, Globe, Lock } from 'lucide-react';

interface CreateWishListModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    description: string;
    is_public: boolean;
    cover_image?: string;
  }) => void;
}

export const CreateWishListModal: React.FC<CreateWishListModalProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    is_public: true,
    cover_image: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.title.trim()) {
      onSubmit(formData);
      setFormData({ title: '', description: '', is_public: true, cover_image: '' });
      onClose();
    }
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
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Cover Image */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Обложка
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors">
              <Camera className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">
                Нажмите, чтобы загрузить изображение
              </p>
              <input
                type="url"
                placeholder="Или вставьте ссылку на изображение"
                value={formData.cover_image}
                onChange={(e) => setFormData({ ...formData, cover_image: e.target.value })}
                className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
              />
            </div>
          </div>

          {/* Title */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Название списка *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="День рождения, Свадьба, Новый год..."
            />
          </div>

          {/* Description */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Описание
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Расскажите немного о вашем списке..."
            />
          </div>

          {/* Privacy */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Приватность
            </label>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="radio"
                  checked={formData.is_public}
                  onChange={() => setFormData({ ...formData, is_public: true })}
                  className="mr-3 text-purple-600 focus:ring-purple-500"
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
                  type="radio"
                  checked={!formData.is_public}
                  onChange={() => setFormData({ ...formData, is_public: false })}
                  className="mr-3 text-purple-600 focus:ring-purple-500"
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
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Создать список
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};