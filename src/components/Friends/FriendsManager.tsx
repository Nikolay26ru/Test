import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, UserPlus, UserMinus, Check, X, Search, Mail, ArrowLeft, AlertCircle } from 'lucide-react';
import { FriendsService } from '../../lib/friendsService';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { ErrorHandler } from '../../lib/errorHandler';
import { LoadingSpinner } from '../Layout/LoadingSpinner';
import type { User, FriendRequest, FriendshipStatus } from '../../types';

export const FriendsManager: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [friends, setFriends] = useState<User[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<FriendRequest[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<FriendRequest[]>([]);
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [activeTab, setActiveTab] = useState<'friends' | 'requests' | 'search'>('friends');

  useEffect(() => {
    if (user) {
      loadFriendsData();
    }
  }, [user]);

  const loadFriendsData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const [friendsList, incoming, outgoing] = await Promise.all([
        FriendsService.getFriends(user.id),
        FriendsService.getIncomingFriendRequests(user.id),
        FriendsService.getOutgoingFriendRequests(user.id)
      ]);

      setFriends(friendsList);
      setIncomingRequests(incoming);
      setOutgoingRequests(outgoing);
    } catch (error) {
      console.error('Error loading friends data:', error);
      ErrorHandler.showToast('Ошибка загрузки данных о друзьях');
    } finally {
      setLoading(false);
    }
  };

  const searchUsers = async () => {
    if (!searchQuery.trim() || !user) return;

    setSearching(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, username, avatar_url, bio')
        .neq('id', user.id)
        .or(`name.ilike.%${searchQuery}%,username.ilike.%${searchQuery}%`)
        .limit(20);

      if (error) throw error;

      setSearchResults(data || []);
    } catch (error: any) {
      console.error('Error searching users:', error);
      ErrorHandler.showToast(ErrorHandler.handleSupabaseError(error, 'user search'));
    } finally {
      setSearching(false);
    }
  };

  const handleSendFriendRequest = async (targetUserId: string) => {
    if (!user) return;

    const result = await FriendsService.sendFriendRequest(user.id, targetUserId);
    ErrorHandler.showToast(result.message, result.success ? 'success' : 'error');
    
    if (result.success) {
      loadFriendsData();
      // Обновляем результаты поиска, убирая пользователя, которому отправили запрос
      setSearchResults(prev => prev.filter(u => u.id !== targetUserId));
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    const result = await FriendsService.acceptFriendRequest(requestId);
    ErrorHandler.showToast(result.message, result.success ? 'success' : 'error');
    
    if (result.success) {
      loadFriendsData();
    }
  };

  const handleDeclineRequest = async (requestId: string) => {
    const result = await FriendsService.declineFriendRequest(requestId);
    ErrorHandler.showToast(result.message, result.success ? 'success' : 'error');
    
    if (result.success) {
      loadFriendsData();
    }
  };

  const handleRemoveFriend = async (friendId: string, friendName: string) => {
    if (!user) return;

    if (!confirm(`Удалить ${friendName} из друзей?`)) return;

    const result = await FriendsService.removeFriend(user.id, friendId);
    ErrorHandler.showToast(result.message, result.success ? 'success' : 'error');
    
    if (result.success) {
      loadFriendsData();
    }
  };

  const UserCard: React.FC<{ 
    user: User; 
    showActions?: boolean; 
    actionType?: 'add' | 'remove' | 'accept' | 'decline';
    onAction?: () => void;
    requestId?: string;
    disabled?: boolean;
  }> = ({ user: targetUser, showActions = false, actionType, onAction, requestId, disabled = false }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center space-x-3">
        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
          {targetUser.avatar_url ? (
            <img
              src={targetUser.avatar_url}
              alt={targetUser.name}
              className="w-full h-full rounded-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          ) : (
            <Users className="h-6 w-6 text-purple-600" />
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 truncate">{targetUser.name}</h3>
          <p className="text-sm text-gray-500 truncate">@{targetUser.username}</p>
          {targetUser.bio && (
            <p className="text-xs text-gray-400 truncate mt-1">{targetUser.bio}</p>
          )}
        </div>

        {showActions && (
          <div className="flex space-x-2">
            {actionType === 'add' && (
              <button
                onClick={onAction}
                disabled={disabled}
                className="p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Добавить в друзья"
              >
                <UserPlus className="h-4 w-4" />
              </button>
            )}
            
            {actionType === 'remove' && (
              <button
                onClick={onAction}
                disabled={disabled}
                className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Удалить из друзей"
              >
                <UserMinus className="h-4 w-4" />
              </button>
            )}
            
            {actionType === 'accept' && requestId && (
              <>
                <button
                  onClick={() => handleAcceptRequest(requestId)}
                  disabled={disabled}
                  className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Принять запрос"
                >
                  <Check className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDeclineRequest(requestId)}
                  disabled={disabled}
                  className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Отклонить запрос"
                >
                  <X className="h-4 w-4" />
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Загрузка данных о друзьях..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Back Button */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Вернуться на главную"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Друзья</h1>
              <p className="text-gray-600">Управляйте своими друзьями и запросами</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'friends', label: 'Друзья', count: friends.length },
                { id: 'requests', label: 'Запросы', count: incomingRequests.length },
                { id: 'search', label: 'Поиск', count: null }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span>{tab.label}</span>
                  {tab.count !== null && tab.count > 0 && (
                    <span className="bg-purple-100 text-purple-600 px-2 py-1 rounded-full text-xs">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'friends' && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Мои друзья ({friends.length})
            </h2>
            
            {friends.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">У вас пока нет друзей</p>
                <p className="text-sm text-gray-500">Найдите друзей через поиск</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {friends.map((friend) => (
                  <UserCard
                    key={friend.id}
                    user={friend}
                    showActions={true}
                    actionType="remove"
                    onAction={() => handleRemoveFriend(friend.id, friend.name)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'requests' && (
          <div className="space-y-6">
            {/* Incoming Requests */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Входящие запросы ({incomingRequests.length})
              </h2>
              
              {incomingRequests.length === 0 ? (
                <div className="text-center py-6">
                  <Mail className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">Нет входящих запросов</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {incomingRequests.map((request) => (
                    <UserCard
                      key={request.id}
                      user={request.sender!}
                      showActions={true}
                      actionType="accept"
                      requestId={request.id}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Outgoing Requests */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Исходящие запросы ({outgoingRequests.length})
              </h2>
              
              {outgoingRequests.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-gray-600">Нет исходящих запросов</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {outgoingRequests.map((request) => (
                    <UserCard
                      key={request.id}
                      user={request.receiver!}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'search' && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Поиск пользователей
            </h2>
            
            {/* Search Form */}
            <div className="mb-6">
              <div className="flex space-x-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && searchUsers()}
                    placeholder="Поиск по имени или username..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                    disabled={searching}
                  />
                </div>
                <button
                  onClick={searchUsers}
                  disabled={searching || !searchQuery.trim()}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {searching ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                  <span>{searching ? 'Поиск...' : 'Найти'}</span>
                </button>
              </div>
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Результаты поиска ({searchResults.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {searchResults.map((searchUser) => (
                    <UserCard
                      key={searchUser.id}
                      user={searchUser}
                      showActions={true}
                      actionType="add"
                      onAction={() => handleSendFriendRequest(searchUser.id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {searchQuery && searchResults.length === 0 && !searching && (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Пользователи не найдены</p>
                <p className="text-sm text-gray-500">Попробуйте изменить запрос</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};