import { supabase } from './supabase';
import type { Friendship, FriendRequest, FriendshipStatus, User } from '../types';

export class FriendsService {
  // Получить статус дружбы между пользователями
  static async getFriendshipStatus(userId: string, targetUserId: string): Promise<FriendshipStatus> {
    try {
      // Проверяем существующую дружбу
      const { data: friendship } = await supabase
        .from('friendships')
        .select('*')
        .eq('user_id', userId)
        .eq('friend_id', targetUserId)
        .single();

      if (friendship) {
        return 'friends';
      }

      // Проверяем запросы на дружбу
      const { data: sentRequest } = await supabase
        .from('friend_requests')
        .select('*')
        .eq('sender_id', userId)
        .eq('receiver_id', targetUserId)
        .eq('status', 'pending')
        .single();

      if (sentRequest) {
        return 'pending_sent';
      }

      const { data: receivedRequest } = await supabase
        .from('friend_requests')
        .select('*')
        .eq('sender_id', targetUserId)
        .eq('receiver_id', userId)
        .eq('status', 'pending')
        .single();

      if (receivedRequest) {
        return 'pending_received';
      }

      return 'none';
    } catch (error) {
      console.error('Error getting friendship status:', error);
      return 'none';
    }
  }

  // Отправить запрос на дружбу
  static async sendFriendRequest(senderId: string, receiverId: string): Promise<{ success: boolean; message: string }> {
    try {
      // Проверяем, что пользователи не одинаковые
      if (senderId === receiverId) {
        return { success: false, message: 'Нельзя добавить себя в друзья' };
      }

      // Проверяем текущий статус
      const status = await this.getFriendshipStatus(senderId, receiverId);
      
      if (status === 'friends') {
        return { success: false, message: 'Вы уже друзья' };
      }
      
      if (status === 'pending_sent') {
        return { success: false, message: 'Запрос уже отправлен' };
      }
      
      if (status === 'pending_received') {
        return { success: false, message: 'У вас есть входящий запрос от этого пользователя' };
      }

      // Отправляем запрос
      const { error } = await supabase
        .from('friend_requests')
        .insert({
          sender_id: senderId,
          receiver_id: receiverId,
          status: 'pending'
        });

      if (error) throw error;

      return { success: true, message: 'Запрос на дружбу отправлен' };
    } catch (error) {
      console.error('Error sending friend request:', error);
      return { success: false, message: 'Не удалось отправить запрос' };
    }
  }

  // Принять запрос на дружбу
  static async acceptFriendRequest(requestId: string): Promise<{ success: boolean; message: string }> {
    try {
      // Получаем запрос
      const { data: request, error: requestError } = await supabase
        .from('friend_requests')
        .select('*')
        .eq('id', requestId)
        .eq('status', 'pending')
        .single();

      if (requestError || !request) {
        return { success: false, message: 'Запрос не найден' };
      }

      // Обновляем статус запроса
      const { error: updateError } = await supabase
        .from('friend_requests')
        .update({ status: 'accepted' })
        .eq('id', requestId);

      if (updateError) throw updateError;

      // Создаем взаимную дружбу
      const { error: friendshipError } = await supabase.rpc('create_mutual_friendship', {
        user1_id: request.sender_id,
        user2_id: request.receiver_id
      });

      if (friendshipError) throw friendshipError;

      return { success: true, message: 'Запрос принят! Теперь вы друзья' };
    } catch (error) {
      console.error('Error accepting friend request:', error);
      return { success: false, message: 'Не удалось принять запрос' };
    }
  }

  // Отклонить запрос на дружбу
  static async declineFriendRequest(requestId: string): Promise<{ success: boolean; message: string }> {
    try {
      const { error } = await supabase
        .from('friend_requests')
        .update({ status: 'declined' })
        .eq('id', requestId);

      if (error) throw error;

      return { success: true, message: 'Запрос отклонен' };
    } catch (error) {
      console.error('Error declining friend request:', error);
      return { success: false, message: 'Не удалось отклонить запрос' };
    }
  }

  // Удалить из друзей
  static async removeFriend(userId: string, friendId: string): Promise<{ success: boolean; message: string }> {
    try {
      // Удаляем взаимную дружбу
      const { error } = await supabase.rpc('remove_mutual_friendship', {
        user1_id: userId,
        user2_id: friendId
      });

      if (error) throw error;

      return { success: true, message: 'Пользователь удален из друзей' };
    } catch (error) {
      console.error('Error removing friend:', error);
      return { success: false, message: 'Не удалось удалить из друзей' };
    }
  }

  // Получить список друзей
  static async getFriends(userId: string): Promise<User[]> {
    try {
      const { data, error } = await supabase
        .from('friendships')
        .select(`
          friend_id,
          friend:profiles!friendships_friend_id_fkey (
            id,
            name,
            username,
            avatar_url,
            bio
          )
        `)
        .eq('user_id', userId);

      if (error) throw error;

      return data?.map(item => item.friend).filter(Boolean) || [];
    } catch (error) {
      console.error('Error getting friends:', error);
      return [];
    }
  }

  // Получить входящие запросы на дружбу
  static async getIncomingFriendRequests(userId: string): Promise<FriendRequest[]> {
    try {
      const { data, error } = await supabase
        .from('friend_requests')
        .select(`
          *,
          sender:profiles!friend_requests_sender_id_fkey (
            id,
            name,
            username,
            avatar_url,
            bio
          )
        `)
        .eq('receiver_id', userId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error getting incoming friend requests:', error);
      return [];
    }
  }

  // Получить исходящие запросы на дружбу
  static async getOutgoingFriendRequests(userId: string): Promise<FriendRequest[]> {
    try {
      const { data, error } = await supabase
        .from('friend_requests')
        .select(`
          *,
          receiver:profiles!friend_requests_receiver_id_fkey (
            id,
            name,
            username,
            avatar_url,
            bio
          )
        `)
        .eq('sender_id', userId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error getting outgoing friend requests:', error);
      return [];
    }
  }

  // Получить количество друзей
  static async getFriendsCount(userId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('friendships')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (error) throw error;

      return count || 0;
    } catch (error) {
      console.error('Error getting friends count:', error);
      return 0;
    }
  }
}