import React from 'react';
import { Heart, Users, ExternalLink, Zap } from 'lucide-react';
import { GiftItem } from '../types';

interface GiftCardProps {
  gift: GiftItem;
  onContribute?: () => void;
  showActions?: boolean;
}

export const GiftCard: React.FC<GiftCardProps> = ({ gift, onContribute, showActions = true }) => {
  const progressPercentage = (gift.currentAmount / gift.goalAmount) * 100;
  const remainingAmount = gift.goalAmount - gift.currentAmount;

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
        <img
          src={gift.imageUrl}
          alt={gift.title}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {gift.isCompleted && (
          <div className="absolute top-3 left-3 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
            <Zap className="w-3 h-3" />
            <span>Цель достигнута!</span>
          </div>
        )}
        <div className="absolute top-3 right-3 bg-black/50 text-white px-2 py-1 rounded-full text-xs">
          {gift.category}
        </div>
        {gift.link && (
          <div className="absolute bottom-3 right-3">
            <a
              href={gift.link}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white/90 hover:bg-white p-2 rounded-full transition-colors"
            >
              <ExternalLink className="w-4 h-4 text-neutral-700" />
            </a>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-lg text-neutral-900 line-clamp-2 flex-1">
            {gift.title}
          </h3>
          <div className="text-right ml-2 flex-shrink-0">
            <div className="text-lg font-bold text-neutral-900">
              {formatPrice(gift.goalAmount)}
            </div>
          </div>
        </div>

        <p className="text-neutral-600 text-sm mb-4 line-clamp-2">
          {gift.description}
        </p>

        {/* Progress */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-neutral-600">
              Собрано: {formatPrice(gift.currentAmount)}
            </span>
            <span className="font-medium text-primary">
              {Math.round(progressPercentage)}%
            </span>
          </div>
          <div className="w-full bg-neutral-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${
                gift.isCompleted
                  ? 'bg-gradient-to-r from-green-400 to-green-500'
                  : 'bg-gradient-to-r from-primary to-accent'
              }`}
              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-neutral-500 mt-1">
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
        <div className="flex flex-wrap gap-1 mb-4">
          {gift.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="bg-neutral-100 text-neutral-600 px-2 py-1 rounded-full text-xs"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex items-center space-x-2">
            {!gift.isCompleted ? (
              <button
                onClick={onContribute}
                className="flex-1 bg-gradient-to-r from-primary to-accent text-white py-2 px-4 rounded-lg hover:shadow-lg transition-all duration-200 font-medium"
              >
                Поддержать
              </button>
            ) : (
              <div className="flex-1 bg-green-50 text-green-700 py-2 px-4 rounded-lg text-center font-medium">
                Цель достигнута! 🎉
              </div>
            )}
            <button className="p-2 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors">
              <Heart className="w-5 h-5 text-neutral-400 hover:text-red-500" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};