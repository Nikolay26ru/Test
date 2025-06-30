/**
 * Типы для системы email
 */

export interface EmailTemplate {
  id: string;
  name: string;
  subject_template: string;
  html_template: string;
  text_template?: string;
  locale: string;
  variables: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface EmailQueueItem {
  id: string;
  recipient_email: string;
  subject: string;
  template_name: string;
  template_data: Record<string, any>;
  status: 'pending' | 'processing' | 'sent' | 'failed' | 'cancelled';
  priority: number;
  max_attempts: number;
  current_attempts: number;
  scheduled_at: string;
  sent_at?: string;
  error_message?: string;
  created_at: string;
  updated_at: string;
}

export interface EmailResult {
  success: boolean;
  emailId?: string;
  error?: string;
  message: string;
}

export interface EmailConfig {
  provider: 'sendgrid' | 'mailgun' | 'ses' | 'smtp';
  apiKey?: string;
  domain?: string;
  fromEmail: string;
  fromName: string;
  replyTo?: string;
}