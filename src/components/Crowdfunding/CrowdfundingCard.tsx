import React, { useState } from 'react';
import { Target, Users, Heart, Gift } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface Campaign {
  id: string;
  goal_amount: number;
  current_amount: number;
  is_active: boolean;
  end_date?: string;
  wishlist_item: {
    id: string;
    title: string;
    description?: string;
    price?: number;
    image_url?: string;
  };
}

interface CrowdfundingCardProps {
  campaign: Campaign;
  onDonationSuccess?: () => void;
}

export const CrowdfundingCard: React.FC<CrowdfundingCardProps> = ({
  campaign,
  onDonationSuccess
}) => {
  const { user } = useAuth();
  const [donationAmount, setDonationAmount] = useState<number>(100);
  const [loading, setLoading] = useState(false);
  const [showDonationForm, setShowDonationForm] = useState(false);

  const progress = Math.min((campaign.current_amount / campaign.goal_amount) * 100, 100);
  const remaining = Math.max(campaign.goal_amount - campaign.current_amount, 0);

  const makeDonation = async () => {
    if (!user || donationAmount <= 0) return;

    setLoading(true);
    try {
      // Добавляем пожертвование (демо-режим)
      const { error: donationError } = await supabase
        .from('donations')
        .insert({
          campaign_id: campaign.id,
          user_id: user.id,
          amount: donationAmount,
          status: 'simulated'
        });

      if (donationError) throw donationError;

      // Обновляем сумму кампании
      const { error: updateError } = await supabase
        .from('campaigns')
        .update({
          current_amount: campaign.current_amount + donationAmount
        })
        .eq('id', campaign.id);

      if (updateError) throw updateError;

      // Показываем успешное уведомление
      alert(`🎉 Демо-пожертвование ${donationAmount} руб. успешно добавлено!`);
      
      setShowDonationForm(false);
      setDonationAmount(100);
      onDonationSuccess?.();

    } catch (error) {
      console.error('Donation error:', error);
      alert('Не удалось сделать пожертвование. Попробуйте еще раз.');
    } finally {
      setLoading(false);
    }
  };

  const quickAmounts = [100, 500, 1000, 2000];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="relative">
        {campaign.wishlist_item.image_url ? (
          <img
            src={campaign.wishlist_item.image_url}
            alt={campaign.wishlist_item.title}
            className="w-full h-48 object-cover"
          />
        ) : (
          <div className="w-full h-48 bg-gradient-to-br from-purple-100 to-teal-100 flex items-center justify-center">
            <Gift className="h-12 w-12 text-purple-400" />
          </div>
        )}
        
        <div className="absolute top-4 right-4">
          <div className="bg-white bg-opacity-90 backdrop-blur-sm px-3 py-1 rounded-full">
            <span className="text-sm font-medium text-purple-600">
              Краудфандинг
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {campaign.wishlist_item.title}
        </h3>
        
        {campaign.wishlist_item.description && (
          <p className="text-gray-600 text-sm mb-4">
            {campaign.wishlist_item.description}
          </p>
        )}

        {/* Progress */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              Собрано: {campaign.current_amount.toLocaleString()} ₽
            </span>
            <span className="text-sm text-gray-500">
              {progress.toFixed(1)}%
            </span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-purple-600 to-teal-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          
          <div className="flex justify-between items-center mt-2 text-sm text-gray-600">
            <span>Цель: {campaign.goal_amount.toLocaleString()} ₽</span>
            <span>Осталось: {remaining.toLocaleString()} ₽</span>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center space-x-4 mb-4 text-sm text-gray-500">
          <div className="flex items-center space-x-1">
            <Users className="h-4 w-4" />
            <span>12 участников</span>
          </div>
          <div className="flex items-center space-x-1">
            <Target className="h-4 w-4" />
            <span>Осталось 15 дней</span>
          </div>
        </div>

        {/* Donation Form */}
        {showDonationForm ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Сумма пожертвования
              </label>
              <div className="grid grid-cols-4 gap-2 mb-3">
                {quickAmounts.map(amount => (
                  <button
                    key={amount}
                    onClick={() => setDonationAmount(amount)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      donationAmount === amount
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {amount} ₽
                  </button>
                ))}
              </div>
              <input
                type="number"
                value={donationAmount}
                onChange={(e) => setDonationAmount(Number(e.target.value))}
                min="1"
                max="100000"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Введите сумму"
              />
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => setShowDonationForm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={makeDonation}
                disabled={loading || donationAmount <= 0}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                ) : (
                  <>
                    <Heart className="h-4 w-4" />
                    <span>Поддержать (демо)</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-xs text-gray-500 text-center">
              🎭 Это демо-режим. Реальные платежи не производятся.
            </p>
          </div>
        ) : (
          <button
            onClick={() => setShowDonationForm(true)}
            disabled={!campaign.is_active || progress >= 100}
            className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            <Heart className="h-4 w-4" />
            <span>
              {progress >= 100 ? 'Цель достигнута!' : 'Поддержать мечту'}
            </span>
          </button>
        )}
      </div>
    </div>
  );
};