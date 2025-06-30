export interface AIRecommendationRequest {
  context: string;
  userMessage?: string;
}

export interface AIRecommendationResponse {
  reply: string;
  fallback?: boolean;
  error?: string;
  usage?: any;
}

export const getAIRecommendations = async (
  request: AIRecommendationRequest
): Promise<AIRecommendationResponse> => {
  try {
    console.log('🤖 Requesting AI recommendations...');
    
    const response = await fetch('/.netlify/functions/gigachat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'user',
            content: request.userMessage || 
              `Дай мне персонализированные рекомендации товаров для списка желаний на основе моих данных.`
          }
        ],
        context: request.context
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ AI recommendations received');
    return data;
  } catch (error) {
    console.error('❌ AI recommendations error:', error);
    
    // Возвращаем fallback рекомендации
    const fallbackRecommendations = `
• **Умные часы Apple Watch или Samsung Galaxy Watch** (от 25,000 руб.) - для отслеживания здоровья и уведомлений
• **Беспроводные наушники AirPods или Sony WH-1000XM4** (от 15,000 руб.) - для музыки и звонков
• **Портативная колонка JBL или Marshall** (от 8,000 руб.) - для домашних вечеринок
• **Электронная книга Kindle или PocketBook** (от 12,000 руб.) - для любителей чтения
• **Подарочный сертификат в любимый магазин** (любая сумма) - универсальный вариант
    `.trim();

    return {
      reply: fallbackRecommendations,
      fallback: true,
      error: 'AI временно недоступен, показаны общие рекомендации'
    };
  }
};

export const buildUserContext = async (userId: string, supabase: any): Promise<string> => {
  try {
    console.log('🔍 Building user context for recommendations...');
    
    // Получаем профиль пользователя
    const { data: profile } = await supabase
      .from('profiles')
      .select('interests, bio')
      .eq('id', userId)
      .single();

    // Получаем списки желаний
    const { data: wishlists } = await supabase
      .from('wishlists')
      .select(`
        title,
        category,
        tags,
        wishlist_items (
          title,
          price,
          priority,
          is_purchased
        )
      `)
      .eq('user_id', userId)
      .limit(5);

    // Получаем интересы
    const { data: interests } = await supabase
      .from('user_interests')
      .select('category, keywords')
      .eq('user_id', userId);

    // Получаем историю просмотров
    const { data: views } = await supabase
      .from('product_views')
      .select(`
        wishlist_item:wishlist_items (
          title,
          price,
          priority
        )
      `)
      .eq('user_id', userId)
      .order('viewed_at', { ascending: false })
      .limit(10);

    // Формируем контекст
    let context = '';
    
    if (profile?.bio) {
      context += `О себе: ${profile.bio}. `;
    }

    if (profile?.interests?.length > 0) {
      context += `Интересы: ${profile.interests.join(', ')}. `;
    }

    if (interests?.length > 0) {
      const categories = interests.map(i => i.category).join(', ');
      context += `Категории интересов: ${categories}. `;
    }

    if (wishlists?.length > 0) {
      const items = wishlists
        .flatMap(w => w.wishlist_items || [])
        .filter(item => !item.is_purchased)
        .slice(0, 10)
        .map(item => `${item.title} (${item.price ? item.price + ' руб.' : 'цена не указана'})`)
        .join(', ');
      
      if (items) {
        context += `Текущие желания: ${items}. `;
      }

      const categories = wishlists
        .map(w => w.category)
        .filter(Boolean)
        .join(', ');
      
      if (categories) {
        context += `Категории списков: ${categories}. `;
      }
    }

    if (views?.length > 0) {
      const viewedItems = views
        .map(v => v.wishlist_item)
        .filter(Boolean)
        .map(item => item.title)
        .join(', ');
      
      if (viewedItems) {
        context += `Недавно просмотренные товары: ${viewedItems}. `;
      }
    }

    const finalContext = context || 'Данные о предпочтениях пользователя отсутствуют';
    console.log('✅ User context built successfully');
    return finalContext;
  } catch (error) {
    console.error('❌ Error building user context:', error);
    return 'Не удалось загрузить контекст пользователя';
  }
};