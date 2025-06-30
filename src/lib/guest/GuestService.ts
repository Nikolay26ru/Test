/**
 * Эталонный сервис для гостевого режима
 * Обеспечивает ограниченный функционал без сохранения данных
 */

import { LoggingService } from '../logging/LoggingService';
import { ValidationService } from '../validation/ValidationService';
import type { WishList, WishItem, User } from '../../types';

export class GuestService {
  private static readonly STORAGE_KEY = 'wishflick_guest_data';
  private static readonly SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 часа
  
  /**
   * Создание гостевой сессии
   */
  static createGuestSession(guestName?: string): User {
    const sessionId = this.generateSessionId();
    const name = guestName?.trim() || `Гость_${Math.random().toString(36).substring(7)}`;
    
    const guestUser: User = {
      id: sessionId,
      email: '',
      name,
      username: name.toLowerCase().replace(/\s+/g, '_'),
      privacy_settings: 'public',
      is_guest: true,
      email_verified: false,
      created_at: new Date().toISOString()
    };

    const sessionData = {
      user: guestUser,
      wishlists: [],
      expiresAt: Date.now() + this.SESSION_DURATION,
      createdAt: Date.now()
    };

    this.saveToStorage(sessionData);
    
    LoggingService.info('Создана гостевая сессия', { 
      sessionId, 
      name,
      expiresAt: new Date(sessionData.expiresAt).toISOString()
    });

    return guestUser;
  }

  /**
   * Получение гостевой сессии
   */
  static getGuestSession(): { user: User; wishlists: WishList[] } | null {
    try {
      const data = this.loadFromStorage();
      
      if (!data) {
        return null;
      }

      // Проверяем срок действия сессии
      if (Date.now() > data.expiresAt) {
        this.clearGuestSession();
        LoggingService.info('Гостевая сессия истекла');
        return null;
      }

      return {
        user: data.user,
        wishlists: data.wishlists || []
      };
    } catch (error) {
      LoggingService.error('Ошибка получения гостевой сессии', error);
      this.clearGuestSession();
      return null;
    }
  }

  /**
   * Обновление гостевого пользователя
   */
  static updateGuestUser(updates: Partial<User>): boolean {
    try {
      const data = this.loadFromStorage();
      if (!data) {
        return false;
      }

      // Валидация обновлений
      if (updates.name) {
        const validation = ValidationService.validateName(updates.name);
        if (!validation.isValid) {
          throw new Error(validation.error);
        }
      }

      data.user = { ...data.user, ...updates };
      this.saveToStorage(data);

      LoggingService.info('Гостевой пользователь обновлен', { 
        userId: data.user.id,
        updates: Object.keys(updates)
      });

      return true;
    } catch (error) {
      LoggingService.error('Ошибка обновления гостевого пользователя', error);
      return false;
    }
  }

  /**
   * Создание гостевого списка желаний
   */
  static createGuestWishlist(wishlistData: {
    title: string;
    description?: string;
    is_public: boolean;
    cover_image?: string;
  }): WishList | null {
    try {
      const data = this.loadFromStorage();
      if (!data) {
        throw new Error('Гостевая сессия не найдена');
      }

      // Валидация данных
      const validation = ValidationService.validateWishlistForm(wishlistData);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      const wishlist: WishList = {
        id: this.generateId(),
        title: wishlistData.title.trim(),
        description: wishlistData.description?.trim(),
        is_public: wishlistData.is_public,
        cover_image: wishlistData.cover_image?.trim(),
        user_id: data.user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        items: []
      };

      data.wishlists = data.wishlists || [];
      data.wishlists.unshift(wishlist);
      this.saveToStorage(data);

      LoggingService.info('Создан гостевой список желаний', { 
        wishlistId: wishlist.id,
        title: wishlist.title
      });

      return wishlist;
    } catch (error) {
      LoggingService.error('Ошибка создания гостевого списка', error);
      return null;
    }
  }

  /**
   * Обновление гостевого списка желаний
   */
  static updateGuestWishlist(wishlistId: string, updates: Partial<WishList>): boolean {
    try {
      const data = this.loadFromStorage();
      if (!data) {
        return false;
      }

      const wishlistIndex = data.wishlists.findIndex(w => w.id === wishlistId);
      if (wishlistIndex === -1) {
        return false;
      }

      data.wishlists[wishlistIndex] = {
        ...data.wishlists[wishlistIndex],
        ...updates,
        updated_at: new Date().toISOString()
      };

      this.saveToStorage(data);

      LoggingService.info('Гостевой список обновлен', { 
        wishlistId,
        updates: Object.keys(updates)
      });

      return true;
    } catch (error) {
      LoggingService.error('Ошибка обновления гостевого списка', error);
      return false;
    }
  }

  /**
   * Удаление гостевого списка желаний
   */
  static deleteGuestWishlist(wishlistId: string): boolean {
    try {
      const data = this.loadFromStorage();
      if (!data) {
        return false;
      }

      const initialLength = data.wishlists.length;
      data.wishlists = data.wishlists.filter(w => w.id !== wishlistId);

      if (data.wishlists.length === initialLength) {
        return false; // Список не найден
      }

      this.saveToStorage(data);

      LoggingService.info('Гостевой список удален', { wishlistId });

      return true;
    } catch (error) {
      LoggingService.error('Ошибка удаления гостевого списка', error);
      return false;
    }
  }

  /**
   * Добавление товара в гостевой список
   */
  static addGuestWishItem(wishlistId: string, itemData: {
    title: string;
    description?: string;
    price?: number;
    image_url?: string;
    store_url?: string;
    priority: 'low' | 'medium' | 'high';
  }): WishItem | null {
    try {
      const data = this.loadFromStorage();
      if (!data) {
        throw new Error('Гостевая сессия не найдена');
      }

      const wishlist = data.wishlists.find(w => w.id === wishlistId);
      if (!wishlist) {
        throw new Error('Список желаний не найден');
      }

      // Валидация данных
      const validation = ValidationService.validateWishItemForm(itemData);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      const item: WishItem = {
        id: this.generateId(),
        title: itemData.title.trim(),
        description: itemData.description?.trim(),
        price: itemData.price,
        currency: 'RUB',
        image_url: itemData.image_url?.trim(),
        store_url: itemData.store_url?.trim(),
        priority: itemData.priority,
        is_purchased: false,
        wishlist_id: wishlistId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      wishlist.items = wishlist.items || [];
      wishlist.items.unshift(item);
      wishlist.updated_at = new Date().toISOString();

      this.saveToStorage(data);

      LoggingService.info('Добавлен товар в гостевой список', { 
        itemId: item.id,
        wishlistId,
        title: item.title
      });

      return item;
    } catch (error) {
      LoggingService.error('Ошибка добавления товара в гостевой список', error);
      return null;
    }
  }

  /**
   * Обновление товара в гостевом списке
   */
  static updateGuestWishItem(wishlistId: string, itemId: string, updates: Partial<WishItem>): boolean {
    try {
      const data = this.loadFromStorage();
      if (!data) {
        return false;
      }

      const wishlist = data.wishlists.find(w => w.id === wishlistId);
      if (!wishlist || !wishlist.items) {
        return false;
      }

      const itemIndex = wishlist.items.findIndex(i => i.id === itemId);
      if (itemIndex === -1) {
        return false;
      }

      wishlist.items[itemIndex] = {
        ...wishlist.items[itemIndex],
        ...updates,
        updated_at: new Date().toISOString()
      };

      wishlist.updated_at = new Date().toISOString();
      this.saveToStorage(data);

      LoggingService.info('Товар в гостевом списке обновлен', { 
        itemId,
        wishlistId,
        updates: Object.keys(updates)
      });

      return true;
    } catch (error) {
      LoggingService.error('Ошибка обновления товара в гостевом списке', error);
      return false;
    }
  }

  /**
   * Удаление товара из гостевого списка
   */
  static deleteGuestWishItem(wishlistId: string, itemId: string): boolean {
    try {
      const data = this.loadFromStorage();
      if (!data) {
        return false;
      }

      const wishlist = data.wishlists.find(w => w.id === wishlistId);
      if (!wishlist || !wishlist.items) {
        return false;
      }

      const initialLength = wishlist.items.length;
      wishlist.items = wishlist.items.filter(i => i.id !== itemId);

      if (wishlist.items.length === initialLength) {
        return false; // Товар не найден
      }

      wishlist.updated_at = new Date().toISOString();
      this.saveToStorage(data);

      LoggingService.info('Товар удален из гостевого списка', { itemId, wishlistId });

      return true;
    } catch (error) {
      LoggingService.error('Ошибка удаления товара из гостевого списка', error);
      return false;
    }
  }

  /**
   * Получение ограничений гостевого режима
   */
  static getGuestLimitations(): {
    maxWishlists: number;
    maxItemsPerWishlist: number;
    maxImageSize: number;
    allowedFeatures: string[];
    restrictedFeatures: string[];
  } {
    return {
      maxWishlists: 3,
      maxItemsPerWishlist: 10,
      maxImageSize: 1024 * 1024, // 1MB
      allowedFeatures: [
        'create_wishlists',
        'add_items',
        'view_public_lists',
        'ai_recommendations'
      ],
      restrictedFeatures: [
        'social_features',
        'crowdfunding',
        'email_notifications',
        'data_export',
        'advanced_privacy'
      ]
    };
  }

  /**
   * Проверка лимитов гостевого режима
   */
  static checkGuestLimits(action: string, data?: any): { allowed: boolean; reason?: string } {
    try {
      const sessionData = this.loadFromStorage();
      if (!sessionData) {
        return { allowed: false, reason: 'Гостевая сессия не найдена' };
      }

      const limits = this.getGuestLimitations();

      switch (action) {
        case 'create_wishlist':
          if (sessionData.wishlists.length >= limits.maxWishlists) {
            return { 
              allowed: false, 
              reason: `Максимум ${limits.maxWishlists} списков в гостевом режиме` 
            };
          }
          break;

        case 'add_item':
          const wishlist = sessionData.wishlists.find(w => w.id === data?.wishlistId);
          if (wishlist && wishlist.items && wishlist.items.length >= limits.maxItemsPerWishlist) {
            return { 
              allowed: false, 
              reason: `Максимум ${limits.maxItemsPerWishlist} товаров в списке` 
            };
          }
          break;

        case 'use_feature':
          if (limits.restrictedFeatures.includes(data?.feature)) {
            return { 
              allowed: false, 
              reason: 'Функция недоступна в гостевом режиме' 
            };
          }
          break;
      }

      return { allowed: true };
    } catch (error) {
      LoggingService.error('Ошибка проверки лимитов гостевого режима', error);
      return { allowed: false, reason: 'Ошибка проверки лимитов' };
    }
  }

  /**
   * Очистка гостевой сессии
   */
  static clearGuestSession(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      LoggingService.info('Гостевая сессия очищена');
    } catch (error) {
      LoggingService.error('Ошибка очистки гостевой сессии', error);
    }
  }

  /**
   * Экспорт данных гостя для миграции
   */
  static exportGuestData(): any {
    try {
      const data = this.loadFromStorage();
      if (!data) {
        return null;
      }

      return {
        user: data.user,
        wishlists: data.wishlists,
        exportedAt: new Date().toISOString()
      };
    } catch (error) {
      LoggingService.error('Ошибка экспорта данных гостя', error);
      return null;
    }
  }

  /**
   * Генерация ID сессии
   */
  private static generateSessionId(): string {
    return `guest_${Date.now()}_${Math.random().toString(36).substring(2)}`;
  }

  /**
   * Генерация ID
   */
  private static generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substring(2)}`;
  }

  /**
   * Сохранение в localStorage
   */
  private static saveToStorage(data: any): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      LoggingService.error('Ошибка сохранения в localStorage', error);
      throw new Error('Не удалось сохранить данные');
    }
  }

  /**
   * Загрузка из localStorage
   */
  private static loadFromStorage(): any {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      LoggingService.error('Ошибка загрузки из localStorage', error);
      return null;
    }
  }
}