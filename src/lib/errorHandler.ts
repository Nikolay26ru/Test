// Централизованная система обработки ошибок
export class ErrorHandler {
  private static toastContainer: HTMLElement | null = null;

  static init() {
    // Создаем контейнер для уведомлений
    if (!this.toastContainer) {
      this.toastContainer = document.createElement('div');
      this.toastContainer.id = 'toast-container';
      this.toastContainer.className = 'fixed top-4 right-4 z-50 space-y-2';
      document.body.appendChild(this.toastContainer);
    }
  }

  static handleSupabaseError(error: any, context: string = ''): string {
    console.error(`🔴 Ошибка Supabase в ${context}:`, error);
    
    // Специфичные ошибки Supabase
    const errorMappings: Record<string, string> = {
      'PGRST116': 'Запись не найдена',
      '23505': 'Такая запись уже существует',
      '23503': 'Нарушение связи данных',
      '42501': 'Недостаточно прав доступа',
      '23514': 'Нарушение ограничения данных',
      '08006': 'Ошибка подключения к базе данных',
      '53300': 'Слишком много подключений к базе данных'
    };

    if (error?.code && errorMappings[error.code]) {
      return errorMappings[error.code];
    }
    
    // Ошибки сети
    if (error?.message?.includes('Failed to fetch')) {
      return 'Проблемы с подключением к серверу';
    }
    
    if (error?.message?.includes('timeout')) {
      return 'Превышено время ожидания';
    }

    if (error?.message?.includes('NetworkError')) {
      return 'Ошибка сети. Проверьте подключение к интернету';
    }
    
    // Общие ошибки
    if (error?.message) {
      return error.message;
    }
    
    return 'Произошла неизвестная ошибка';
  }
  
  static handleAuthError(error: any): string {
    console.error('🔴 Ошибка авторизации:', error);
    
    const authErrorMappings: Record<string, string> = {
      'invalid_credentials': 'Неверный email или пароль',
      'email_not_confirmed': 'Подтвердите email для входа',
      'user_already_exists': 'Пользователь с таким email уже существует',
      'weak_password': 'Пароль слишком слабый',
      'signup_disabled': 'Регистрация временно отключена',
      'email_address_invalid': 'Неверный формат email адреса',
      'password_too_short': 'Пароль должен содержать минимум 6 символов',
      'anonymous_provider_disabled': 'Анонимный вход отключен'
    };

    // Проверяем код ошибки
    if (error?.error_code && authErrorMappings[error.error_code]) {
      return authErrorMappings[error.error_code];
    }

    // Проверяем сообщение ошибки
    const message = error?.message?.toLowerCase() || '';
    
    if (message.includes('invalid login credentials')) {
      return 'Неверный email или пароль';
    }
    
    if (message.includes('email not confirmed')) {
      return 'Подтвердите email для входа';
    }
    
    if (message.includes('user already registered')) {
      return 'Пользователь с таким email уже существует';
    }

    if (message.includes('anonymous sign-ins are disabled')) {
      return 'Гостевой вход временно недоступен';
    }

    if (message.includes('email address is invalid')) {
      return 'Неверный формат email адреса';
    }
    
    return this.handleSupabaseError(error, 'авторизация');
  }
  
  static handleNetworkError(error: any): string {
    console.error('🔴 Ошибка сети:', error);
    
    if (!navigator.onLine) {
      return 'Отсутствует подключение к интернету';
    }
    
    if (error?.code === 'NETWORK_ERROR') {
      return 'Ошибка сети. Проверьте подключение';
    }

    if (error?.code === 'TIMEOUT') {
      return 'Превышено время ожидания ответа сервера';
    }
    
    return 'Ошибка сети. Проверьте подключение';
  }

  static handleValidationError(errors: Record<string, string>): string {
    const errorMessages = Object.values(errors);
    return errorMessages.length > 0 ? errorMessages[0] : 'Ошибка валидации данных';
  }
  
  static showToast(message: string, type: 'success' | 'error' | 'info' | 'warning' = 'error', duration: number = 5000) {
    this.init();
    
    if (!this.toastContainer) return;

    // Создаем toast уведомление
    const toast = document.createElement('div');
    const toastId = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    toast.id = toastId;
    
    const typeStyles = {
      success: 'bg-green-600 text-white border-green-700',
      error: 'bg-red-600 text-white border-red-700',
      warning: 'bg-orange-600 text-white border-orange-700',
      info: 'bg-blue-600 text-white border-blue-700'
    };

    const typeIcons = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️'
    };
    
    toast.className = `px-4 py-3 rounded-lg shadow-lg border-l-4 max-w-md transform transition-all duration-300 ease-in-out ${typeStyles[type]}`;
    toast.innerHTML = `
      <div class="flex items-start space-x-3">
        <span class="text-lg">${typeIcons[type]}</span>
        <div class="flex-1">
          <p class="text-sm font-medium">${message}</p>
        </div>
        <button onclick="document.getElementById('${toastId}').remove()" class="text-white hover:text-gray-200 transition-colors">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
    `;
    
    // Анимация появления
    toast.style.transform = 'translateX(100%)';
    toast.style.opacity = '0';
    
    this.toastContainer.appendChild(toast);
    
    // Запускаем анимацию
    requestAnimationFrame(() => {
      toast.style.transform = 'translateX(0)';
      toast.style.opacity = '1';
    });
    
    // Автоматическое удаление
    setTimeout(() => {
      if (toast.parentNode) {
        toast.style.transform = 'translateX(100%)';
        toast.style.opacity = '0';
        setTimeout(() => {
          if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
          }
        }, 300);
      }
    }, duration);

    // Логирование для мониторинга
    console.log(`📢 Toast [${type.toUpperCase()}]: ${message}`);
  }

  static logError(error: any, context: string, additionalData?: any) {
    const errorLog = {
      timestamp: new Date().toISOString(),
      context,
      error: {
        message: error?.message,
        code: error?.code,
        stack: error?.stack
      },
      additionalData,
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    console.error('🔴 Подробная ошибка:', errorLog);

    // В продакшене здесь можно отправлять логи в систему мониторинга
    if (process.env.NODE_ENV === 'production') {
      // Отправка в систему логирования
      this.sendErrorToMonitoring(errorLog);
    }
  }

  private static async sendErrorToMonitoring(errorLog: any) {
    try {
      // Здесь можно интегрировать с системами мониторинга типа Sentry, LogRocket и т.д.
      console.log('📊 Отправка ошибки в систему мониторинга:', errorLog);
    } catch (monitoringError) {
      console.error('🔴 Ошибка отправки в мониторинг:', monitoringError);
    }
  }

  static createErrorBoundary(component: string) {
    return (error: Error, errorInfo: any) => {
      this.logError(error, `React Error Boundary: ${component}`, errorInfo);
      this.showToast(`Ошибка в компоненте ${component}. Попробуйте обновить страницу.`, 'error');
    };
  }
}

// Глобальные обработчики ошибок
window.addEventListener('unhandledrejection', (event) => {
  ErrorHandler.logError(event.reason, 'Необработанное отклонение Promise');
  ErrorHandler.showToast('Произошла неожиданная ошибка', 'error');
  event.preventDefault(); // Предотвращаем вывод в консоль
});

window.addEventListener('error', (event) => {
  ErrorHandler.logError(event.error, 'Глобальная ошибка JavaScript', {
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno
  });
  ErrorHandler.showToast('Произошла ошибка приложения', 'error');
});

// Обработчик ошибок сети
window.addEventListener('offline', () => {
  ErrorHandler.showToast('Подключение к интернету потеряно', 'warning');
});

window.addEventListener('online', () => {
  ErrorHandler.showToast('Подключение к интернету восстановлено', 'success');
});