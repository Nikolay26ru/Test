import { supabase } from './supabase';
import type { ProductRecommendation, WishItem } from '../types';

export class ProductRecommendationService {
  private static readonly MIN_VIEWS_THRESHOLD = 5; // Минимум просмотров для рекомендаций

  // Записать просмотр товара
  static async recordProductView(userId: string, wishlistItemId: string): Promise<void> {
    try {
      await supabase
        .from('product_views')
        .insert({
          user_id: userId,
          wishlist_item_id: wishlistItemId
        });
    } catch (error) {
      console.error('Error recording product view:', error);
    }
  }

  // Получить количество просмотров пользователя
  static async getUserViewCount(userId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('product_views')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (error) throw error;

      return count || 0;
    } catch (error) {
      console.error('Error getting user view count:', error);
      return 0;
    }
  }

  // Проверить, достаточно ли просмотров для рекомендаций
  static async hasEnoughViews(userId: string): Promise<boolean> {
    const viewCount = await this.getUserViewCount(userId);
    return viewCount >= this.MIN_VIEWS_THRESHOLD;
  }

  // Получить историю просмотров пользователя
  static async getUserViewHistory(userId: string, limit: number = 50): Promise<WishItem[]> {
    try {
      const { data, error } = await supabase
        .from('product_views')
        .select(`
          wishlist_item:wishlist_items (
            id,
            title,
            description,
            price,
            currency,
            image_url,
            store_url,
            priority,
            category:wishlists(category)
          )
        `)
        .eq('user_id', userId)
        .order('viewed_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data?.map(item => item.wishlist_item).filter(Boolean) || [];
    } catch (error) {
      console.error('Error getting user view history:', error);
      return [];
    }
  }

  // Генерировать рекомендации на основе истории просмотров
  static async generateRecommendations(userId: string): Promise<{ success: boolean; recommendations?: WishItem[]; message: string }> {
    try {
      // Проверяем количество просмотров
      const hasEnough = await this.hasEnoughViews(userId);
      
      if (!hasEnough) {
        return {
          success: false,
          message: 'Вы не достаточно смотрели товары чтобы дать вам рекомендации.'
        };
      }

      // Проверяем кэш рекомендаций
      const { data: cached } = await supabase
        .from('product_recommendations')
        .select('*')
        .eq('user_id', userId)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (cached) {
        return {
          success: true,
          recommendations: cached.recommended_items,
          message: 'Рекомендации загружены из кэша'
        };
      }

      // Получаем историю просмотров
      const viewHistory = await this.getUserViewHistory(userId, 20);
      
      if (viewHistory.length === 0) {
        return {
          success: false,
          message: 'Недостаточно данных для генерации рекомендаций'
        };
      }

      // Анализируем предпочтения пользователя
      const preferences = this.analyzeUserPreferences(viewHistory);
      
      // Получаем рекомендации на основе предпочтений
      const recommendations = await this.findSimilarProducts(preferences, userId);

      // Сохраняем в кэш
      const viewCount = await this.getUserViewCount(userId);
      await supabase
        .from('product_recommendations')
        .upsert({
          user_id: userId,
          recommended_items: recommendations,
          view_count: viewCount,
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        });

      return {
        success: true,
        recommendations,
        message: 'Рекомендации успешно сгенерированы'
      };
    } catch (error) {
      console.error('Error generating recommendations:', error);
      return {
        success: false,
        message: 'Ошибка при генерации рекомендаций'
      };
    }
  }

  // Анализ предпочтений пользователя
  private static analyzeUserPreferences(viewHistory: WishItem[]): {
    categories: string[];
    priceRanges: { min: number; max: number }[];
    keywords: string[];
  } {
    const categories: { [key: string]: number } = {};
    const prices: number[] = [];
    const keywords: { [key: string]: number } = {};

    viewHistory.forEach(item => {
      // Анализ категорий
      if (item.category) {
        categories[item.category] = (categories[item.category] || 0) + 1;
      }

      // Анализ цен
      if (item.price) {
        prices.push(item.price);
      }

      // Анализ ключевых слов из названий и описаний
      const text = `${item.title} ${item.description || ''}`.toLowerCase();
      const words = text.split(/\s+/).filter(word => word.length > 3);
      words.forEach(word => {
        keywords[word] = (keywords[word] || 0) + 1;
      });
    });

    // Определяем топ категории
    const topCategories = Object.entries(categories)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([category]) => category);

    // Определяем ценовые диапазоны
    const sortedPrices = prices.sort((a, b) => a - b);
    const priceRanges = [];
    if (sortedPrices.length > 0) {
      const min = sortedPrices[0];
      const max = sortedPrices[sortedPrices.length - 1];
      const mid = sortedPrices[Math.floor(sortedPrices.length / 2)];
      
      priceRanges.push(
        { min: min * 0.8, max: mid * 1.2 },
        { min: mid * 0.8, max: max * 1.2 }
      );
    }

    // Определяем топ ключевые слова
    const topKeywords = Object.entries(keywords)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([keyword]) => keyword);

    return {
      categories: topCategories,
      priceRanges,
      keywords: topKeywords
    };
  }

  // Поиск похожих товаров
  private static async findSimilarProducts(preferences: any, userId: string): Promise<WishItem[]> {
    try {
      // Получаем товары из публичных списков, исключая уже просмотренные
      const { data: viewedItems } = await supabase
        .from('product_views')
        .select('wishlist_item_id')
        .eq('user_id', userId);

      const viewedItemIds = viewedItems?.map(v => v.wishlist_item_id) || [];

      let query = supabase
        .from('wishlist_items')
        .select(`
          *,
          wishlist:wishlists!inner (
            id,
            is_public,
            category,
            user_id
          )
        `)
        .eq('wishlist.is_public', true)
        .neq('wishlist.user_id', userId);

      if (viewedItemIds.length > 0) {
        query = query.not('id', 'in', `(${viewedItemIds.join(',')})`);
      }

      const { data: allItems, error } = await query.limit(100);

      if (error) throw error;

      if (!allItems || allItems.length === 0) {
        return [];
      }

      // Фильтруем и ранжируем товары по предпочтениям
      const scoredItems = allItems.map(item => {
        let score = 0;

        // Бонус за категорию
        if (preferences.categories.includes(item.wishlist?.category)) {
          score += 3;
        }

        // Бонус за ценовой диапазон
        if (item.price) {
          const inPriceRange = preferences.priceRanges.some(range => 
            item.price >= range.min && item.price <= range.max
          );
          if (inPriceRange) {
            score += 2;
          }
        }

        // Бонус за ключевые слова
        const itemText = `${item.title} ${item.description || ''}`.toLowerCase();
        preferences.keywords.forEach(keyword => {
          if (itemText.includes(keyword)) {
            score += 1;
          }
        });

        // Бонус за приоритет
        if (item.priority === 'high') score += 1;

        return { ...item, score };
      });

      // Сортируем по рейтингу и возвращаем топ-10
      return scoredItems
        .sort((a, b) => b.score - a.score)
        .slice(0, 10)
        .map(({ score, ...item }) => item);
    } catch (error) {
      console.error('Error finding similar products:', error);
      return [];
    }
  }

  // Получить сохраненные рекомендации
  static async getSavedRecommendations(userId: string): Promise<WishItem[]> {
    try {
      const { data, error } = await supabase
        .from('product_recommendations')
        .select('recommended_items')
        .eq('user_id', userId)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;

      return data?.recommended_items || [];
    } catch (error) {
      console.error('Error getting saved recommendations:', error);
      return [];
    }
  }
}