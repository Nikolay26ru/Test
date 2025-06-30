// Сервис для работы с GigaChat API
export interface GigaChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface GigaChatResponse {
  reply: string;
  usage?: any;
  fallback?: boolean;
  error?: string;
}

export async function getAIRecommendations(params: {
  context: string;
  messages?: GigaChatMessage[];
}): Promise<GigaChatResponse> {
  try {
    console.log('🤖 Отправка запроса к GigaChat API');
    
    const messages: GigaChatMessage[] = params.messages || [
      { role: 'user', content: 'Дай мне персональные рекомендации товаров на основе моих интересов' }
    ];

    const response = await fetch('/.netlify/functions/gigachat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages,
        context: params.context
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Получен ответ от GigaChat API');
    
    return data;
  } catch (error) {
    console.error('❌ Ошибка GigaChat API:', error);
    
    // Возвращаем fallback рекомендации
    return {
      reply: `
• **Умные часы Apple Watch или Samsung Galaxy Watch** (от 25,000 руб.) - для отслеживания здоровья и уведомлений
• **Беспроводные наушники AirPods или Sony WH-1000XM4** (от 15,000 руб.) - для музыки и звонков
• **Портативная колонка JBL или Marshall** (от 8,000 руб.) - для домашних вечеринок
• **Электронная книга Kindle или PocketBook** (от 12,000 руб.) - для любителей чтения
• **Подарочный сертификат в любимый магазин** (любая сумма) - универсальный вариант
      `.trim(),
      fallback: true,
      error: 'AI временно недоступен, показаны общие рекомендации'
    };
  }
}

export async function buildUserContext(userId: string, supabase: any): Promise<string> {
  try {
    // Получаем интересы пользователя
    const { data: interests } = await supabase
      .from('user_interests')
      .select('category, keywords')
      .eq('user_id', userId);

    // Получаем последние просмотры
    const { data: views } = await supabase
      .from('product_views')
      .select(`
        wishlist_item:wishlist_items (
          title,
          description,
          price,
          category
        )
      `)
      .eq('user_id', userId)
      .order('viewed_at', { ascending: false })
      .limit(10);

    // Получаем списки пользователя
    const { data: wishlists } = await supabase
      .from('wishlists')
      .select('title, description, category')
      .eq('user_id', userId)
      .limit(5);

    // Формируем контекст
    let context = 'Пользователь интересуется: ';
    
    if (interests && interests.length > 0) {
      const categories = interests.map(i => i.category).join(', ');
      context += categories + '. ';
    }

    if (views && views.length > 0) {
      context += 'Недавно просматривал: ';
      const viewedItems = views
        .map(v => v.wishlist_item?.title)
        .filter(Boolean)
        .slice(0, 5)
        .join(', ');
      context += viewedItems + '. ';
    }

    if (wishlists && wishlists.length > 0) {
      context += 'Создавал списки: ';
      const listTitles = wishlists.map(w => w.title).join(', ');
      context += listTitles + '. ';
    }

    return context || 'Новый пользователь без истории покупок';
  } catch (error) {
    console.error('Ошибка построения контекста:', error);
    return 'Пользователь без определенных предпочтений';
  }
}