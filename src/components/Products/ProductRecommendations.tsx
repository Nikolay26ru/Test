import React, { useState, useEffect } from 'react';
import { Sparkles, Eye, ShoppingCart, ExternalLink, AlertCircle } from 'lucide-react';
import { ProductRecommendationService } from '../../lib/productRecommendationService';
import { useAuth } from '../../contexts/AuthContext';
import type { WishItem } from '../../types';

export const ProductRecommendations: React.FC = () => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<WishItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [viewCount, setViewCount] = useState(0);
  const [hasEnoughViews, setHasEnoughViews] = useState(false);

  useEffect(() => {
    if (user) {
      checkViewCount();
      loadRecommendations();
    }
  }, [user]);

  const checkViewCount = async () => {
    if (!user) return;

    try {
      const count = await ProductRecommendationService.getUserViewCount(user.id);
      const enough = await ProductRecommendationService.hasEnoughViews(user.id);
      
      setViewCount(count);
      setHasEnoughViews(enough);
    } catch (error) {
      console.error('Error checking view count:', error);
    }
  };

  const loadRecommendations = async () => {
    if (!user) return;

    try {
      const savedRecommendations = await ProductRecommendationService.getSavedRecommendations(user.id);
      setRecommendations(savedRecommendations);
    } catch (error) {
      console.error('Error loading recommendations:', error);
    }
  };

  const generateRecommendations = async () => {
    if (!user) return;

    setLoading(true);
    setError('');

    try {
      const result = await ProductRecommendationService.generateRecommendations(user.id);
      
      if (result.success && result.recommendations) {
        setRecommendations(result.recommendations);
        setError('');
      } else {
        setError(result.message);
        setRecommendations([]);
      }
    } catch (error) {
      console.error('Error generating recommendations:', error);
      setError('Произошла ошибка при генерации рекомендаций');
    } finally {
      setLoading(false);
    }
  };

  const handleProductClick = async (item: WishItem) => {
    if (!user) return;

    // Записываем просмотр
    await ProductRecommendationService.recordProductView(user.id, item.id);
    
    // Обновляем счетчик
    checkViewCount();

    // Открываем ссылку на товар если есть
    if (item.store_url) {
      window.open(item.store_url, '_blank');
    }
  };

  const ProductCard: React.FC<{ item: WishItem }> = ({ item }) => (
    <div 
      className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => handleProductClick(item)}
    >
      {/* Image */}
      <div className="relative h-48 bg-gray-100">
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ShoppingCart className="h-12 w-12 text-gray-400" />
          </div>
        )}
        
        {item.store_url && (
          <div className="absolute top-2 right-2">
            <div className="bg-white bg-opacity-90 p-1 rounded-full">
              <ExternalLink className="h-4 w-4 text-gray-600" />
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">
          {item.title}
        </h3>
        
        {item.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {item.description}
          </p>
        )}

        <div className="flex items-center justify-between">
          {item.price && (
            <span className="text-lg font-bold text-purple-600">
              {item.price.toLocaleString()} ₽
            </span>
          )}
          
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            item.priority === 'high' ? 'bg-red-100 text-red-600' :
            item.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' :
            'bg-green-100 text-green-600'
          }`}>
            {item.priority === 'high' ? 'Высокий' :
             item.priority === 'medium' ? 'Средний' : 'Низкий'} приоритет
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Рекомендации товаров
            </h1>
            <p className="text-gray-600">
              Персональные рекомендации на основе ваших просмотров
            </p>
          </div>
          
          <button
            onClick={generateRecommendations}
            disabled={loading}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            <span>{loading ? 'Генерация...' : 'Обновить рекомендации'}</span>
          </button>
        </div>
      </div>

      {/* View Count Status */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            hasEnoughViews ? 'bg-green-100' : 'bg-orange-100'
          }`}>
            <Eye className={`h-5 w-5 ${
              hasEnoughViews ? 'text-green-600' : 'text-orange-600'
            }`} />
          </div>
          
          <div className="flex-1">
            <h3 className="font-medium text-gray-900">
              Статус просмотров
            </h3>
            <p className="text-sm text-gray-600">
              Просмотрено товаров: {viewCount} из 5 необходимых
            </p>
          </div>
          
          <div className="w-32">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  hasEnoughViews ? 'bg-green-500' : 'bg-orange-500'
                }`}
                style={{ width: `${Math.min((viewCount / 5) * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 ? (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Рекомендуемые товары ({recommendations.length})
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {recommendations.map((item) => (
              <ProductCard key={item.id} item={item} />
            ))}
          </div>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              💡 Нажмите на товар, чтобы посмотреть подробности и перейти в магазин
            </p>
          </div>
        </div>
      ) : !error && hasEnoughViews && (
        <div className="text-center py-12">
          <Sparkles className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Рекомендации не найдены
          </h3>
          <p className="text-gray-600 mb-4">
            Попробуйте просмотреть больше товаров для улучшения рекомендаций
          </p>
          <button
            onClick={generateRecommendations}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
          >
            Попробовать снова
          </button>
        </div>
      )}

      {/* Help Text */}
      {!hasEnoughViews && (
        <div className="text-center py-12">
          <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Недостаточно данных для рекомендаций
          </h3>
          <p className="text-gray-600 mb-4">
            Просмотрите еще {5 - viewCount} товаров, чтобы получить персональные рекомендации
          </p>
          <p className="text-sm text-gray-500">
            Переходите в списки желаний других пользователей и изучайте товары
          </p>
        </div>
      )}
    </div>
  );
};