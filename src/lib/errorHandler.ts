// Централизованная система обработки ошибок
export class ErrorHandler {
  static handleSupabaseError(error: any, context: string = ''): string {
    console.error(`Supabase error in ${context}:`, error);
    
    // Специфичные ошибки Supabase
    if (error?.code === 'PGRST116') {
      return 'Запись не найдена';
    }
    
    if (error?.code === '23505') {
      return 'Такая запись уже существует';
    }
    
    if (error?.code === '23503') {
      return 'Нарушение связи данных';
    }
    
    if (error?.code === '42501') {
      return 'Недостаточно прав доступа';
    }
    
    // Ошибки сети
    if (error?.message?.includes('Failed to fetch')) {
      return 'Проблемы с подключением к серверу';
    }
    
    if (error?.message?.includes('timeout')) {
      return 'Превышено время ожидания';
    }
    
    // Общие ошибки
    if (error?.message) {
      return error.message;
    }
    
    return 'Произошла неизвестная ошибка';
  }
  
  static handleAuthError(error: any): string {
    console.error('Auth error:', error);
    
    if (error?.message?.includes('Invalid login credentials')) {
      return 'Неверный email или пароль';
    }
    
    if (error?.message?.includes('Email not confirmed')) {
      return 'Подтвердите email для входа';
    }
    
    if (error?.message?.includes('User already registered')) {
      return 'Пользователь с таким email уже существует';
    }
    
    return this.handleSupabaseError(error, 'auth');
  }
  
  static handleNetworkError(error: any): string {
    console.error('Network error:', error);
    
    if (!navigator.onLine) {
      return 'Отсутствует подключение к интернету';
    }
    
    return 'Ошибка сети. Проверьте подключение';
  }
  
  static showToast(message: string, type: 'success' | 'error' | 'info' = 'error') {
    // Создаем toast уведомление
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 max-w-md ${
      type === 'success' ? 'bg-green-600 text-white' :
      type === 'error' ? 'bg-red-600 text-white' :
      'bg-blue-600 text-white'
    }`;
    toast.innerHTML = `<p class="text-sm">${message}</p>`;
    
    document.body.appendChild(toast);
    
    // Удаляем через 3 секунды
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 3000);
  }
}

// Глобальный обработчик необработанных ошибок
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  ErrorHandler.showToast('Произошла неожиданная ошибка');
});

window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
  ErrorHandler.showToast('Произошла ошибка приложения');
});