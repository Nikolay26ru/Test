import React from 'react';
import { Heart, Eye, Gift, Lock, Globe } from 'lucide-react';
import type { WishList } from '../../types';

interface WishlistCardProps {
  wishlist: WishList;
  onClick: () => void;
}

export const WishlistCard: React.FC<WishlistCardProps> = ({ wishlist, onClick }) => {
  const itemCount = wishlist.items?.length || 0;
  const purchasedCount = wishlist.items?.filter(item => item.is_purchased).length || 0;

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-200 cursor-pointer group overflow-hidden"
    >
      {/* Cover Image */}
      <div className="relative h-48 bg-gradient-to-br from-purple-100 to-teal-100">
        {wishlist.cover_image ? (
          <img
            src={wishlist.cover_image}
            alt={wishlist.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Gift className="h-12 w-12 text-purple-400" />
          </div>
        )}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200" />
        
        {/* Privacy Badge */}
        <div className="absolute top-3 right-3">
          <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${
            wishlist.is_public 
              ? 'bg-green-100 text-green-800' 
              : 'bg-gray-100 text-gray-800'
          }`}>
            {wishlist.is_public ? (
              <>
                <Globe className="h-3 w-3" />
                <span>Публичный</span>
              </>
            ) : (
              <>
                <Lock className="h-3 w-3" />
                <span>Приватный</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors line-clamp-2">
            {wishlist.title}
          </h3>
          <button className="text-gray-400 hover:text-red-500 transition-colors">
            <Heart className="h-5 w-5" />
          </button>
        </div>

        {wishlist.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {wishlist.description}
          </p>
        )}

        {/* Stats */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <Gift className="h-4 w-4" />
              <span>{itemCount} товаров</span>
            </div>
            {purchasedCount > 0 && (
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span>{purchasedCount} куплено</span>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-1 text-sm text-gray-500">
            <Eye className="h-4 w-4" />
            <span>0</span>
          </div>
        </div>

        {/* Progress Bar */}
        {itemCount > 0 && (
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-purple-600 to-teal-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(purchasedCount / itemCount) * 100}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {Math.round((purchasedCount / itemCount) * 100)}% выполнено
            </p>
          </div>
        )}
      </div>
    </div>
  );
};