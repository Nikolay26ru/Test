/*
  # Полное исправление базы данных WishFlick
  
  1. Исправление всех ошибок в схеме БД
  2. Создание недостающих таблиц и связей
  3. Настройка правильных RLS политик
  4. Добавление системы логирования и email
  5. Оптимизация производительности
*/

-- Создаем расширения если их нет
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Функция для безопасного получения UID
CREATE OR REPLACE FUNCTION auth.uid_safe() 
RETURNS uuid 
LANGUAGE sql 
SECURITY DEFINER
AS $$
  SELECT COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid);
$$;

-- Функция для обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Таблица для логирования операций
CREATE TABLE IF NOT EXISTS operation_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  operation_type text NOT NULL,
  table_name text NOT NULL,
  record_id uuid,
  user_id uuid,
  details jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Индексы для логов
CREATE INDEX IF NOT EXISTS operation_logs_created_at_idx ON operation_logs(created_at);
CREATE INDEX IF NOT EXISTS operation_logs_user_id_idx ON operation_logs(user_id);
CREATE INDEX IF NOT EXISTS operation_logs_operation_type_idx ON operation_logs(operation_type);

-- Таблица для email очереди
CREATE TABLE IF NOT EXISTS email_queue (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  recipient_email text NOT NULL,
  subject text NOT NULL,
  template_name text NOT NULL,
  template_data jsonb DEFAULT '{}'::jsonb,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'sent', 'failed', 'cancelled')),
  priority integer DEFAULT 5 CHECK (priority BETWEEN 1 AND 10),
  max_attempts integer DEFAULT 3,
  current_attempts integer DEFAULT 0,
  scheduled_at timestamptz DEFAULT now(),
  sent_at timestamptz,
  error_message text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Индексы для email очереди
CREATE INDEX IF NOT EXISTS email_queue_status_idx ON email_queue(status);
CREATE INDEX IF NOT EXISTS email_queue_scheduled_at_idx ON email_queue(scheduled_at);
CREATE INDEX IF NOT EXISTS email_queue_priority_idx ON email_queue(priority);

-- Таблица для email шаблонов
CREATE TABLE IF NOT EXISTS email_templates (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text UNIQUE NOT NULL,
  subject_template text NOT NULL,
  html_template text NOT NULL,
  text_template text,
  locale text DEFAULT 'ru',
  variables jsonb DEFAULT '[]'::jsonb,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Исправляем таблицу profiles
DO $$
BEGIN
  -- Добавляем недостающие колонки
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'email_verified') THEN
    ALTER TABLE profiles ADD COLUMN email_verified boolean DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'last_login') THEN
    ALTER TABLE profiles ADD COLUMN last_login timestamptz;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'login_count') THEN
    ALTER TABLE profiles ADD COLUMN login_count integer DEFAULT 0;
  END IF;
END $$;

-- Исправляем foreign key для profiles
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'profiles_id_fkey') THEN
    ALTER TABLE profiles DROP CONSTRAINT profiles_id_fkey;
  END IF;
  
  ALTER TABLE profiles ADD CONSTRAINT profiles_id_fkey 
    FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
END $$;

-- Создаем недостающие таблицы если их нет
CREATE TABLE IF NOT EXISTS wishlists (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  is_public boolean DEFAULT false,
  cover_image text,
  user_id uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  category text,
  tags text[]
);

CREATE TABLE IF NOT EXISTS wishlist_items (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  price numeric,
  currency text DEFAULT 'RUB',
  image_url text,
  store_url text,
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  is_purchased boolean DEFAULT false,
  purchased_by uuid,
  wishlist_id uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS campaigns (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  wishlist_item_id uuid NOT NULL,
  goal_amount numeric NOT NULL,
  current_amount numeric DEFAULT 0,
  is_active boolean DEFAULT true,
  end_date timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS donations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id uuid NOT NULL,
  user_id uuid,
  amount numeric NOT NULL,
  status text DEFAULT 'simulated' CHECK (status IN ('simulated', 'pending', 'completed')),
  message text,
  is_anonymous boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ai_recommendations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  recommendations_text text NOT NULL,
  context_hash text NOT NULL,
  expires_at timestamptz DEFAULT (now() + interval '24 hours'),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_interests (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  category text NOT NULL,
  keywords text[],
  weight integer DEFAULT 1,
  created_at timestamptz DEFAULT now()
);

-- Исправляем foreign keys для всех таблиц
DO $$
BEGIN
  -- wishlists
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'wishlists_user_id_fkey') THEN
    ALTER TABLE wishlists DROP CONSTRAINT wishlists_user_id_fkey;
  END IF;
  ALTER TABLE wishlists ADD CONSTRAINT wishlists_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

  -- wishlist_items
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'wishlist_items_wishlist_id_fkey') THEN
    ALTER TABLE wishlist_items DROP CONSTRAINT wishlist_items_wishlist_id_fkey;
  END IF;
  ALTER TABLE wishlist_items ADD CONSTRAINT wishlist_items_wishlist_id_fkey 
    FOREIGN KEY (wishlist_id) REFERENCES wishlists(id) ON DELETE CASCADE;
    
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'wishlist_items_purchased_by_fkey') THEN
    ALTER TABLE wishlist_items DROP CONSTRAINT wishlist_items_purchased_by_fkey;
  END IF;
  ALTER TABLE wishlist_items ADD CONSTRAINT wishlist_items_purchased_by_fkey 
    FOREIGN KEY (purchased_by) REFERENCES profiles(id);

  -- campaigns
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'campaigns_wishlist_item_id_fkey') THEN
    ALTER TABLE campaigns DROP CONSTRAINT campaigns_wishlist_item_id_fkey;
  END IF;
  ALTER TABLE campaigns ADD CONSTRAINT campaigns_wishlist_item_id_fkey 
    FOREIGN KEY (wishlist_item_id) REFERENCES wishlist_items(id) ON DELETE CASCADE;

  -- donations
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'donations_campaign_id_fkey') THEN
    ALTER TABLE donations DROP CONSTRAINT donations_campaign_id_fkey;
  END IF;
  ALTER TABLE donations ADD CONSTRAINT donations_campaign_id_fkey 
    FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE;
    
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'donations_user_id_fkey') THEN
    ALTER TABLE donations DROP CONSTRAINT donations_user_id_fkey;
  END IF;
  ALTER TABLE donations ADD CONSTRAINT donations_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

  -- ai_recommendations
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'ai_recommendations_user_id_fkey') THEN
    ALTER TABLE ai_recommendations DROP CONSTRAINT ai_recommendations_user_id_fkey;
  END IF;
  ALTER TABLE ai_recommendations ADD CONSTRAINT ai_recommendations_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

  -- user_interests
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'user_interests_user_id_fkey') THEN
    ALTER TABLE user_interests DROP CONSTRAINT user_interests_user_id_fkey;
  END IF;
  ALTER TABLE user_interests ADD CONSTRAINT user_interests_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
END $$;

-- Создаем все необходимые индексы
CREATE INDEX IF NOT EXISTS profiles_email_idx ON profiles(email);
CREATE INDEX IF NOT EXISTS profiles_username_idx ON profiles(username);
CREATE INDEX IF NOT EXISTS profiles_privacy_settings_idx ON profiles(privacy_settings);

CREATE INDEX IF NOT EXISTS wishlists_category_idx ON wishlists(category);
CREATE INDEX IF NOT EXISTS wishlists_is_public_idx ON wishlists(is_public);
CREATE INDEX IF NOT EXISTS wishlists_user_id_idx ON wishlists(user_id);

CREATE INDEX IF NOT EXISTS wishlist_items_wishlist_id_idx ON wishlist_items(wishlist_id);
CREATE INDEX IF NOT EXISTS wishlist_items_is_purchased_idx ON wishlist_items(is_purchased);
CREATE INDEX IF NOT EXISTS wishlist_items_priority_idx ON wishlist_items(priority);

CREATE INDEX IF NOT EXISTS campaigns_wishlist_item_id_idx ON campaigns(wishlist_item_id);
CREATE INDEX IF NOT EXISTS campaigns_is_active_idx ON campaigns(is_active);
CREATE INDEX IF NOT EXISTS campaigns_end_date_idx ON campaigns(end_date);

CREATE INDEX IF NOT EXISTS donations_campaign_id_idx ON donations(campaign_id);
CREATE INDEX IF NOT EXISTS donations_user_id_idx ON donations(user_id);
CREATE INDEX IF NOT EXISTS donations_status_idx ON donations(status);

CREATE INDEX IF NOT EXISTS ai_recommendations_user_id_idx ON ai_recommendations(user_id);
CREATE INDEX IF NOT EXISTS ai_recommendations_context_hash_idx ON ai_recommendations(context_hash);
CREATE INDEX IF NOT EXISTS ai_recommendations_expires_at_idx ON ai_recommendations(expires_at);

CREATE INDEX IF NOT EXISTS user_interests_user_id_idx ON user_interests(user_id);
CREATE INDEX IF NOT EXISTS user_interests_category_idx ON user_interests(category);

-- Включаем RLS для всех таблиц
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE friend_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE operation_logs ENABLE ROW LEVEL SECURITY;

-- Удаляем все старые политики
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT schemaname, tablename, policyname FROM pg_policies WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON ' || quote_ident(r.schemaname) || '.' || quote_ident(r.tablename);
    END LOOP;
END $$;

-- Создаем новые RLS политики
-- Политики для profiles
CREATE POLICY "profiles_select_policy" ON profiles
  FOR SELECT USING (
    privacy_settings = 'public' OR 
    auth.uid() = id OR
    auth.uid() IS NOT NULL
  );

CREATE POLICY "profiles_insert_policy" ON profiles
  FOR INSERT WITH CHECK (
    auth.uid() = id OR
    auth.uid() IS NOT NULL
  );

CREATE POLICY "profiles_update_policy" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Политики для wishlists
CREATE POLICY "wishlists_all_policy" ON wishlists
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "wishlists_select_policy" ON wishlists
  FOR SELECT USING (
    (is_public = true) OR 
    (auth.uid() IS NOT NULL AND auth.uid() = user_id)
  );

-- Политики для wishlist_items
CREATE POLICY "wishlist_items_all_policy" ON wishlist_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM wishlists 
      WHERE wishlists.id = wishlist_items.wishlist_id 
      AND auth.uid() = wishlists.user_id
    )
  );

CREATE POLICY "wishlist_items_select_policy" ON wishlist_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM wishlists 
      WHERE wishlists.id = wishlist_items.wishlist_id 
      AND (
        wishlists.is_public = true OR 
        (auth.uid() IS NOT NULL AND wishlists.user_id = auth.uid())
      )
    )
  );

-- Политики для campaigns
CREATE POLICY "campaigns_all_policy" ON campaigns
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM wishlist_items wi
      JOIN wishlists w ON w.id = wi.wishlist_id
      WHERE wi.id = campaigns.wishlist_item_id 
      AND auth.uid() = w.user_id
    )
  );

CREATE POLICY "campaigns_select_policy" ON campaigns
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM wishlist_items wi
      JOIN wishlists w ON w.id = wi.wishlist_id
      WHERE wi.id = campaigns.wishlist_item_id 
      AND (
        w.is_public = true OR 
        (auth.uid() IS NOT NULL AND w.user_id = auth.uid())
      )
    )
  );

-- Политики для donations
CREATE POLICY "donations_insert_policy" ON donations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "donations_select_policy" ON donations
  FOR SELECT USING (
    (auth.uid() IS NOT NULL AND auth.uid() = user_id) OR
    (EXISTS (
      SELECT 1 FROM campaigns c
      JOIN wishlist_items wi ON wi.id = c.wishlist_item_id
      JOIN wishlists w ON w.id = wi.wishlist_id
      WHERE c.id = donations.campaign_id 
      AND auth.uid() = w.user_id
    ))
  );

-- Политики для ai_recommendations
CREATE POLICY "ai_recommendations_select_policy" ON ai_recommendations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "ai_recommendations_all_policy" ON ai_recommendations
  FOR ALL USING (auth.uid() = user_id);

-- Политики для user_interests
CREATE POLICY "user_interests_all_policy" ON user_interests
  FOR ALL USING (auth.uid() = user_id);

-- Политики для friendships
CREATE POLICY "friendships_select_policy" ON friendships
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "friendships_insert_policy" ON friendships
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "friendships_delete_policy" ON friendships
  FOR DELETE USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- Политики для friend_requests
CREATE POLICY "friend_requests_select_policy" ON friend_requests
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "friend_requests_insert_policy" ON friend_requests
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "friend_requests_update_policy" ON friend_requests
  FOR UPDATE USING (auth.uid() = receiver_id OR auth.uid() = sender_id);

CREATE POLICY "friend_requests_delete_policy" ON friend_requests
  FOR DELETE USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Политики для product_views
CREATE POLICY "product_views_select_policy" ON product_views
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "product_views_insert_policy" ON product_views
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Политики для product_recommendations
CREATE POLICY "product_recommendations_select_policy" ON product_recommendations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "product_recommendations_all_policy" ON product_recommendations
  FOR ALL USING (auth.uid() = user_id);

-- Политики для email_queue (только через функции)
CREATE POLICY "email_queue_admin_only" ON email_queue
  FOR ALL USING (false);

-- Политики для email_templates (только чтение)
CREATE POLICY "email_templates_read_only" ON email_templates
  FOR SELECT USING (is_active = true);

-- Политики для operation_logs (только чтение своих логов)
CREATE POLICY "operation_logs_own_only" ON operation_logs
  FOR SELECT USING (user_id = auth.uid());

-- Создаем триггеры для updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at 
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_wishlists_updated_at ON wishlists;
CREATE TRIGGER update_wishlists_updated_at 
  BEFORE UPDATE ON wishlists
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_wishlist_items_updated_at ON wishlist_items;
CREATE TRIGGER update_wishlist_items_updated_at 
  BEFORE UPDATE ON wishlist_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_campaigns_updated_at ON campaigns;
CREATE TRIGGER update_campaigns_updated_at 
  BEFORE UPDATE ON campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_friend_requests_updated_at ON friend_requests;
CREATE TRIGGER update_friend_requests_updated_at 
  BEFORE UPDATE ON friend_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_email_queue_updated_at ON email_queue;
CREATE TRIGGER update_email_queue_updated_at 
  BEFORE UPDATE ON email_queue
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_email_templates_updated_at ON email_templates;
CREATE TRIGGER update_email_templates_updated_at 
  BEFORE UPDATE ON email_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Функция для логирования операций
CREATE OR REPLACE FUNCTION log_operation(
  operation_type text,
  table_name text,
  record_id uuid,
  details jsonb DEFAULT '{}'::jsonb
) RETURNS void AS $$
BEGIN
  INSERT INTO operation_logs (
    operation_type,
    table_name,
    record_id,
    user_id,
    details,
    created_at
  ) VALUES (
    operation_type,
    table_name,
    record_id,
    auth.uid(),
    details,
    now()
  );
EXCEPTION WHEN OTHERS THEN
  -- Логирование не должно ломать основные операции
  NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Функция для обновления счетчика входов
CREATE OR REPLACE FUNCTION update_login_stats(user_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE profiles 
  SET 
    last_login = now(),
    login_count = COALESCE(login_count, 0) + 1
  WHERE id = user_id;
  
  PERFORM log_operation('login', 'profiles', user_id, jsonb_build_object('timestamp', now()));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Функция для добавления email в очередь
CREATE OR REPLACE FUNCTION queue_email(
  recipient text,
  template text,
  data jsonb DEFAULT '{}'::jsonb,
  priority_level integer DEFAULT 5
) RETURNS uuid AS $$
DECLARE
  email_id uuid;
  template_record email_templates%ROWTYPE;
BEGIN
  -- Проверяем существование шаблона
  SELECT * INTO template_record FROM email_templates 
  WHERE name = template AND is_active = true;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Шаблон email не найден: %', template;
  END IF;
  
  -- Добавляем в очередь
  INSERT INTO email_queue (
    recipient_email,
    subject,
    template_name,
    template_data,
    priority
  ) VALUES (
    recipient,
    template_record.subject_template,
    template,
    data,
    priority_level
  ) RETURNING id INTO email_id;
  
  PERFORM log_operation('email_queued', 'email_queue', email_id, 
    jsonb_build_object('recipient', recipient, 'template', template));
  
  RETURN email_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Функция для автоматического создания профиля
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
DECLARE
  user_name text;
  user_username text;
BEGIN
  -- Определяем имя пользователя
  user_name := COALESCE(
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'name',
    split_part(new.email, '@', 1),
    'Пользователь'
  );
  
  -- Определяем username
  user_username := COALESCE(
    new.raw_user_meta_data->>'username',
    lower(regexp_replace(split_part(COALESCE(new.email, ''), '@', 1), '[^a-zA-Z0-9]', '_', 'g')),
    'user_' || substring(new.id::text, 1, 8)
  );
  
  -- Создаем профиль
  INSERT INTO public.profiles (
    id,
    email,
    name,
    username,
    is_guest,
    email_verified,
    privacy_settings
  ) VALUES (
    new.id,
    new.email,
    user_name,
    user_username,
    COALESCE(new.is_anonymous, false),
    COALESCE(new.email_confirmed_at IS NOT NULL, false),
    'public'
  );
  
  -- Логируем создание пользователя
  PERFORM log_operation('user_created', 'profiles', new.id, 
    jsonb_build_object('email', new.email, 'is_anonymous', COALESCE(new.is_anonymous, false)));
  
  -- Отправляем приветственное письмо (только для обычных пользователей)
  IF NOT COALESCE(new.is_anonymous, false) AND new.email IS NOT NULL THEN
    PERFORM queue_email(
      new.email,
      'welcome',
      jsonb_build_object('name', user_name),
      1 -- высокий приоритет
    );
  END IF;
  
  RETURN new;
EXCEPTION WHEN OTHERS THEN
  -- Логируем ошибку, но не прерываем создание пользователя
  PERFORM log_operation('user_creation_error', 'profiles', new.id, 
    jsonb_build_object('error', SQLERRM));
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Функции для работы с дружбой
CREATE OR REPLACE FUNCTION create_mutual_friendship(user1_id uuid, user2_id uuid)
RETURNS void AS $$
BEGIN
  -- Создаем дружбу в обе стороны
  INSERT INTO friendships (user_id, friend_id) 
  VALUES (user1_id, user2_id), (user2_id, user1_id)
  ON CONFLICT (user_id, friend_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION remove_mutual_friendship(user1_id uuid, user2_id uuid)
RETURNS void AS $$
BEGIN
  -- Удаляем дружбу в обе стороны
  DELETE FROM friendships 
  WHERE (user_id = user1_id AND friend_id = user2_id) 
     OR (user_id = user2_id AND friend_id = user1_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Функция для очистки старых логов
CREATE OR REPLACE FUNCTION cleanup_old_logs()
RETURNS void AS $$
BEGIN
  -- Удаляем логи старше 30 дней
  DELETE FROM operation_logs 
  WHERE created_at < now() - interval '30 days';
  
  -- Удаляем отправленные email старше 7 дней
  DELETE FROM email_queue 
  WHERE status = 'sent' AND sent_at < now() - interval '7 days';
  
  -- Удаляем неудачные email старше 3 дней
  DELETE FROM email_queue 
  WHERE status = 'failed' AND updated_at < now() - interval '3 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Пересоздаем триггер для автоматического создания профиля
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Вставляем базовые email шаблоны
INSERT INTO email_templates (name, subject_template, html_template, text_template, variables) VALUES
('welcome', 'Добро пожаловать в WishFlick!', 
 '<h1>Добро пожаловать, {{name}}!</h1><p>Спасибо за регистрацию в WishFlick. Ваш аккаунт успешно создан.</p>',
 'Добро пожаловать, {{name}}! Спасибо за регистрацию в WishFlick.',
 '["name"]'::jsonb),
('email_confirmation', 'Подтвердите ваш email адрес',
 '<h1>Подтверждение email</h1><p>Нажмите на ссылку для подтверждения: <a href="{{confirmation_url}}">Подтвердить</a></p>',
 'Подтвердите email по ссылке: {{confirmation_url}}',
 '["confirmation_url"]'::jsonb),
('password_reset', 'Восстановление пароля',
 '<h1>Восстановление пароля</h1><p>Для сброса пароля перейдите по ссылке: <a href="{{reset_url}}">Сбросить пароль</a></p>',
 'Для сброса пароля перейдите по ссылке: {{reset_url}}',
 '["reset_url"]'::jsonb)
ON CONFLICT (name) DO NOTHING;