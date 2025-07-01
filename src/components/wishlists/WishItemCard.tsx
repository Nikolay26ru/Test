import React from 'react';
import { Check, Trash2, Star, ShoppingCart, ExternalLink } from 'lucide-react';
import type { WishItem } from '../../types';

interface WishItemCardProps {
  item: WishItem;
  isOwner: boolean;
  onTogglePurchased: (isPurchased: boolean) => void;
  onUpdate: (data: Partial<WishItem>) => void;
  onDelete: () => void;
}

export const WishItemCard: React.FC<WishItemCardProps> = ({
  item,
  isOwner,
  onTogglePurchased,
  onDelete
}) => {
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

  const handleItemClick = () => {
    if (item.store_url) {
      window.open(item.store_url, '_blank');
    }
  };

  return (
    <div
      className={`bg-white rounded-xl shadow-sm border p-6 transition-all cursor-pointer hover:shadow-md ${
        item.is_purchased ? 'opacity-75 bg-gray-50' : ''
      }`}
      onClick={handleItemClick}
    >
      <div className="flex items-start space-x-4">
        {/* Image */}
        <div className="flex-shrink-0">
          {item.image_url ? (
            <img
              src={item.image_url}
              alt={item.title}
              className="w-20 h-20 object-cover rounded-lg"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.nextElementSibling?.classList.remove('hidden');
              }}
            />
          ) : null}
          <div className={`w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center ${item.image_url ? 'hidden' : ''}`}>
            <ShoppingCart className="h-8 w-8 text-gray-400" />
          </div>
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
                <div className="flex items-center text-purple-600 hover:text-purple-700 text-sm mt-2">
                  <ExternalLink className="h-4 w-4 mr-1" />
                  <span>Посмотреть в магазине</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2 ml-4">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onTogglePurchased(!item.is_purchased);
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
                    if (confirm('Удалить этот товар?')) {
                      onDelete();
                    }
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
  );
};