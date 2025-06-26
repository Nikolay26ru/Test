import React, { useState, useEffect } from 'react';
import { Header } from '../Layout/Header';
import { WishListGrid } from '../WishList/WishListGrid';
import { CreateWishListModal } from '../WishList/CreateWishListModal';
import { AIRecommendations } from '../AI/AIRecommendations';
import { CrowdfundingCard } from '../Crowdfunding/CrowdfundingCard';
import { TrendingUp, Users, Gift, Star, Sparkles, Target } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import type { WishList } from '../../types';

export const EnhancedDashboard: React.FC = () => {
  const { user } = useAuth();
  const [wishlists, setWishlists] = useState<WishList[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'lists' | 'ai' | 'crowdfunding'>('lists');
  const [toastMessage, setToastMessage] = useState<string>('');

  // Загрузка данных
  useEffect(() => {
    if (user) {
      loadWishlists();
      loadCampaigns();
    }
  }, [user]);

  // Toast notification effect
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const showToast = (message: string) => {
    setToastMessage(message);
  };

  const loadWishlists = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('wishlists')
      .select(`
        *,
        wishlist_items (*)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading wishlists:', error);
    } else {
      setWishlists(data || []);
    }
  };

  const loadCampaigns = async () => {
    const { data, error } = await supabase
      .from('campaigns')
      .select(`
        *,
        wishlist_item:wishlist_items (
          id,
          title,
          description,
          price,
          image_url
        )
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(6);

    if (error) {
      console.error('Error loading campaigns:', error);
    } else {
      setCampaigns(data || []);
    }
  };

  const handleCreateWishList = async (data: {
    title: string;
    description: string;
    is_public: boolean;
    cover_image?: string;
  }) => {
    if (!user) return;

    const { error } = await supabase
      .from('wishlists')
      .insert({
        ...data,
        user_id: user.id
      });

    if (error) {
      console.error('Error creating wishlist:', error);
      showToast('Не удалось создать список. Попробуйте еще раз.');
    } else {
      loadWishlists();
      showToast('Список желаний успешно создан!');
    }
  };

  const handleRecommendationClick = (recommendation: string) => {
    // Извлекаем название товара из рекомендации
    const match = recommendation.match(/\*\*(.*?)\*\*/);
    const itemTitle = match ? match[1] : recommendation.split(' ').slice(0, 3).join(' ');
    
    // Копируем в буфер обмена
    navigator.clipboard.writeText(itemTitle).then(() => {
      showToast(`"${itemTitle}" скопировано в буфер обмена! Теперь вы можете добавить это в любой список желаний.`);
    }).catch(() => {
      showToast(`Рекомендация: "${itemTitle}". Добавьте это в свой список желаний!`);
    });
  };

  const stats = [
    {
      title: 'Всего списков',
      value: wishlists.length,
      icon: Gift,
      color: 'purple'
    },
    {
      title: 'Публичных',
      value: wishlists.filter(w => w.is_public).length,
      icon: Users,
      color: 'teal'
    },
    {
      title: 'Активных кампаний',
      value: campaigns.length,
      icon: Target,
      color: 'orange'
    },
    {
      title: 'AI-рекомендации',
      value: 'Новые',
      icon: Sparkles,
      color: 'green'
    }
  ];

  const tabs = [
    { id: 'lists', label: 'Мои списки', icon: Gift },
    { id: 'ai', label: 'AI-советы', icon: Sparkles },
    { id: 'crowdfunding', label: 'Краудфандинг', icon: Target }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onCreateWishlist={() => setIsCreateModalOpen(true)} />
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 max-w-md">
          <p className="text-sm">{toastMessage}</p>
        </div>
      )}
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Добро пожаловать, {user?.name}! 👋
          </h1>
          <p className="text-gray-600">
            {user?.is_guest 
              ? 'Вы вошли как гость. Зарегистрируйтесь для полного доступа к функциям.'
              : 'Управляйте своими списками желаний и получайте AI-рекомендации'
            }
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center bg-${stat.color}-100`}>
                  <stat.icon className={`h-6 w-6 text-${stat.color}-600`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'lists' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">
                Ваши списки желаний
              </h2>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="text-purple-600 hover:text-purple-700 font-medium"
              >
                Посмотреть все
              </button>
            </div>
            
            <WishListGrid
              wishlists={wishlists}
              onCreateNew={() => setIsCreateModalOpen(true)}
            />
          </div>
        )}

        {activeTab === 'ai' && (
          <div className="max-w-4xl">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Персональные рекомендации
              </h2>
              <p className="text-gray-600">
                Получите умные советы на основе ваших интересов и предпочтений
              </p>
            </div>
            
            <AIRecommendations 
              onRecommendationClick={handleRecommendationClick}
            />
          </div>
        )}

        {activeTab === 'crowdfunding' && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Активные кампании
              </h2>
              <p className="text-gray-600">
                Поддержите мечты других пользователей или создайте свою кампанию
              </p>
            </div>
            
            {campaigns.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {campaigns.map((campaign) => (
                  <CrowdfundingCard
                    key={campaign.id}
                    campaign={campaign}
                    onDonationSuccess={loadCampaigns}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Пока нет активных кампаний
                </h3>
                <p className="text-gray-600">
                  Создайте свой список желаний и запустите краудфандинг для дорогих покупок
                </p>
              </div>
            )}
          </div>
        )}
      </main>

      <CreateWishListModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateWishList}
      />
    </div>
  );
};