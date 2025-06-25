import React, { useState, useEffect } from 'react';
import { Header } from '../Layout/Header';
import { WishListGrid } from '../WishList/WishListGrid';
import { CreateWishListModal } from '../WishList/CreateWishListModal';
import { TrendingUp, Users, Gift, Star } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import type { WishList } from '../../types';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [wishlists, setWishlists] = useState<WishList[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Демо данные для показа
  useEffect(() => {
    const demoWishlists: WishList[] = [
      {
        id: '1',
        title: 'День Рождения 2024',
        description: 'Мои желания на предстоящий день рождения',
        is_public: true,
        cover_image: 'https://images.pexels.com/photos/1726710/pexels-photo-1726710.jpeg?auto=compress&cs=tinysrgb&w=800',
        user_id: user?.id || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        items: [
          {
            id: '1',
            title: 'MacBook Pro 16"',
            description: 'Для работы и творчества',
            price: 250000,
            currency: 'RUB',
            image_url: 'https://images.pexels.com/photos/18104/pexels-photo-18104.jpeg?auto=compress&cs=tinysrgb&w=400',
            priority: 'high' as const,
            is_purchased: false,
            wishlist_id: '1',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: '2',
            title: 'AirPods Pro',
            description: 'Для музыки в дороге',
            price: 25000,
            currency: 'RUB',
            priority: 'medium' as const,
            is_purchased: true,
            wishlist_id: '1',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ]
      },
      {
        id: '2',
        title: 'Новый Год',
        description: 'Подарки к новогодним праздникам',
        is_public: false,
        cover_image: 'https://images.pexels.com/photos/1303086/pexels-photo-1303086.jpeg?auto=compress&cs=tinysrgb&w=800',
        user_id: user?.id || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        items: []
      }
    ];
    setWishlists(demoWishlists);
  }, [user]);

  const handleCreateWishList = (data: {
    title: string;
    description: string;
    is_public: boolean;
    cover_image?: string;
  }) => {
    const newWishlist: WishList = {
      id: Date.now().toString(),
      ...data,
      user_id: user?.id || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      items: []
    };
    setWishlists([...wishlists, newWishlist]);
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
      title: 'Общий рейтинг',
      value: '4.9',
      icon: Star,
      color: 'orange'
    },
    {
      title: 'Просмотры',
      value: '1.2k',
      icon: TrendingUp,
      color: 'green'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onCreateWishlist={() => setIsCreateModalOpen(true)} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Добро пожаловать, {user?.name}! 👋
          </h1>
          <p className="text-gray-600">
            Управляйте своими списками желаний и делитесь ими с близкими
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

        {/* Wish Lists Grid */}
        <div className="mb-8">
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
            onWishListClick={(wishlist) => console.log('Open wishlist:', wishlist)}
          />
        </div>
      </main>

      <CreateWishListModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateWishList}
      />
    </div>
  );
};