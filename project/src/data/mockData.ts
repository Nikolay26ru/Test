import { User, Wishlist, GiftItem, Activity } from '../types';

export const currentUser: User = {
  id: '1',
  name: 'Анна Иванова',
  avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=200',
  email: 'anna@example.com',
  bio: 'Люблю путешествия и красивые вещи ✨',
  followers: 542,
  following: 234,
  privacyLevel: 'public'
};

export const users: User[] = [
  {
    id: '2',
    name: 'Максим Петров',
    avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=200',
    followers: 1203,
    following: 456,
    privacyLevel: 'public'
  },
  {
    id: '3',
    name: 'София Смирнова',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=200',
    followers: 892,
    following: 321,
    privacyLevel: 'public'
  },
  {
    id: '4',
    name: 'Алексей Волков',
    avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=200',
    followers: 2456,
    following: 678,
    privacyLevel: 'public'
  }
];

export const giftItems: GiftItem[] = [
  {
    id: '1',
    title: 'MacBook Pro 14"',
    description: 'Новый MacBook Pro с чипом M3 для работы и творчества',
    price: 189990,
    imageUrl: 'https://images.pexels.com/photos/18105/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=300',
    currentAmount: 75000,
    goalAmount: 189990,
    contributors: 12,
    isCompleted: false,
    category: 'Техника',
    tags: ['Apple', 'Ноутбук', 'Работа']
  },
  {
    id: '2',
    title: 'Поездка в Японию',
    description: 'Мечтаю посетить Токио и увидеть цветение сакуры',
    price: 120000,
    imageUrl: 'https://images.pexels.com/photos/1440476/pexels-photo-1440476.jpeg?auto=compress&cs=tinysrgb&w=300',
    currentAmount: 120000,
    goalAmount: 120000,
    contributors: 8,
    isCompleted: true,
    category: 'Путешествия',
    tags: ['Япония', 'Путешествия', 'Сакура']
  },
  {
    id: '3',
    title: 'Профессиональная камера',
    description: 'Canon EOS R5 для фотосъемки и видеоблогинга',
    price: 265000,
    imageUrl: 'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg?auto=compress&cs=tinysrgb&w=300',
    currentAmount: 45000,
    goalAmount: 265000,
    contributors: 5,
    isCompleted: false,
    category: 'Техника',
    tags: ['Canon', 'Фотография', 'Видео']
  },
  {
    id: '4',
    title: 'Курс программирования',
    description: 'Онлайн курс Full-Stack разработки',
    price: 89000,
    imageUrl: 'https://images.pexels.com/photos/574071/pexels-photo-574071.jpeg?auto=compress&cs=tinysrgb&w=300',
    currentAmount: 65000,
    goalAmount: 89000,
    contributors: 15,
    isCompleted: false,
    category: 'Образование',
    tags: ['Программирование', 'Курсы', 'IT']
  }
];

export const wishlists: Wishlist[] = [
  {
    id: '1',
    title: 'Мои большие мечты 2024',
    description: 'Список самых важных желаний на этот год',
    user: currentUser,
    items: giftItems.slice(0, 2),
    isPublic: true,
    createdAt: '2024-01-15',
    likes: 127,
    comments: 23,
    isLiked: false
  },
  {
    id: '2',
    title: 'День рождения Максима',
    description: 'Собираем на подарок другу!',
    user: users[0],
    items: [giftItems[2]],
    isPublic: true,
    createdAt: '2024-01-20',
    likes: 89,
    comments: 34,
    isLiked: true
  },
  {
    id: '3',
    title: 'Обучение и развитие',
    description: 'Инвестиции в себя и свое будущее',
    user: users[1],
    items: [giftItems[3]],
    isPublic: true,
    createdAt: '2024-01-25',
    likes: 156,
    comments: 12,
    isLiked: false
  }
];

export const activities: Activity[] = [
  {
    id: '1',
    type: 'contribution_made',
    user: users[0],
    target: 'MacBook Pro 14"',
    timestamp: '2024-01-28T10:30:00Z',
    data: { amount: 5000, giftId: '1' }
  },
  {
    id: '2',
    type: 'goal_reached',
    user: currentUser,
    target: 'Поездка в Японию',
    timestamp: '2024-01-27T15:45:00Z',
    data: { giftId: '2' }
  },
  {
    id: '3',
    type: 'wishlist_created',
    user: users[1],
    target: 'Обучение и развитие',
    timestamp: '2024-01-25T12:20:00Z',
    data: { wishlistId: '3' }
  },
  {
    id: '4',
    type: 'item_added',
    user: users[2],
    target: 'Новая гитара',
    timestamp: '2024-01-24T18:15:00Z',
    data: { giftId: '5' }
  }
];