// Система валидации данных
export class ValidationService {
  // Валидация email
  static validateEmail(email: string): { isValid: boolean; error?: string } {
    if (!email.trim()) {
      return { isValid: false, error: 'Email обязателен' };
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { isValid: false, error: 'Неверный формат email' };
    }
    
    return { isValid: true };
  }
  
  // Валидация пароля
  static validatePassword(password: string): { isValid: boolean; error?: string } {
    if (!password) {
      return { isValid: false, error: 'Пароль обязателен' };
    }
    
    if (password.length < 6) {
      return { isValid: false, error: 'Пароль должен содержать минимум 6 символов' };
    }
    
    return { isValid: true };
  }
  
  // Валидация имени пользователя
  static validateUsername(username: string): { isValid: boolean; error?: string } {
    if (!username.trim()) {
      return { isValid: false, error: 'Имя пользователя обязательно' };
    }
    
    if (username.length < 3) {
      return { isValid: false, error: 'Имя пользователя должно содержать минимум 3 символа' };
    }
    
    if (username.length > 30) {
      return { isValid: false, error: 'Имя пользователя не должно превышать 30 символов' };
    }
    
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(username)) {
      return { isValid: false, error: 'Имя пользователя может содержать только буквы, цифры и подчеркивания' };
    }
    
    return { isValid: true };
  }
  
  // Валидация названия списка желаний
  static validateWishlistTitle(title: string): { isValid: boolean; error?: string } {
    if (!title.trim()) {
      return { isValid: false, error: 'Название списка обязательно' };
    }
    
    if (title.length > 100) {
      return { isValid: false, error: 'Название не должно превышать 100 символов' };
    }
    
    return { isValid: true };
  }
  
  // Валидация цены
  static validatePrice(price: string | number): { isValid: boolean; error?: string } {
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
    
    if (numPrice > 10000000) {
      return { isValid: false, error: 'Цена слишком большая' };
    }
    
    return { isValid: true };
  }
  
  // Валидация URL
  static validateUrl(url: string): { isValid: boolean; error?: string } {
    if (!url.trim()) {
      return { isValid: true }; // URL необязателен
    }
    
    try {
      new URL(url);
      return { isValid: true };
    } catch {
      return { isValid: false, error: 'Неверный формат URL' };
    }
  }
  
  // Валидация формы создания списка желаний
  static validateWishlistForm(data: {
    title: string;
    description?: string;
  }): { isValid: boolean; errors: Record<string, string> } {
    const errors: Record<string, string> = {};
    
    const titleValidation = this.validateWishlistTitle(data.title);
    if (!titleValidation.isValid) {
      errors.title = titleValidation.error!;
    }
    
    if (data.description && data.description.length > 500) {
      errors.description = 'Описание не должно превышать 500 символов';
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
  
  // Валидация формы товара
  static validateWishItemForm(data: {
    title: string;
    description?: string;
    price?: string;
    image_url?: string;
    store_url?: string;
  }): { isValid: boolean; errors: Record<string, string> } {
    const errors: Record<string, string> = {};
    
    if (!data.title.trim()) {
      errors.title = 'Название товара обязательно';
    } else if (data.title.length > 200) {
      errors.title = 'Название не должно превышать 200 символов';
    }
    
    if (data.description && data.description.length > 1000) {
      errors.description = 'Описание не должно превышать 1000 символов';
    }
    
    const priceValidation = this.validatePrice(data.price || '');
    if (!priceValidation.isValid) {
      errors.price = priceValidation.error!;
    }
    
    const imageUrlValidation = this.validateUrl(data.image_url || '');
    if (!imageUrlValidation.isValid) {
      errors.image_url = imageUrlValidation.error!;
    }
    
    const storeUrlValidation = this.validateUrl(data.store_url || '');
    if (!storeUrlValidation.isValid) {
      errors.store_url = storeUrlValidation.error!;
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
}