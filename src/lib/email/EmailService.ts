/**
 * Эталонный сервис email
 * Обеспечивает надежную доставку писем с очередью и шаблонами
 */

import { supabase } from '../supabase';
import { LoggingService } from '../logging/LoggingService';
import { ValidationService } from '../validation/ValidationService';
import type { EmailTemplate, EmailQueueItem, EmailResult } from '../../types/email';

export class EmailService {
  private static readonly MAX_RETRIES = 3;
  private static readonly RETRY_DELAYS = [1000, 5000, 15000]; // 1с, 5с, 15с
  private static isProcessing = false;

  /**
   * Инициализация сервиса email
   */
  static async initialize(): Promise<void> {
    LoggingService.info('Инициализация EmailService');
    
    // Запускаем обработку очереди
    this.startQueueProcessor();
    
    // Настраиваем периодическую очистку
    setInterval(() => {
      this.cleanupOldEmails();
    }, 60 * 60 * 1000); // каждый час
  }

  /**
   * Отправка письма подтверждения email
   */
  static async sendConfirmationEmail(email: string, userId: string): Promise<EmailResult> {
    try {
      LoggingService.info('Отправка письма подтверждения', { email, userId });

      const validation = ValidationService.validateEmail(email);
      if (!validation.isValid) {
        throw new Error(validation.error);
      }

      // Генерируем ссылку подтверждения
      const confirmationUrl = await this.generateConfirmationUrl(userId);

      // Добавляем в очередь
      const emailId = await this.queueEmail({
        recipient: email,
        template: 'email_confirmation',
        data: { confirmation_url: confirmationUrl },
        priority: 1 // высокий приоритет
      });

      return {
        success: true,
        emailId,
        message: 'Письмо подтверждения добавлено в очередь'
      };

    } catch (error: any) {
      LoggingService.error('Ошибка отправки письма подтверждения', error, { email, userId });
      return {
        success: false,
        error: error.message,
        message: 'Не удалось отправить письмо подтверждения'
      };
    }
  }

  /**
   * Отправка письма восстановления пароля
   */
  static async sendPasswordResetEmail(email: string): Promise<EmailResult> {
    try {
      LoggingService.info('Отправка письма восстановления пароля', { email });

      const validation = ValidationService.validateEmail(email);
      if (!validation.isValid) {
        throw new Error(validation.error);
      }

      // Генерируем ссылку восстановления
      const resetUrl = await this.generatePasswordResetUrl(email);

      // Добавляем в очередь
      const emailId = await this.queueEmail({
        recipient: email,
        template: 'password_reset',
        data: { reset_url: resetUrl },
        priority: 1 // высокий приоритет
      });

      return {
        success: true,
        emailId,
        message: 'Письмо восстановления добавлено в очередь'
      };

    } catch (error: any) {
      LoggingService.error('Ошибка отправки письма восстановления', error, { email });
      return {
        success: false,
        error: error.message,
        message: 'Не удалось отправить письмо восстановления'
      };
    }
  }

  /**
   * Отправка приветственного письма
   */
  static async sendWelcomeEmail(email: string, name: string): Promise<EmailResult> {
    try {
      LoggingService.info('Отправка приветственного письма', { email, name });

      const validation = ValidationService.validateEmail(email);
      if (!validation.isValid) {
        throw new Error(validation.error);
      }

      // Добавляем в очередь
      const emailId = await this.queueEmail({
        recipient: email,
        template: 'welcome',
        data: { name },
        priority: 3 // средний приоритет
      });

      return {
        success: true,
        emailId,
        message: 'Приветственное письмо добавлено в очередь'
      };

    } catch (error: any) {
      LoggingService.error('Ошибка отправки приветственного письма', error, { email, name });
      return {
        success: false,
        error: error.message,
        message: 'Не удалось отправить приветственное письмо'
      };
    }
  }

  /**
   * Добавление email в очередь
   */
  private static async queueEmail(params: {
    recipient: string;
    template: string;
    data: Record<string, any>;
    priority?: number;
    scheduledAt?: Date;
  }): Promise<string> {
    try {
      const { data, error } = await supabase.rpc('queue_email', {
        recipient: params.recipient,
        template: params.template,
        data: params.data,
        priority_level: params.priority || 5
      });

      if (error) {
        throw error;
      }

      LoggingService.info('Email добавлен в очередь', {
        emailId: data,
        recipient: params.recipient,
        template: params.template
      });

      // Запускаем обработку если не запущена
      if (!this.isProcessing) {
        this.processQueue();
      }

      return data;

    } catch (error: any) {
      LoggingService.error('Ошибка добавления email в очередь', error, params);
      throw error;
    }
  }

  /**
   * Обработка очереди email
   */
  private static async processQueue(): Promise<void> {
    if (this.isProcessing) {
      return;
    }

    this.isProcessing = true;

    try {
      LoggingService.info('Начало обработки очереди email');

      // Получаем email для отправки
      const { data: emails, error } = await supabase
        .from('email_queue')
        .select('*')
        .in('status', ['pending', 'failed'])
        .lt('current_attempts', 'max_attempts')
        .lte('scheduled_at', new Date().toISOString())
        .order('priority', { ascending: true })
        .order('created_at', { ascending: true })
        .limit(10);

      if (error) {
        throw error;
      }

      if (!emails || emails.length === 0) {
        LoggingService.info('Очередь email пуста');
        return;
      }

      LoggingService.info(`Обработка ${emails.length} email из очереди`);

      // Обрабатываем каждый email
      for (const email of emails) {
        await this.processEmailItem(email);
        
        // Небольшая задержка между отправками
        await new Promise(resolve => setTimeout(resolve, 100));
      }

    } catch (error: any) {
      LoggingService.error('Ошибка обработки очереди email', error);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Обработка отдельного email
   */
  private static async processEmailItem(emailItem: EmailQueueItem): Promise<void> {
    try {
      LoggingService.info('Обработка email', { emailId: emailItem.id });

      // Обновляем статус на "обрабатывается"
      await supabase
        .from('email_queue')
        .update({ 
          status: 'processing',
          current_attempts: emailItem.current_attempts + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', emailItem.id);

      // Получаем шаблон
      const template = await this.getEmailTemplate(emailItem.template_name);
      if (!template) {
        throw new Error(`Шаблон не найден: ${emailItem.template_name}`);
      }

      // Рендерим email
      const renderedEmail = this.renderEmailTemplate(template, emailItem.template_data);

      // Отправляем email (здесь должна быть интеграция с реальным email провайдером)
      await this.sendEmailViaProvider(emailItem.recipient_email, renderedEmail);

      // Обновляем статус на "отправлено"
      await supabase
        .from('email_queue')
        .update({ 
          status: 'sent',
          sent_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', emailItem.id);

      LoggingService.info('Email успешно отправлен', { 
        emailId: emailItem.id,
        recipient: emailItem.recipient_email
      });

    } catch (error: any) {
      LoggingService.error('Ошибка отправки email', error, { emailId: emailItem.id });

      // Определяем, нужно ли повторить попытку
      const shouldRetry = emailItem.current_attempts < emailItem.max_attempts;
      const nextAttemptDelay = this.RETRY_DELAYS[emailItem.current_attempts] || 60000;

      await supabase
        .from('email_queue')
        .update({ 
          status: shouldRetry ? 'failed' : 'failed',
          error_message: error.message,
          scheduled_at: shouldRetry 
            ? new Date(Date.now() + nextAttemptDelay).toISOString()
            : emailItem.scheduled_at,
          updated_at: new Date().toISOString()
        })
        .eq('id', emailItem.id);
    }
  }

  /**
   * Получение шаблона email
   */
  private static async getEmailTemplate(templateName: string): Promise<EmailTemplate | null> {
    try {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .eq('name', templateName)
        .eq('is_active', true)
        .single();

      if (error || !data) {
        return null;
      }

      return data;
    } catch (error) {
      LoggingService.error('Ошибка получения шаблона email', error, { templateName });
      return null;
    }
  }

  /**
   * Рендеринг шаблона email
   */
  private static renderEmailTemplate(template: EmailTemplate, data: Record<string, any>): {
    subject: string;
    html: string;
    text?: string;
  } {
    const renderString = (str: string, data: Record<string, any>): string => {
      return str.replace(/\{\{(\w+)\}\}/g, (match, key) => {
        return data[key] || match;
      });
    };

    return {
      subject: renderString(template.subject_template, data),
      html: renderString(template.html_template, data),
      text: template.text_template ? renderString(template.text_template, data) : undefined
    };
  }

  /**
   * Отправка email через провайдера
   */
  private static async sendEmailViaProvider(
    recipient: string, 
    email: { subject: string; html: string; text?: string }
  ): Promise<void> {
    // В реальном приложении здесь должна быть интеграция с email провайдером
    // Например: SendGrid, Mailgun, AWS SES, и т.д.
    
    LoggingService.info('Симуляция отправки email', {
      recipient,
      subject: email.subject
    });

    // Симулируем задержку отправки
    await new Promise(resolve => setTimeout(resolve, 500));

    // Симулируем случайные ошибки (5% вероятность)
    if (Math.random() < 0.05) {
      throw new Error('Временная ошибка провайдера email');
    }
  }

  /**
   * Генерация ссылки подтверждения
   */
  private static async generateConfirmationUrl(userId: string): Promise<string> {
    // В реальном приложении здесь должна быть генерация безопасного токена
    const token = btoa(`${userId}:${Date.now()}`);
    return `${window.location.origin}/auth/confirm?token=${token}`;
  }

  /**
   * Генерация ссылки восстановления пароля
   */
  private static async generatePasswordResetUrl(email: string): Promise<string> {
    // В реальном приложении здесь должна быть генерация безопасного токена
    const token = btoa(`${email}:${Date.now()}`);
    return `${window.location.origin}/auth/reset-password?token=${token}`;
  }

  /**
   * Запуск процессора очереди
   */
  private static startQueueProcessor(): void {
    // Обрабатываем очередь каждые 30 секунд
    setInterval(() => {
      if (!this.isProcessing) {
        this.processQueue();
      }
    }, 30000);
  }

  /**
   * Очистка старых email
   */
  private static async cleanupOldEmails(): Promise<void> {
    try {
      await supabase.rpc('cleanup_old_logs');
      LoggingService.info('Очистка старых email выполнена');
    } catch (error) {
      LoggingService.error('Ошибка очистки старых email', error);
    }
  }
}