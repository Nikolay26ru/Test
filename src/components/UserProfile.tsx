import React from 'react';
import { Settings, UserPlus, MessageCircle, Share } from 'lucide-react';
import { User } from '../types';
import { OptimizedImage } from './OptimizedImage';
import { generateAvatar } from '../utils/imageUtils';

interface UserProfileProps {
  user: User;
  isOwnProfile?: boolean;
  onFollow?: () => void;
  onMessage?: () => void;
  isLoading?: boolean;
}

export const UserProfile: React.FC<UserProfileProps> = ({ 
  user, 
  isOwnProfile = false, 
  onFollow, 
  onMessage,
  isLoading = false
}) => {
  const [isFollowing, setIsFollowing] = React.useState(user.isFollowing || false);
  const [followers, setFollowers] = React.useState(user.followers || 0);
  const [messageSent, setMessageSent] = React.useState(false);
  const [followLoading, setFollowLoading] = React.useState(false);
  const [msgLoading, setMsgLoading] = React.useState(false);

  const handleFollow = async () => {
    setFollowLoading(true);
    await new Promise(r => setTimeout(r, 500));
    setIsFollowing(prev => !prev);
    setFollowers(prev => prev + (isFollowing ? -1 : 1));
    setFollowLoading(false);
    if (onFollow) onFollow();
  };

  const handleMessage = async () => {
    setMsgLoading(true);
    await new Promise(r => setTimeout(r, 500));
    setMessageSent(true);
    setTimeout(() => setMessageSent(false), 2000);
    setMsgLoading(false);
    if (onMessage) onMessage();
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse">
        <div className="h-32 bg-neutral-200"></div>
        <div className="relative px-6 pb-6">
          <div className="relative -mt-16 mb-4">
            <div className="w-24 h-24 bg-neutral-200 rounded-full border-4 border-white"></div>
          </div>
          <div className="space-y-3">
            <div className="h-6 bg-neutral-200 rounded w-32"></div>
            <div className="h-4 bg-neutral-200 rounded w-full"></div>
            <div className="h-4 bg-neutral-200 rounded w-3/4"></div>
            <div className="flex space-x-6">
              <div className="text-center">
                <div className="h-5 bg-neutral-200 rounded w-8 mb-1"></div>
                <div className="h-3 bg-neutral-200 rounded w-16"></div>
              </div>
              <div className="text-center">
                <div className="h-5 bg-neutral-200 rounded w-8 mb-1"></div>
                <div className="h-3 bg-neutral-200 rounded w-16"></div>
              </div>
            </div>
            <div className="h-10 bg-neutral-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden animate-fade-in">
      {/* Cover Image */}
      <div className="h-32 bg-gradient-to-r from-primary via-accent to-secondary relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
      </div>
      
      {/* Profile Content */}
      <div className="relative px-6 pb-6">
        {/* Avatar */}
        <div className="relative -mt-16 mb-4">
          <OptimizedImage
            src={user.avatar || generateAvatar(user.name, 96)}
            alt={user.name}
            className="w-24 h-24 rounded-full border-4 border-white shadow-lg object-cover"
            showLoader={false}
          />
          <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 rounded-full border-2 border-white"></div>
        </div>

        {/* User Info */}
        <div className="mb-4 space-y-3">
          <h2 className="text-2xl font-bold text-neutral-900">{user.name}</h2>
          
          {user.bio && (
            <p className="text-neutral-600 leading-relaxed">{user.bio}</p>
          )}
          
          {/* Stats */}
          <div className="flex items-center space-x-6 text-sm">
            <div className="text-center">
              <div className="font-bold text-neutral-900 text-lg">{user.followers.toLocaleString()}</div>
              <div className="text-neutral-500">Подписчики</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-neutral-900 text-lg">{user.following.toLocaleString()}</div>
              <div className="text-neutral-500">Подписки</div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-3 mb-4">
          {isOwnProfile ? (
            <button className="flex-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 py-2.5 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 hover:scale-[1.02]">
              <Settings className="w-4 h-4" />
              <span>Настройки</span>
            </button>
          ) : (
            <>
              <button
                onClick={handleFollow}
                disabled={followLoading}
                className={`flex-1 py-2.5 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 hover:scale-[1.02] ${isFollowing ? 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700' : 'bg-gradient-to-r from-primary to-accent hover:shadow-lg text-white'} ${followLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                <UserPlus className="w-4 h-4" />
                <span>{isFollowing ? 'Отписаться' : 'Подписаться'}</span>
              </button>
              <button
                onClick={handleMessage}
                disabled={msgLoading}
                className="p-2.5 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-all duration-200 hover:border-primary hover:scale-110"
              >
                <MessageCircle className="w-5 h-5 text-neutral-600" />
                {messageSent && <span className="ml-2 text-xs text-green-600">Сообщение отправлено!</span>}
              </button>
              <button
                onClick={() => alert('Ссылка на профиль скопирована!')}
                className="p-2.5 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-all duration-200 hover:border-primary hover:scale-110"
              >
                <Share className="w-5 h-5 text-neutral-600" />
              </button>
            </>
          )}
        </div>

        {/* Privacy Level */}
        <div className="text-center">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
            user.privacyLevel === 'public' 
              ? 'bg-green-100 text-green-800'
              : user.privacyLevel === 'friends'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-red-100 text-red-800'
          }`}>
            {user.privacyLevel === 'public' && 'Публичный профиль'}
            {user.privacyLevel === 'friends' && 'Только друзья'}
            {user.privacyLevel === 'private' && 'Приватный профиль'}
          </span>
        </div>
      </div>
    </div>
  );
};