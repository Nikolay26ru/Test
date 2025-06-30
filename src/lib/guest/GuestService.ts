/**
 * Сервис для работы с гостевыми пользователями
 */

export interface GuestUser {
  id: string;
  name: string;
  username: string;
  is_guest: boolean;
  created_at: string;
  session_expires_at: string;
}

export interface GuestSession {
  user: GuestUser;
  expires_at: string;
}

export class GuestService {
  private static readonly STORAGE_KEY = 'wishflick_guest_session';
  private static readonly SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 часа

  /**
   * Создание гостевой сессии
   */
  static createGuestSession(guestName?: string): GuestSession {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + this.SESSION_DURATION);
    const userId = `guest_${Date.now()}_${Math.random().toString(36).substring(2)}`;
    
    const name = guestName?.trim() || `Гость_${Math.random().toString(36).substring(7)}`;
    const username = name.toLowerCase().replace(/\s+/g, '_');

    const guestUser: GuestUser = {
      id: userId,
      name,
      username,
      is_guest: true,
      created_at: now.toISOString(),
      session_expires_at: expiresAt.toISOString()
    };

    const session: GuestSession = {
      user: guestUser,
      expires_at: expiresAt.toISOString()
    };

    // Сохраняем в localStorage
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(session));

    console.log('✅ Создана гостевая сессия:', { userId, name, expiresAt });
    return session;
  }

  /**
   * Получение текущей гостевой сессии
   */
  static getGuestSession(): GuestSession | null {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return null;

      const session: GuestSession = JSON.parse(stored);
      
      // Проверяем срок действия
      if (new Date() > new Date(session.expires_at)) {
        this.clearGuestSession();
        return null;
      }

      return session;
    } catch (error) {
      console.error('Ошибка получения гостевой сессии:', error);
      this.clearGuestSession();
      return null;
    }
  }

  /**
   * Обновление данных гостевого пользователя
   */
  static updateGuestUser(updates: Partial<GuestUser>): boolean {
    try {
      const session = this.getGuestSession();
      if (!session) return false;

      const updatedUser = { ...session.user, ...updates };
      const updatedSession = { ...session, user: updatedUser };

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedSession));
      return true;
    } catch (error) {
      console.error('Ошибка обновления гостевого пользователя:', error);
      return false;
    }
  }

  /**
   * Очистка гостевой сессии
   */
  static clearGuestSession(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    console.log('🗑️ Гостевая сессия очищена');
  }

  /**
   * Проверка истечения сессии
   */
  static isSessionExpired(): boolean {
    const session = this.getGuestSession();
    if (!session) return true;

    return new Date() > new Date(session.expires_at);
  }

  /**
   * Продление сессии
   */
  static extendSession(): boolean {
    try {
      const session = this.getGuestSession();
      if (!session) return false;

      const newExpiresAt = new Date(Date.now() + this.SESSION_DURATION);
      session.expires_at = newExpiresAt.toISOString();
      session.user.session_expires_at = newExpiresAt.toISOString();

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(session));
      return true;
    } catch (error) {
      console.error('Ошибка продления сессии:', error);
      return false;
    }
  }
}