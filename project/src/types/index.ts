export interface User {
  id: string;
  name: string;
  avatar: string;
  email?: string;
  bio?: string;
  followers: number;
  following: number;
  isFollowing?: boolean;
  privacyLevel: 'public' | 'friends' | 'private';
}

export interface GiftItem {
  id: string;
  title: string;
  description: string;
  price: number;
  imageUrl: string;
  link?: string;
  currentAmount: number;
  goalAmount: number;
  contributors: number;
  isCompleted: boolean;
  category: string;
  tags: string[];
}

export interface Wishlist {
  id: string;
  title: string;
  description: string;
  user: User;
  items: GiftItem[];
  isPublic: boolean;
  createdAt: string;
  likes: number;
  comments: number;
  isLiked?: boolean;
}

export interface Comment {
  id: string;
  user: User;
  text: string;
  createdAt: string;
  likes: number;
  isLiked?: boolean;
}

export interface Activity {
  id: string;
  type: 'wishlist_created' | 'item_added' | 'contribution_made' | 'goal_reached';
  user: User;
  target?: string;
  timestamp: string;
  data: any;
}

export interface Contribution {
  id: string;
  user: User;
  amount: number;
  giftItem: GiftItem;
  timestamp: string;
  message?: string;
}