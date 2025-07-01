import { supabase } from '../lib/supabase';
import type { WishList, WishItem, ApiResponse } from '../types';

export interface CreateWishlistData {
  title: string;
  description?: string;
  is_public: boolean;
  cover_image?: string;
  category?: string;
  tags?: string[];
}

export interface CreateWishItemData {
  title: string;
  description?: string;
  price?: number;
  currency?: string;
  image_url?: string;
  store_url?: string;
  priority: 'low' | 'medium' | 'high';
  wishlist_id: string;
}

export const wishlistsApi = {
  async getWishlists(userId: string): Promise<ApiResponse<WishList[]>> {
    try {
      const { data, error } = await supabase
        .from('wishlists')
        .select(`
          *,
          wishlist_items (*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return { success: true, data: data || [] };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.message || 'Не удалось загрузить списки желаний' 
      };
    }
  },

  async getWishlist(id: string): Promise<ApiResponse<WishList>> {
    try {
      const { data, error } = await supabase
        .from('wishlists')
        .select(`
          *,
          profiles (
            id,
            name,
            username,
            avatar_url,
            bio
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      return { success: true, data };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.message || 'Список желаний не найден' 
      };
    }
  },

  async createWishlist(data: CreateWishlistData, userId: string): Promise<ApiResponse<WishList>> {
    try {
      const { data: wishlist, error } = await supabase
        .from('wishlists')
        .insert({
          ...data,
          user_id: userId
        })
        .select()
        .single();

      if (error) throw error;

      return { success: true, data: wishlist };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.message || 'Не удалось создать список желаний' 
      };
    }
  },

  async updateWishlist(id: string, data: Partial<CreateWishlistData>): Promise<ApiResponse<WishList>> {
    try {
      const { data: wishlist, error } = await supabase
        .from('wishlists')
        .update({
          ...data,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return { success: true, data: wishlist };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.message || 'Не удалось обновить список желаний' 
      };
    }
  },

  async deleteWishlist(id: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase
        .from('wishlists')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.message || 'Не удалось удалить список желаний' 
      };
    }
  },

  async getWishlistItems(wishlistId: string): Promise<ApiResponse<WishItem[]>> {
    try {
      const { data, error } = await supabase
        .from('wishlist_items')
        .select('*')
        .eq('wishlist_id', wishlistId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return { success: true, data: data || [] };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.message || 'Не удалось загрузить товары' 
      };
    }
  },

  async createWishItem(data: CreateWishItemData): Promise<ApiResponse<WishItem>> {
    try {
      const { data: item, error } = await supabase
        .from('wishlist_items')
        .insert(data)
        .select()
        .single();

      if (error) throw error;

      return { success: true, data: item };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.message || 'Не удалось добавить товар' 
      };
    }
  },

  async updateWishItem(id: string, data: Partial<CreateWishItemData>): Promise<ApiResponse<WishItem>> {
    try {
      const { data: item, error } = await supabase
        .from('wishlist_items')
        .update({
          ...data,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return { success: true, data: item };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.message || 'Не удалось обновить товар' 
      };
    }
  },

  async deleteWishItem(id: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase
        .from('wishlist_items')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.message || 'Не удалось удалить товар' 
      };
    }
  },

  async togglePurchased(id: string, isPurchased: boolean, purchasedBy?: string): Promise<ApiResponse<WishItem>> {
    try {
      const { data: item, error } = await supabase
        .from('wishlist_items')
        .update({
          is_purchased: isPurchased,
          purchased_by: isPurchased ? purchasedBy : null,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return { success: true, data: item };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.message || 'Не удалось обновить статус товара' 
      };
    }
  }
};