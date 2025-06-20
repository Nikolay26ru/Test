import React from 'react';
import { Heart, MessageCircle, Share, Eye, Calendar, Users } from 'lucide-react';
import { Wishlist } from '../types';
import { OptimizedImage } from './OptimizedImage';
import { generateAvatar } from '../utils/imageUtils';

interface WishlistCardProps {
  wishlist: Wishlist;
  onLike?: () => void;
  onView?: () => void;
}

export const WishlistCard: React.FC<WishlistCardProps> = ({ wishlist, onLike, onView }) => {
  const totalGoal = wishlist.items.reduce((sum, item) => sum + item.goalAmount, 0);
  const totalRaised = wishlist.items.reduce((sum, item) => sum + item.currentAmount, 0);
  const progressPercentage = totalGoal > 0 ? (totalRaised / totalGoal) * 100 : 0;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden group cursor-pointer animate-fade-in" onClick={onView}>
      {/* Header */}
      <div className="p-4 pb-2">
        <div className="flex items-center space-x-3 mb-3">
          <div className="relative">
            <OptimizedImage
              src={wishlist.user.avatar || generateAvatar(wishlist.user.name, 40)}
              alt={wishlist.user.name}
              className="w-10 h-10 rounded-full object-cover"
              showLoader={false}
            />
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-neutral-900 truncate">{wishlist.user.name}</h4>
            <div className="flex items-center space-x-2 text-xs text-neutral-500">
              <Calendar className="w-3 h-3 flex-shrink-0" />
              <span>{formatDate(wishlist.createdAt)}</span>
            </div>
          </div>
          
          {wishlist.isPublic && (
            <div className="bg-secondary/20 text-secondary-dark px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 flex-shrink-0">
              <Eye className="w-3 h-3" />
              <span>Публичный</span>
            </div>
          )}
        </div>

        <h3 className="text-lg font-semibold text-neutral-900 mb-2 group-hover:text-primary transition-colors line-clamp-2 leading-tight">
          {wishlist.title}
        </h3>
        
        <p className="text-neutral-600 text-sm mb-3 line-clamp-2 leading-relaxed">
          {wishlist.description}
        </p>
      </div>

      {/* Preview Images */}
      <div className="px-4 mb-3">
        <div className="grid grid-cols-3 gap-2">
          {wishlist.items.slice(0, 3).map((item, index) => (
            <div key={item.id} className="relative aspect-square rounded-lg overflow-hidden bg-neutral-100">
              <OptimizedImage
                src={item.imageUrl}
                alt={item.title}
                category={item.category}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                showLoader={false}
              />
              
              {index === 2 && wishlist.items.length > 3 && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm">
                  <span className="text-white font-medium text-sm">
                    +{wishlist.items.length - 3}
                  </span>
                </div>
              )}
            </div>
          ))}
          
          {/* Fill empty slots if less than 3 items */}
          {wishlist.items.length < 3 && Array.from({ length: 3 - wishlist.items.length }).map((_, index) => (
            <div key={`empty-${index}`} className="aspect-square rounded-lg bg-neutral-100 flex items-center justify-center">
              <div className="text-neutral-400 text-xs">Пусто</div>
            </div>
          ))}
        </div>
      </div>

      {/* Progress */}
      <div className="px-4 mb-3 space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center space-x-2">
            <span className="text-neutral-600">Собрано:</span>
            <span className="font-semibold text-neutral-900">{formatPrice(totalRaised)}</span>
          </span>
          <span className="font-medium text-primary">
            {Math.round(progressPercentage)}%
          </span>
        </div>
        
        <div className="w-full bg-neutral-200 rounded-full h-2 overflow-hidden">
          <div
            className="h-2 rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
            style={{ width: `${Math.min(progressPercentage, 100)}%` }}
          />
        </div>
        
        <div className="flex items-center justify-between text-xs text-neutral-500">
          <span className="flex items-center space-x-1">
            <Users className="w-3 h-3" />
            <span>{wishlist.items.length} желаний</span>
          </span>
          <span>Цель: {formatPrice(totalGoal)}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="px-4 pb-4 pt-2 border-t border-neutral-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onLike?.();
              }}
              className={`flex items-center space-x-1 transition-all duration-200 hover:scale-110 ${
                wishlist.isLiked ? 'text-red-500' : 'text-neutral-500 hover:text-red-500'
              }`}
            >
              <Heart className={`w-5 h-5 ${wishlist.isLiked ? 'fill-current' : ''}`} />
              <span className="text-sm font-medium">{wishlist.likes}</span>
            </button>
            
            <button className="flex items-center space-x-1 text-neutral-500 hover:text-primary transition-all duration-200 hover:scale-110">
              <MessageCircle className="w-5 h-5" />
              <span className="text-sm font-medium">{wishlist.comments}</span>
            </button>
          </div>
          
          <button className="p-2 text-neutral-500 hover:text-primary transition-all duration-200 hover:scale-110 rounded-lg hover:bg-neutral-50">
            <Share className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};