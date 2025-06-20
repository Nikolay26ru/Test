import React from 'react';
import { Heart, Gift, Plus, Target, Calendar } from 'lucide-react';
import { Activity } from '../types';

interface ActivityFeedProps {
  activities: Activity[];
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ activities }) => {
  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'contribution_made':
        return <Heart className="w-5 h-5 text-red-500" />;
      case 'goal_reached':
        return <Target className="w-5 h-5 text-green-500" />;
      case 'wishlist_created':
        return <Plus className="w-5 h-5 text-blue-500" />;
      case 'item_added':
        return <Gift className="w-5 h-5 text-purple-500" />;
      default:
        return <Calendar className="w-5 h-5 text-neutral-500" />;
    }
  };

  const getActivityText = (activity: Activity) => {
    switch (activity.type) {
      case 'contribution_made':
        return `поддержал(а) "${activity.target}" на ${activity.data.amount.toLocaleString()} ₽`;
      case 'goal_reached':
        return `достиг(ла) цели для "${activity.target}"! 🎉`;
      case 'wishlist_created':
        return `создал(а) новый вишлист "${activity.target}"`;
      case 'item_added':
        return `добавил(а) новое желание "${activity.target}"`;
      default:
        return 'выполнил(а) действие';
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'только что';
    if (diffHours < 24) return `${diffHours}ч назад`;
    if (diffDays < 7) return `${diffDays}д назад`;
    return date.toLocaleDateString('ru-RU');
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="p-4 border-b border-neutral-200">
        <h3 className="text-lg font-semibold text-neutral-900">Лента активности</h3>
      </div>
      
      <div className="divide-y divide-neutral-100">
        {activities.map((activity) => (
          <div key={activity.id} className="p-4 hover:bg-neutral-50 transition-colors">
            <div className="flex items-start space-x-3">
              <img
                src={activity.user.avatar}
                alt={activity.user.name}
                className="w-10 h-10 rounded-full object-cover flex-shrink-0"
              />
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="font-medium text-neutral-900">
                    {activity.user.name}
                  </span>
                  <span className="text-neutral-600 text-sm">
                    {getActivityText(activity)}
                  </span>
                </div>
                
                <div className="flex items-center space-x-2 text-xs text-neutral-500">
                  <span>{formatTime(activity.timestamp)}</span>
                </div>
              </div>
              
              <div className="flex-shrink-0">
                {getActivityIcon(activity.type)}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="p-4 text-center border-t border-neutral-200">
        <button className="text-primary hover:text-accent transition-colors text-sm font-medium">
          Показать больше
        </button>
      </div>
    </div>
  );
};