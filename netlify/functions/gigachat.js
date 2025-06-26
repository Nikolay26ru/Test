const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { messages, context: userContext } = JSON.parse(event.body);

    // Формируем системный промпт
    const systemPrompt = `Ты - AI-помощник для приложения списков желаний WishFlick. 
    Твоя задача - давать персонализированные рекомендации товаров и подарков на русском языке.
    
    Контекст пользователя: ${userContext || 'не предоставлен'}
    
    Правила:
    1. Отвечай только на русском языке
    2. Давай конкретные рекомендации товаров
    3. Указывай примерные цены в рублях
    4. Учитывай интересы и предыдущие покупки
    5. Формат ответа: маркированный список из 3-5 пунктов
    6. Будь дружелюбным и полезным`;

    const response = await fetch('https://gigachat.devices.sberbank.ru/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GIGA_AUTH_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'GigaChat',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      throw new Error(`GigaChat API error: ${response.status}`);
    }

    const data = await response.json();
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        reply: data.choices?.[0]?.message?.content || 'Не удалось получить рекомендации',
        usage: data.usage
      }),
    };

  } catch (error) {
    console.error('GigaChat function error:', error);
    
    // Fallback рекомендации
    const fallbackRecommendations = `
• **Умные часы Apple Watch или Samsung Galaxy Watch** (от 25,000 руб.) - для отслеживания здоровья и уведомлений
• **Беспроводные наушники AirPods или Sony WH-1000XM4** (от 15,000 руб.) - для музыки и звонков
• **Портативная колонка JBL или Marshall** (от 8,000 руб.) - для домашних вечеринок
• **Электронная книга Kindle или PocketBook** (от 12,000 руб.) - для любителей чтения
• **Подарочный сертификат в любимый магазин** (любая сумма) - универсальный вариант
    `.trim();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        reply: fallbackRecommendations,
        fallback: true,
        error: 'AI временно недоступен, показаны общие рекомендации'
      }),
    };
  }
};