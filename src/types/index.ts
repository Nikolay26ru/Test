export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  username?: string;
  bio?: string;
  privacy_settings?: 'public' | 'friends' | 'private';
  is_guest?: boolean;
  interests?: string[];
  created_at: string;
}

export interface WishList {
  id: string;
  title: string;
  description?: string;
  is_public: boolean;
  cover_image?: string;
  category?: string;
  tags?: string[];
  user_id: string;
  created_at: string;
  updated_at: string;
  user?: User;
  items?: WishItem[];
}

export interface WishItem {
  id: string;
  title: string;
  description?: string;
  price?: number;
  currency?: string;
  image_url?: string;
  store_url?: string;
  priority: 'low' | 'medium' | 'high';
  is_purchased: boolean;
  purchased_by?: string;
  wishlist_id: string;
  created_at: string;
  updated_at: string;
}

export interface Campaign {
  id: string;
  wishlist_item_id: string;
  goal_amount: number;
  current_amount: number;
  is_active: boolean;
  end_date?: string;
  created_at: string;
  updated_at: string;
  wishlist_item?: WishItem;
}

export interface Donation {
  id: string;
  campaign_id: string;
  user_id: string;
  amount: number;
  status: 'simulated' | 'pending' | 'completed';
  message?: string;
  is_anonymous: boolean;
  created_at: string;
}

export interface AIRecommendation {
  id: string;
  user_id: string;
  recommendations_text: string;
  context_hash: string;
  expires_at: string;
  created_at: string;
}

export interface UserInterest {
  id: string;
  user_id: string;
  category: string;
  keywords: string[];
  weight: number;
  created_at: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}