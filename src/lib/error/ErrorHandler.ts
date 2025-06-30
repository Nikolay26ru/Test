/**
 * Эталонная система обработки ошибок
 * Обеспечивает централизованную обработку всех типов ошибок
 */

import { LoggingService } from '../logging/LoggingService';

export interface ErrorContext {
  userId?: string;
  operation?: string;
  component?: string;
  metadata?: Record<string, any>;
}

export class ErrorHandler {
  private static toastContainer: HTMLElement | null = null;
  private static errorQueue: Array<{ message: string; type: string; timestamp: number }> = [];

  /**
   * Инициализация системы обработки ошибок
   */
  static initialize(): void {
    this.createToastContainer();
    this.setupGlobalErrorHandlers();
    LoggingService.info('ErrorHandler инициализирован');
  }

  /**
   * Обработка ошибок Supabase
   */
  static handleSupabaseError(error: any, context: string = ''): string {
    LoggingService.error(`Ошибка Supabase в ${context}`, error);
    
    // Специфичные ошибки Supabase
    const errorMappings: Record<string, string> = {
      'PGRST116': 'Запись не найдена',
      '23505': 'Такая запись уже существует',
      '23503': 'Нарушение связи данных',
      '42501': 'Недостаточно прав доступа',
      '23514': 'Нарушение ограничения данных',
      '08006': 'Ошибка подключения к базе данных',
      '53300': 'Слишком много подключений к базе данных',
      'auth/invalid-email': 'Неверный формат email адреса',
      'auth/user-disabled': 'Аккаунт заблокирован',
      'auth/user-not-found': 'Пользователь не найден',
      'auth/wrong-password': 'Неверный пароль',
      'auth/too-many-requests': 'Слишком много попыток. Попробуйте позже',
      'auth/network-request-failed': 'Ошибка сети. Проверьте подключение'
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
  
  /**
   * Обработка ошибок авторизации
   */
  static handleAuthError(error: any): string {
    LoggingService.error('Ошибка авторизации', error);
    
    const authErrorMappings: Record<string, string> = {
      'invalid_credentials': 'Неверный email или пароль',
      'email_not_confirmed': 'Подтвердите email для входа',
      'user_already_exists': 'Пользователь с таким email уже существует',
      'weak_password': 'Пароль слишком слабый',
      'signup_disabled': 'Регистрация временно отключена',
      'email_address_invalid': 'Неверный формат email адреса',
      'password_too_short': 'Пароль должен содержать минимум 6 символов',
      'anonymous_provider_disabled': 'Анонимный вход отключен',
      'invalid_login_credentials': 'Неверный email или пароль',
      'email_already_in_use': 'Email уже используется другим аккаунтом'
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

    if (message.includes('password should be at least')) {
      return 'Пароль должен содержать минимум 6 символов';
    }
    
    return this.handleSupabaseError(error, 'авторизация');
  }
  
  /**
   * Обработка сетевых ошибок
   */
  static handleNetworkError(error: any): string {
    LoggingService.error('Ошибка сети', error);
    
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

  /**
   * Обработка ошибок валидации
   */
  static handleValidationError(errors: Record<string, string>): string {
    const errorMessages = Object.values(errors);
    return errorMessages.length > 0 ? errorMessages[0] : 'Ошибка валидации данных';
  }
  
  /**
   * Показ toast уведомления
   */
  static showToast(
    message: string, 
    type: 'success' | 'error' | 'info' | 'warning' = 'error', 
    duration: number = 5000
  ): void {
    if (!this.toastContainer) {
      this.createToastContainer();
    }

    // Предотвращаем дублирование одинаковых сообщений
    const now = Date.now();
    const isDuplicate = this.errorQueue.some(item => 
      item.message === message && 
      item.type === type && 
      now - item.timestamp < 1000
    );

    if (isDuplicate) {
      return;
    }

    this.errorQueue.push({ message, type, timestamp: now });

    // Очищаем старые записи
    this.errorQueue = this.errorQueue.filter(item => now - item.timestamp < 5000);

    const toast = this.createToastElement(message, type, duration);
    this.toastContainer!.appendChild(toast);

    // Анимация появления
    requestAnimationFrame(() => {
      toast.style.transform = 'translateX(0)';
      toast.style.opacity = '1';
    });

    // Автоматическое удаление
    setTimeout(() => {
      this.removeToast(toast);
    }, duration);

    LoggingService.info(`Toast уведомление: [${type.toUpperCase()}] ${message}`);
  }

  /**
   * Логирование ошибки с контекстом
   */
  static logError(error: any, context: ErrorContext = {}): void {
    const errorLog = {
      timestamp: new Date().toISOString(),
      error: {
        message: error?.message,
        code: error?.code,
        stack: error?.stack,
        name: error?.name
      },
      context,
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: context.userId
    };

    LoggingService.error('Подробная ошибка', error, errorLog);

    // В продакшене отправляем в систему мониторинга
    if (process.env.NODE_ENV === 'production') {
      this.sendErrorToMonitoring(errorLog);
    }
  }

  /**
   * Создание Error Boundary для React компонентов
   */
  static createErrorBoundary(componentName: string) {
    return (error: Error, errorInfo: any) => {
      this.logError(error, { 
        component: componentName, 
        operation: 'render',
        metadata: errorInfo 
      });
      this.showToast(`Ошибка в компоненте ${componentName}. Попробуйте обновить страницу.`, 'error');
    };
  }

  /**
   * Обработка критических ошибок
   */
  static handleCriticalError(error: any, context: ErrorContext = {}): void {
    this.logError(error, { ...context, critical: true });
    this.showToast('Произошла критическая ошибка. Перезагрузите страницу.', 'error', 10000);
    
    // Отправляем немедленно в мониторинг
    this.sendErrorToMonitoring({
      critical: true,
      error,
      context,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Создание контейнера для toast уведомлений
   */
  private static createToastContainer(): void {
    if (this.toastContainer) return;

    this.toastContainer = document.createElement('div');
    this.toastContainer.id = 'toast-container';
    this.toastContainer.className = 'fixed top-4 right-4 z-50 space-y-2 pointer-events-none';
    this.toastContainer.style.maxWidth = '400px';
    document.body.appendChild(this.toastContainer);
  }

  /**
   * Создание элемента toast уведомления
   */
  private static createToastElement(message: string, type: string, duration: number): HTMLElement {
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
    
    toast.className = `px-4 py-3 rounded-lg shadow-lg border-l-4 transform transition-all duration-300 ease-in-out pointer-events-auto ${typeStyles[type as keyof typeof typeStyles]}`;
    toast.style.transform = 'translateX(100%)';
    toast.style.opacity = '0';
    
    toast.innerHTML = `
      <div class="flex items-start space-x-3">
        <span class="text-lg flex-shrink-0">${typeIcons[type as keyof typeof typeIcons]}</span>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium break-words">${this.escapeHtml(message)}</p>
          <div class="mt-2 w-full bg-white bg-opacity-20 rounded-full h-1">
            <div class="bg-white h-1 rounded-full transition-all duration-${duration} ease-linear" style="width: 100%; animation: toast-progress ${duration}ms linear;"></div>
          </div>
        </div>
        <button onclick="document.getElementById('${toastId}').remove()" class="text-white hover:text-gray-200 transition-colors flex-shrink-0">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
    `;

    // Добавляем CSS анимацию если её нет
    if (!document.getElementById('toast-styles')) {
      const style = document.createElement('style');
      style.id = 'toast-styles';
      style.textContent = `
        @keyframes toast-progress {
          from { width: 100%; }
          to { width: 0%; }
        }
      `;
      document.head.appendChild(style);
    }

    return toast;
  }

  /**
   * Удаление toast уведомления
   */
  private static removeToast(toast: HTMLElement): void {
    if (toast.parentNode) {
      toast.style.transform = 'translateX(100%)';
      toast.style.opacity = '0';
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }
  }

  /**
   * Экранирование HTML
   */
  private static escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Отправка ошибки в систему мониторинга
   */
  private static async sendErrorToMonitoring(errorLog: any): Promise<void> {
    try {
      // В продакшене здесь должна быть интеграция с системами мониторинга
      // Например: Sentry, LogRocket, DataDog и т.д.
      console.log('📊 Отправка ошибки в систему мониторинга:', errorLog);
    } catch (monitoringError) {
      console.error('🔴 Ошибка отправки в мониторинг:', monitoringError);
    }
  }

  /**
   * Настройка глобальных обработчиков ошибок
   */
  private static setupGlobalErrorHandlers(): void {
    // Обработчик необработанных ошибок
    window.addEventListener('error', (event) => {
      this.logError(event.error, {
        operation: 'global_error',
        metadata: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          message: event.message
        }
      });
    });

    // Обработчик необработанных Promise
    window.addEventListener('unhandledrejection', (event) => {
      this.logError(event.reason, {
        operation: 'unhandled_promise_rejection',
        metadata: {
          promise: event.promise
        }
      });
      event.preventDefault();
    });

    // Обработчик потери соединения
    window.addEventListener('offline', () => {
      this.showToast('Подключение к интернету потеряно', 'warning');
    });

    window.addEventListener('online', () => {
      this.showToast('Подключение к интернету восстановлено', 'success');
    });
  }
}

// Инициализируем при загрузке
if (typeof window !== 'undefined') {
  ErrorHandler.initialize();
}