import React from 'react';
import { Settings, UserPlus, MessageCircle, Share } from 'lucide-react';
import { User } from '../types';

interface UserProfileProps {
  user: User;
  isOwnProfile?: boolean;
  onFollow?: () => void;
  onMessage?: () => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({ 
  user, 
  isOwnProfile = false, 
  onFollow, 
  onMessage 
}) => {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      {/* Cover Image */}
      <div className="h-32 bg-gradient-to-r from-primary via-accent to-secondary"></div>
      
      {/* Profile Content */}
      <div className="relative px-6 pb-6">
        {/* Avatar */}
        <div className="relative -mt-16 mb-4">
          <img
            src={user.avatar}
            alt={user.name}
            className="w-24 h-24 rounded-full border-4 border-white shadow-lg object-cover"
          />
          <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 rounded-full border-2 border-white"></div>
        </div>

        {/* User Info */}
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-neutral-900 mb-1">{user.name}</h2>
          {user.bio && (
            <p className="text-neutral-600 mb-3">{user.bio}</p>
          )}
          
          {/* Stats */}
          <div className="flex items-center space-x-6 text-sm">
            <div className="text-center">
              <div className="font-bold text-neutral-900">{user.followers.toLocaleString()}</div>
              <div className="text-neutral-500">Подписчики</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-neutral-900">{user.following.toLocaleString()}</div>
              <div className="text-neutral-500">Подписки</div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-3">
          {isOwnProfile ? (
            <button className="flex-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2">
              <Settings className="w-4 h-4" />
              <span>Настройки</span>
            </button>
          ) : (
            <>
              <button
                onClick={onFollow}
                className={`flex-1 py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 ${
                  user.isFollowing
                    ? 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
                    : 'bg-gradient-to-r from-primary to-accent hover:shadow-lg text-white'
                }`}
              >
                <UserPlus className="w-4 h-4" />
                <span>{user.isFollowing ? 'Отписаться' : 'Подписаться'}</span>
              </button>
              <button
                onClick={onMessage}
                className="p-2 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors"
              >
                <MessageCircle className="w-5 h-5 text-neutral-600" />
              </button>
              <button className="p-2 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors">
                <Share className="w-5 h-5 text-neutral-600" />
              </button>
            </>
          )}
        </div>

        {/* Privacy Level */}
        <div className="mt-4 text-center">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
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