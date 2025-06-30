import React, { useState } from 'react';
import { X, Camera, Globe, Lock } from 'lucide-react';
import { ValidationService } from '../../lib/validation';
import { ErrorHandler } from '../../lib/errorHandler';

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
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const validation = ValidationService.validateWishlistForm({
      title: formData.title,
      description: formData.description
    });
    
    const newErrors = { ...validation.errors };
    
    // Валидация URL изображения
    if (formData.cover_image) {
      const urlValidation = ValidationService.validateUrl(formData.cover_image);
      if (!urlValidation.isValid) {
        newErrors.cover_image = urlValidation.error!;
      }
    }
    
    setErrors(newErrors);
    return validation.isValid && !newErrors.cover_image;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      await onSubmit({
        title: formData.title.trim(),
        description: formData.description.trim(),
        is_public: formData.is_public,
        cover_image: formData.cover_image.trim() || undefined
      });
      
      // Сброс формы после успешного создания
      setFormData({ title: '', description: '', is_public: true, cover_image: '' });
      setErrors({});
      onClose();
    } catch (error) {
      ErrorHandler.showToast('Не удалось создать список желаний');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({ title: '', description: '', is_public: true, cover_image: '' });
      setErrors({});
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
            onClick={handleClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
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
              <p className="text-sm text-gray-500 mb-2">
                Вставьте ссылку на изображение
              </p>
              <input
                type="url"
                placeholder="https://example.com/image.jpg"
                value={formData.cover_image}
                onChange={(e) => setFormData({ ...formData, cover_image: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm transition-colors ${
                  errors.cover_image ? 'border-red-300' : 'border-gray-300'
                }`}
                disabled={loading}
              />
              {errors.cover_image && (
                <p className="text-red-600 text-xs mt-1">{errors.cover_image}</p>
              )}
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
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors ${
                errors.title ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="День рождения, Свадьба, Новый год..."
              maxLength={100}
              disabled={loading}
            />
            {errors.title && (
              <p className="text-red-600 text-xs mt-1">{errors.title}</p>
            )}
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
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors ${
                errors.description ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Расскажите немного о вашем списке..."
              maxLength={500}
              disabled={loading}
            />
            {errors.description && (
              <p className="text-red-600 text-xs mt-1">{errors.description}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              {formData.description.length}/500 символов
            </p>
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
                  disabled={loading}
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
                  disabled={loading}
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
              disabled={loading}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={loading || !formData.title.trim()}
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
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