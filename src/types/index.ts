export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  created_at: string;
}

export interface WishList {
  id: string;
  title: string;
  description?: string;
  is_public: boolean;
  cover_image?: string;
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
  wishlist_id: string;
  created_at: string;
  updated_at: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}