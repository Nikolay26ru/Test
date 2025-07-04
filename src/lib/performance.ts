// Система мониторинга производительности
export class PerformanceMonitor {
  private static metrics: Map<string, number> = new Map();
  
  // Начать измерение времени выполнения
  static startTimer(label: string): void {
    this.metrics.set(label, performance.now());
  }
  
  // Завершить измерение и вывести результат
  static endTimer(label: string): number {
    const startTime = this.metrics.get(label);
    if (!startTime) {
      console.warn(`Timer "${label}" was not started`);
      return 0;
    }
    
    const duration = performance.now() - startTime;
    console.log(`⏱️ ${label}: ${duration.toFixed(2)}ms`);
    this.metrics.delete(label);
    
    return duration;
  }
  
  // Измерить время выполнения функции
  static async measureAsync<T>(label: string, fn: () => Promise<T>): Promise<T> {
    this.startTimer(label);
    try {
      const result = await fn();
      this.endTimer(label);
      return result;
    } catch (error) {
      this.endTimer(label);
      throw error;
    }
  }
  
  // Дебаунс функция для оптимизации частых вызовов
  static debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }
  
  // Троттлинг функция
  static throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }
  
  // Мемоизация для кэширования результатов
  static memoize<T extends (...args: any[]) => any>(fn: T): T {
    const cache = new Map();
    return ((...args: Parameters<T>) => {
      const key = JSON.stringify(args);
      if (cache.has(key)) {
        return cache.get(key);
      }
      const result = fn(...args);
      cache.set(key, result);
      return result;
    }) as T;
  }
  
  // Очистка кэша
  static clearCache(): void {
    this.metrics.clear();
  }
  
  // Получить метрики производительности
  static getMetrics(): Record<string, number> {
    return Object.fromEntries(this.metrics);
  }
}

// Хук для мониторинга производительности React компонентов
export const usePerformanceMonitor = (componentName: string) => {
  React.useEffect(() => {
    PerformanceMonitor.startTimer(`${componentName}_render`);
    return () => {
      PerformanceMonitor.endTimer(`${componentName}_render`);
    };
  });
};