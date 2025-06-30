/**
 * Эталонный сервис логирования
 * Обеспечивает исчерпывающее логирование всех операций
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  CRITICAL = 4
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  error?: Error;
  userId?: string;
  sessionId?: string;
  requestId?: string;
}

export class LoggingService {
  private static logs: LogEntry[] = [];
  private static maxLogs = 1000;
  private static currentLogLevel = LogLevel.INFO;
  private static sessionId = this.generateSessionId();

  /**
   * Инициализация сервиса логирования
   */
  static initialize(config?: {
    maxLogs?: number;
    logLevel?: LogLevel;
    enableConsole?: boolean;
    enableRemote?: boolean;
  }): void {
    if (config?.maxLogs) {
      this.maxLogs = config.maxLogs;
    }
    
    if (config?.logLevel !== undefined) {
      this.currentLogLevel = config.logLevel;
    }

    this.info('LoggingService инициализирован', {
      maxLogs: this.maxLogs,
      logLevel: LogLevel[this.currentLogLevel],
      sessionId: this.sessionId
    });

    // Настраиваем глобальные обработчики ошибок
    this.setupGlobalErrorHandlers();

    // Настраиваем периодическую очистку логов
    setInterval(() => {
      this.cleanupOldLogs();
    }, 5 * 60 * 1000); // каждые 5 минут
  }

  /**
   * Логирование отладочной информации
   */
  static debug(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  /**
   * Логирование информационных сообщений
   */
  static info(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.INFO, message, context);
  }

  /**
   * Логирование предупреждений
   */
  static warn(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.WARN, message, context);
  }

  /**
   * Логирование ошибок
   */
  static error(message: string, error?: Error | any, context?: Record<string, any>): void {
    this.log(LogLevel.ERROR, message, context, error);
  }

  /**
   * Логирование критических ошибок
   */
  static critical(message: string, error?: Error | any, context?: Record<string, any>): void {
    this.log(LogLevel.CRITICAL, message, context, error);
  }

  /**
   * Логирование производительности
   */
  static performance(operation: string, duration: number, context?: Record<string, any>): void {
    this.info(`Производительность: ${operation}`, {
      ...context,
      duration: `${duration.toFixed(2)}ms`,
      performance: true
    });
  }

  /**
   * Логирование пользовательских действий
   */
  static userAction(action: string, userId?: string, context?: Record<string, any>): void {
    this.info(`Действие пользователя: ${action}`, {
      ...context,
      userId,
      userAction: true
    });
  }

  /**
   * Логирование безопасности
   */
  static security(event: string, severity: 'low' | 'medium' | 'high' | 'critical', context?: Record<string, any>): void {
    const level = severity === 'critical' ? LogLevel.CRITICAL : 
                  severity === 'high' ? LogLevel.ERROR :
                  severity === 'medium' ? LogLevel.WARN : LogLevel.INFO;

    this.log(level, `Безопасность: ${event}`, {
      ...context,
      security: true,
      severity
    });
  }

  /**
   * Логирование API запросов
   */
  static apiRequest(method: string, url: string, status: number, duration: number, context?: Record<string, any>): void {
    const level = status >= 500 ? LogLevel.ERROR :
                  status >= 400 ? LogLevel.WARN : LogLevel.INFO;

    this.log(level, `API запрос: ${method} ${url}`, {
      ...context,
      method,
      url,
      status,
      duration: `${duration.toFixed(2)}ms`,
      apiRequest: true
    });
  }

  /**
   * Получение логов
   */
  static getLogs(filter?: {
    level?: LogLevel;
    since?: Date;
    userId?: string;
    limit?: number;
  }): LogEntry[] {
    let filteredLogs = [...this.logs];

    if (filter?.level !== undefined) {
      filteredLogs = filteredLogs.filter(log => log.level >= filter.level!);
    }

    if (filter?.since) {
      filteredLogs = filteredLogs.filter(log => 
        new Date(log.timestamp) >= filter.since!
      );
    }

    if (filter?.userId) {
      filteredLogs = filteredLogs.filter(log => log.userId === filter.userId);
    }

    if (filter?.limit) {
      filteredLogs = filteredLogs.slice(-filter.limit);
    }

    return filteredLogs;
  }

  /**
   * Экспорт логов
   */
  static exportLogs(format: 'json' | 'csv' = 'json'): string {
    const logs = this.getLogs();

    if (format === 'csv') {
      const headers = ['timestamp', 'level', 'message', 'context', 'error'];
      const rows = logs.map(log => [
        log.timestamp,
        LogLevel[log.level],
        log.message,
        JSON.stringify(log.context || {}),
        log.error?.message || ''
      ]);

      return [headers, ...rows].map(row => row.join(',')).join('\n');
    }

    return JSON.stringify(logs, null, 2);
  }

  /**
   * Очистка логов
   */
  static clearLogs(): void {
    this.logs = [];
    this.info('Логи очищены');
  }

  /**
   * Получение статистики логов
   */
  static getLogStats(): {
    total: number;
    byLevel: Record<string, number>;
    oldestLog?: string;
    newestLog?: string;
  } {
    const stats = {
      total: this.logs.length,
      byLevel: {} as Record<string, number>,
      oldestLog: this.logs[0]?.timestamp,
      newestLog: this.logs[this.logs.length - 1]?.timestamp
    };

    // Подсчитываем по уровням
    for (const level of Object.values(LogLevel)) {
      if (typeof level === 'number') {
        stats.byLevel[LogLevel[level]] = this.logs.filter(log => log.level === level).length;
      }
    }

    return stats;
  }

  /**
   * Основной метод логирования
   */
  private static log(level: LogLevel, message: string, context?: Record<string, any>, error?: Error | any): void {
    if (level < this.currentLogLevel) {
      return;
    }

    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      error: error instanceof Error ? error : undefined,
      sessionId: this.sessionId,
      requestId: this.generateRequestId()
    };

    // Добавляем в массив логов
    this.logs.push(logEntry);

    // Ограничиваем размер массива
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Выводим в консоль
    this.logToConsole(logEntry);

    // Отправляем на сервер (в продакшене)
    if (level >= LogLevel.ERROR) {
      this.sendToRemoteLogging(logEntry);
    }
  }

  /**
   * Вывод в консоль
   */
  private static logToConsole(entry: LogEntry): void {
    const prefix = `[${entry.timestamp}] [${LogLevel[entry.level]}]`;
    const message = `${prefix} ${entry.message}`;

    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(message, entry.context, entry.error);
        break;
      case LogLevel.INFO:
        console.info(message, entry.context);
        break;
      case LogLevel.WARN:
        console.warn(message, entry.context);
        break;
      case LogLevel.ERROR:
        console.error(message, entry.context, entry.error);
        break;
      case LogLevel.CRITICAL:
        console.error(`🚨 ${message}`, entry.context, entry.error);
        break;
    }
  }

  /**
   * Отправка на удаленный сервер логирования
   */
  private static async sendToRemoteLogging(entry: LogEntry): Promise<void> {
    try {
      // В продакшене здесь должна быть отправка на сервер логирования
      // Например: Sentry, LogRocket, CloudWatch, и т.д.
      
      if (process.env.NODE_ENV === 'production') {
        // Пример отправки
        // await fetch('/api/logs', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(entry)
        // });
      }
    } catch (error) {
      console.error('Ошибка отправки лога на сервер:', error);
    }
  }

  /**
   * Настройка глобальных обработчиков ошибок
   */
  private static setupGlobalErrorHandlers(): void {
    // Обработчик необработанных ошибок
    window.addEventListener('error', (event) => {
      this.error('Глобальная ошибка JavaScript', event.error, {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        message: event.message
      });
    });

    // Обработчик необработанных Promise
    window.addEventListener('unhandledrejection', (event) => {
      this.error('Необработанное отклонение Promise', event.reason, {
        promise: event.promise
      });
    });

    // Обработчик потери соединения
    window.addEventListener('offline', () => {
      this.warn('Соединение с интернетом потеряно');
    });

    window.addEventListener('online', () => {
      this.info('Соединение с интернетом восстановлено');
    });
  }

  /**
   * Очистка старых логов
   */
  private static cleanupOldLogs(): void {
    const maxAge = 24 * 60 * 60 * 1000; // 24 часа
    const cutoff = new Date(Date.now() - maxAge);

    const initialCount = this.logs.length;
    this.logs = this.logs.filter(log => new Date(log.timestamp) > cutoff);

    if (this.logs.length < initialCount) {
      this.debug(`Очищено ${initialCount - this.logs.length} старых логов`);
    }
  }

  /**
   * Генерация ID сессии
   */
  private static generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2)}`;
  }

  /**
   * Генерация ID запроса
   */
  private static generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substring(2)}`;
  }
}