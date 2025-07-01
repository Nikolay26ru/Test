import React, { useState } from 'react';
import { Plus, Gift, Users, Sparkles, Target } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useWishlists } from '../../hooks/useWishlists';
import { Header } from '../layout/Header';
import { WishlistGrid } from '../wishlists/WishlistGrid';
import { CreateWishlistModal } from '../wishlists/CreateWishlistModal';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { EmptyState } from '../ui/EmptyState';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { wishlists, isLoading, createWishlist, isCreating } = useWishlists();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

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
      title: 'Товаров',
      value: wishlists.reduce((acc, w) => acc + (w.items?.length || 0), 0),
      icon: Target,
      color: 'orange'
    },
    {
      title: 'AI-рекомендации',
      value: 'Доступно',
      icon: Sparkles,
      color: 'green'
    }
  ];

  const handleCreateWishlist = (data: any) => {
    createWishlist(data);
    setIsCreateModalOpen(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header onCreateWishlist={() => setIsCreateModalOpen(true)} />
        <div className="flex items-center justify-center h-96">
          <LoadingSpinner size="lg" text="Загрузка списков..." />
        </div>
      </div>
    );
  }

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
            {user?.is_guest 
              ? 'Вы вошли как гость. Ваши данные сохраняются локально.'
              : 'Управляйте своими списками желаний и получайте AI-рекомендации'
            }
          </p>
        </div>

        {/* Guest Warning */}
        {user?.is_guest && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-8">
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">!</span>
              </div>
              <div>
                <h4 className="font-medium text-orange-800">Гостевой режим</h4>
                <p className="text-sm text-orange-700">
                  Ваши данные сохраняются локально в браузере. Создайте аккаунт для синхронизации между устройствами.
                </p>
              </div>
            </div>
          </div>
        )}

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

        {/* Wishlists */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">
              Ваши списки желаний
            </h2>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Создать список</span>
            </button>
          </div>
          
          {wishlists.length === 0 ? (
            <EmptyState
              icon={Gift}
              title="У вас пока нет списков желаний"
              description="Создайте свой первый список и начните добавлять желаемые товары"
              action={{
                label: "Создать первый список",
                onClick: () => setIsCreateModalOpen(true)
              }}
            />
          ) : (
            <WishlistGrid
              wishlists={wishlists}
              onCreateNew={() => setIsCreateModalOpen(true)}
            />
          )}
        </div>
      </main>

      <CreateWishlistModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateWishlist}
        isLoading={isCreating}
      />
    </div>
  );
};