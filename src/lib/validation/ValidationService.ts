/**
 * Эталонный сервис валидации
 * Обеспечивает комплексную валидацию всех данных
 */

import { LoggingService } from '../logging/LoggingService';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}

export interface FieldValidationResult {
  isValid: boolean;
  error?: string;
  warning?: string;
}

export class ValidationService {
  private static readonly EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  private static readonly USERNAME_REGEX = /^[a-zA-Z0-9_]{3,30}$/;
  private static readonly URL_REGEX = /^https?:\/\/.+/;
  private static readonly PHONE_REGEX = /^\+?[1-9]\d{1,14}$/;

  /**
   * Валидация email адреса
   */
  static validateEmail(email: string): FieldValidationResult {
    if (!email || !email.trim()) {
      return { isValid: false, error: 'Email адрес обязателен' };
    }

    const trimmedEmail = email.trim().toLowerCase();

    if (trimmedEmail.length > 254) {
      return { isValid: false, error: 'Email адрес слишком длинный' };
    }

    if (!this.EMAIL_REGEX.test(trimmedEmail)) {
      return { isValid: false, error: 'Неверный формат email адреса' };
    }

    // Проверка на подозрительные домены
    const domain = trimmedEmail.split('@')[1];
    const suspiciousDomains = ['tempmail.org', '10minutemail.com', 'guerrillamail.com'];
    
    if (suspiciousDomains.includes(domain)) {
      return { 
        isValid: true, 
        warning: 'Используется временный email адрес' 
      };
    }

    return { isValid: true };
  }

  /**
   * Валидация пароля
   */
  static validatePassword(password: string): FieldValidationResult {
    if (!password) {
      return { isValid: false, error: 'Пароль обязателен' };
    }

    if (password.length < 8) {
      return { isValid: false, error: 'Пароль должен содержать минимум 8 символов' };
    }

    if (password.length > 128) {
      return { isValid: false, error: 'Пароль слишком длинный (максимум 128 символов)' };
    }

    // Проверка сложности пароля
    const hasLowerCase = /[a-z]/.test(password);
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    const complexityScore = [hasLowerCase, hasUpperCase, hasNumbers, hasSpecialChar]
      .filter(Boolean).length;

    if (complexityScore < 2) {
      return { 
        isValid: false, 
        error: 'Пароль должен содержать как минимум 2 типа символов (строчные, заглавные, цифры, спецсимволы)' 
      };
    }

    // Проверка на простые пароли
    const commonPasswords = [
      'password', '123456', 'qwerty', 'abc123', 'password123',
      'admin', 'letmein', 'welcome', 'monkey', 'dragon'
    ];

    if (commonPasswords.includes(password.toLowerCase())) {
      return { isValid: false, error: 'Пароль слишком простой' };
    }

    // Предупреждения
    let warning;
    if (complexityScore < 3) {
      warning = 'Рекомендуется использовать более сложный пароль';
    }

    return { isValid: true, warning };
  }

  /**
   * Валидация имени пользователя
   */
  static validateUsername(username: string): FieldValidationResult {
    if (!username || !username.trim()) {
      return { isValid: false, error: 'Имя пользователя обязательно' };
    }

    const trimmedUsername = username.trim().toLowerCase();

    if (trimmedUsername.length < 3) {
      return { isValid: false, error: 'Имя пользователя должно содержать минимум 3 символа' };
    }

    if (trimmedUsername.length > 30) {
      return { isValid: false, error: 'Имя пользователя не должно превышать 30 символов' };
    }

    if (!this.USERNAME_REGEX.test(trimmedUsername)) {
      return { 
        isValid: false, 
        error: 'Имя пользователя может содержать только буквы, цифры и подчеркивания' 
      };
    }

    // Проверка на зарезервированные имена
    const reservedNames = [
      'admin', 'root', 'user', 'guest', 'api', 'www', 'mail', 'ftp',
      'support', 'help', 'info', 'contact', 'about', 'terms', 'privacy'
    ];

    if (reservedNames.includes(trimmedUsername)) {
      return { isValid: false, error: 'Это имя пользователя зарезервировано' };
    }

    return { isValid: true };
  }

  /**
   * Валидация имени
   */
  static validateName(name: string): FieldValidationResult {
    if (!name || !name.trim()) {
      return { isValid: false, error: 'Имя обязательно' };
    }

    const trimmedName = name.trim();

    if (trimmedName.length < 2) {
      return { isValid: false, error: 'Имя должно содержать минимум 2 символа' };
    }

    if (trimmedName.length > 100) {
      return { isValid: false, error: 'Имя не должно превышать 100 символов' };
    }

    // Проверка на недопустимые символы
    const invalidChars = /[<>{}[\]\\\/]/;
    if (invalidChars.test(trimmedName)) {
      return { isValid: false, error: 'Имя содержит недопустимые символы' };
    }

    return { isValid: true };
  }

  /**
   * Валидация URL
   */
  static validateUrl(url: string): FieldValidationResult {
    if (!url || !url.trim()) {
      return { isValid: true }; // URL необязателен
    }

    const trimmedUrl = url.trim();

    if (trimmedUrl.length > 2048) {
      return { isValid: false, error: 'URL слишком длинный' };
    }

    if (!this.URL_REGEX.test(trimmedUrl)) {
      return { isValid: false, error: 'Неверный формат URL (должен начинаться с http:// или https://)' };
    }

    try {
      new URL(trimmedUrl);
    } catch {
      return { isValid: false, error: 'Неверный формат URL' };
    }

    return { isValid: true };
  }

  /**
   * Валидация цены
   */
  static validatePrice(price: string | number): FieldValidationResult {
    if (price === '' || price === null || price === undefined) {
      return { isValid: true }; // Цена необязательна
    }

    const numPrice = typeof price === 'string' ? parseFloat(price) : price;

    if (isNaN(numPrice)) {
      return { isValid: false, error: 'Цена должна быть числом' };
    }

    if (numPrice < 0) {
      return { isValid: false, error: 'Цена не может быть отрицательной' };
    }

    if (numPrice > 100000000) {
      return { isValid: false, error: 'Цена слишком большая (максимум 100,000,000)' };
    }

    // Проверка на разумность цены
    let warning;
    if (numPrice > 1000000) {
      warning = 'Очень высокая цена. Проверьте правильность ввода.';
    }

    return { isValid: true, warning };
  }

  /**
   * Валидация телефона
   */
  static validatePhone(phone: string): FieldValidationResult {
    if (!phone || !phone.trim()) {
      return { isValid: true }; // Телефон необязателен
    }

    const trimmedPhone = phone.trim().replace(/\s+/g, '');

    if (!this.PHONE_REGEX.test(trimmedPhone)) {
      return { isValid: false, error: 'Неверный формат номера телефона' };
    }

    return { isValid: true };
  }

  /**
   * Валидация данных для входа
   */
  static validateLoginCredentials(credentials: {
    email: string;
    password: string;
  }): ValidationResult {
    const errors: string[] = [];

    const emailValidation = this.validateEmail(credentials.email);
    if (!emailValidation.isValid) {
      errors.push(emailValidation.error!);
    }

    if (!credentials.password) {
      errors.push('Пароль обязателен');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Валидация данных для регистрации
   */
  static validateRegisterCredentials(credentials: {
    email: string;
    password: string;
    confirmPassword: string;
    name: string;
    username?: string;
  }): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Валидация email
    const emailValidation = this.validateEmail(credentials.email);
    if (!emailValidation.isValid) {
      errors.push(emailValidation.error!);
    } else if (emailValidation.warning) {
      warnings.push(emailValidation.warning);
    }

    // Валидация пароля
    const passwordValidation = this.validatePassword(credentials.password);
    if (!passwordValidation.isValid) {
      errors.push(passwordValidation.error!);
    } else if (passwordValidation.warning) {
      warnings.push(passwordValidation.warning);
    }

    // Проверка совпадения паролей
    if (credentials.password !== credentials.confirmPassword) {
      errors.push('Пароли не совпадают');
    }

    // Валидация имени
    const nameValidation = this.validateName(credentials.name);
    if (!nameValidation.isValid) {
      errors.push(nameValidation.error!);
    }

    // Валидация username (если указан)
    if (credentials.username) {
      const usernameValidation = this.validateUsername(credentials.username);
      if (!usernameValidation.isValid) {
        errors.push(usernameValidation.error!);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings: warnings.length > 0 ? warnings : undefined
    };
  }

  /**
   * Валидация формы списка желаний
   */
  static validateWishlistForm(data: {
    title: string;
    description?: string;
    cover_image?: string;
  }): ValidationResult {
    const errors: string[] = [];

    // Валидация заголовка
    if (!data.title || !data.title.trim()) {
      errors.push('Название списка обязательно');
    } else if (data.title.trim().length > 100) {
      errors.push('Название не должно превышать 100 символов');
    }

    // Валидация описания
    if (data.description && data.description.length > 500) {
      errors.push('Описание не должно превышать 500 символов');
    }

    // Валидация изображения обложки
    if (data.cover_image) {
      const urlValidation = this.validateUrl(data.cover_image);
      if (!urlValidation.isValid) {
        errors.push(`Обложка: ${urlValidation.error}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Валидация формы товара
   */
  static validateWishItemForm(data: {
    title: string;
    description?: string;
    price?: string | number;
    image_url?: string;
    store_url?: string;
  }): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Валидация названия
    if (!data.title || !data.title.trim()) {
      errors.push('Название товара обязательно');
    } else if (data.title.trim().length > 200) {
      errors.push('Название не должно превышать 200 символов');
    }

    // Валидация описания
    if (data.description && data.description.length > 1000) {
      errors.push('Описание не должно превышать 1000 символов');
    }

    // Валидация цены
    if (data.price !== undefined && data.price !== '') {
      const priceValidation = this.validatePrice(data.price);
      if (!priceValidation.isValid) {
        errors.push(priceValidation.error!);
      } else if (priceValidation.warning) {
        warnings.push(priceValidation.warning);
      }
    }

    // Валидация URL изображения
    if (data.image_url) {
      const imageUrlValidation = this.validateUrl(data.image_url);
      if (!imageUrlValidation.isValid) {
        errors.push(`Изображение: ${imageUrlValidation.error}`);
      }
    }

    // Валидация URL магазина
    if (data.store_url) {
      const storeUrlValidation = this.validateUrl(data.store_url);
      if (!storeUrlValidation.isValid) {
        errors.push(`Ссылка на магазин: ${storeUrlValidation.error}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings: warnings.length > 0 ? warnings : undefined
    };
  }

  /**
   * Валидация файла изображения
   */
  static validateImageFile(file: File): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Проверка типа файла
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      errors.push('Поддерживаются только изображения (JPEG, PNG, GIF, WebP)');
    }

    // Проверка размера файла
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      errors.push('Размер файла не должен превышать 5MB');
    }

    // Предупреждения
    if (file.size > 1024 * 1024) { // 1MB
      warnings.push('Большой размер файла может замедлить загрузку');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings: warnings.length > 0 ? warnings : undefined
    };
  }

  /**
   * Санитизация HTML
   */
  static sanitizeHtml(html: string): string {
    const div = document.createElement('div');
    div.textContent = html;
    return div.innerHTML;
  }

  /**
   * Санитизация текста
   */
  static sanitizeText(text: string): string {
    if (!text) return '';
    
    return text
      .trim()
      .replace(/[<>]/g, '') // Удаляем HTML теги
      .replace(/\s+/g, ' ') // Нормализуем пробелы
      .substring(0, 10000); // Ограничиваем длину
  }

  /**
   * Валидация и санитизация пользовательского ввода
   */
  static sanitizeUserInput(input: string, maxLength: number = 1000): string {
    if (!input) return '';

    return input
      .trim()
      .replace(/[<>{}[\]\\]/g, '') // Удаляем потенциально опасные символы
      .replace(/\s+/g, ' ') // Нормализуем пробелы
      .substring(0, maxLength);
  }

  /**
   * Проверка на спам
   */
  static checkForSpam(text: string): { isSpam: boolean; reason?: string } {
    if (!text) return { isSpam: false };

    const spamPatterns = [
      /(.)\1{10,}/, // Повторяющиеся символы
      /(https?:\/\/[^\s]+){3,}/, // Много ссылок
      /[A-Z]{20,}/, // Много заглавных букв подряд
      /(купи|скидка|акция|бесплатно|выиграй).*(сейчас|срочно|только сегодня)/i
    ];

    for (const pattern of spamPatterns) {
      if (pattern.test(text)) {
        return { isSpam: true, reason: 'Текст похож на спам' };
      }
    }

    return { isSpam: false };
  }

  /**
   * Логирование валидации
   */
  private static logValidation(field: string, result: ValidationResult | FieldValidationResult): void {
    if (!result.isValid) {
      LoggingService.warn(`Ошибка валидации поля ${field}`, {
        field,
        errors: 'errors' in result ? result.errors : [result.error],
        validation: true
      });
    }
  }
}