import React from 'react';
import { Heart, Users, ExternalLink, Zap } from 'lucide-react';
import { GiftItem } from '../types';
import { OptimizedImage } from './OptimizedImage';

interface GiftCardProps {
  gift: GiftItem;
  onContribute?: () => void;
  showActions?: boolean;
}

export const GiftCard: React.FC<GiftCardProps> = ({ gift, onContribute, showActions = true }) => {
  const [isLiked, setIsLiked] = React.useState(gift.isLiked || false);
  const [likes, setLikes] = React.useState(gift.likes || 0);
  const [currentAmount, setCurrentAmount] = React.useState(gift.currentAmount);
  const [contributors, setContributors] = React.useState(gift.contributors);
  const [isCompleted, setIsCompleted] = React.useState(gift.isCompleted);
  const [loading, setLoading] = React.useState(false);

  const handleLike = () => {
    setIsLiked((prev) => !prev);
    setLikes((prev) => prev + (isLiked ? -1 : 1));
  };

  const handleContribute = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    setCurrentAmount((prev) => {
      const newAmount = prev + 1000;
      if (newAmount >= gift.goalAmount) {
        setIsCompleted(true);
      }
      return newAmount;
    });
    setContributors((prev) => prev + 1);
    setLoading(false);
  };

  const progressPercentage = (currentAmount / gift.goalAmount) * 100;
  const remainingAmount = gift.goalAmount - currentAmount;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0,
    }).format(price);
  };



  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden group">
      {/* Image */}
      <div className="relative overflow-hidden">
        <OptimizedImage
          src={gift.imageUrl}
          alt={gift.title}
          category={gift.category}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {gift.isCompleted && (
          <div className="absolute top-3 left-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 animate-fade-in">
            <Zap className="w-3 h-3" />
            <span>Цель достигнута!</span>
          </div>
        )}
        
        <div className="absolute top-3 right-3 bg-black/50 text-white px-2 py-1 rounded-full text-xs backdrop-blur-sm">
          {gift.category}
        </div>
        
        {gift.link && (
          <div className="absolute bottom-3 right-3">
            <a
              href={gift.link}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white/90 hover:bg-white p-2 rounded-full transition-all duration-200 hover:scale-110"
              aria-label="Открыть ссылку на товар"
            >
              <ExternalLink className="w-4 h-4 text-neutral-700" />
            </a>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        <div className="flex items-start justify-between">
          <h3 className="font-semibold text-lg text-neutral-900 line-clamp-2 flex-1 leading-tight">
            {gift.title}
          </h3>
          <div className="text-right ml-3 flex-shrink-0">
            <div className="text-lg font-bold text-neutral-900">
              {formatPrice(gift.goalAmount)}
            </div>
          </div>
        </div>

        <p className="text-neutral-600 text-sm line-clamp-2 leading-relaxed">
          {gift.description}
        </p>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-neutral-600">
              Собрано: <span className="font-medium">{formatPrice(gift.currentAmount)}</span>
            </span>
            <span className="font-medium text-primary">
              {Math.round(progressPercentage)}%
            </span>
          </div>
          
          <div className="w-full bg-neutral-200 rounded-full h-2 overflow-hidden">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${
                gift.isCompleted
                  ? 'bg-gradient-to-r from-green-400 to-green-500'
                  : 'bg-gradient-to-r from-primary to-accent'
              }`}
              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
            />
          </div>
          
          <div className="flex items-center justify-between text-xs text-neutral-500">
            <span className="flex items-center space-x-1">
              <Users className="w-3 h-3" />
              <span>{gift.contributors} участников</span>
            </span>
            {!gift.isCompleted && (
              <span>Осталось: {formatPrice(remainingAmount)}</span>
            )}
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          {gift.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="bg-neutral-100 hover:bg-neutral-200 text-neutral-600 px-2 py-1 rounded-full text-xs transition-colors cursor-pointer"
            >
              #{tag}
            </span>
          ))}
          {gift.tags.length > 3 && (
            <span className="text-neutral-400 text-xs px-2 py-1">
              +{gift.tags.length - 3}
            </span>
          )}
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex items-center space-x-2 pt-2">
            {!isCompleted ? (
              <button
                onClick={handleContribute}
                disabled={loading}
                className={`flex-1 bg-gradient-to-r from-primary to-accent text-white py-2.5 px-4 rounded-lg hover:shadow-lg transition-all duration-200 font-medium hover:scale-[1.02] active:scale-[0.98] ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                {loading ? 'Поддержка...' : 'Поддержать'}
              </button>
            ) : (
              <div className="flex-1 bg-green-50 text-green-700 py-2.5 px-4 rounded-lg text-center font-medium">
                Цель достигнута! 🎉
              </div>
            )}
            <button 
              onClick={handleLike}
              className={`p-2.5 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-all duration-200 hover:border-red-300 group ${isLiked ? 'border-red-400 bg-red-50' : ''}`}
              aria-label="Добавить в избранное"
            >
              <Heart className={`w-5 h-5 transition-colors ${isLiked ? 'text-red-500 fill-current' : 'text-neutral-400'}`} />
              <span className="ml-1 text-sm font-medium">{likes}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};