/*
  # Исправление проблем с базой данных

  1. Очистка и пересоздание схемы
    - Удаление существующих политик и триггеров
    - Пересоздание таблиц с правильными связями
    - Настройка RLS политик

  2. Исправление связей между таблицами
    - Правильные foreign key constraints
    - Корректные ссылки между auth.users и profiles

  3. Функции и триггеры
    - Автоматическое создание профилей
    - Обновление timestamps
*/

-- Отключаем RLS временно для очистки
ALTER TABLE IF EXISTS profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS wishlists DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS wishlist_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS campaigns DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS donations DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS ai_recommendations DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS user_interests DISABLE ROW LEVEL SECURITY;

-- Удаляем существующие политики если они есть
DROP POLICY IF EXISTS "Публичные профили видны всем" ON profiles;
DROP POLICY IF EXISTS "Пользователи могут обновлять свой профиль" ON profiles;
DROP POLICY IF EXISTS "Пользователи могут создавать профиль" ON profiles;
DROP POLICY IF EXISTS "Публичные списки видны всем" ON wishlists;
DROP POLICY IF EXISTS "Пользователи управляют своими списками" ON wishlists;
DROP POLICY IF EXISTS "Товары видны если список доступен" ON wishlist_items;
DROP POLICY IF EXISTS "Владельцы списков управляют товарами" ON wishlist_items;
DROP POLICY IF EXISTS "Кампании видны если товар доступен" ON campaigns;
DROP POLICY IF EXISTS "Владельцы товаров управляют кампаниями" ON campaigns;
DROP POLICY IF EXISTS "Пожертвования видны участникам" ON donations;
DROP POLICY IF EXISTS "Авторизованные пользователи могут жертвовать" ON donations;
DROP POLICY IF EXISTS "Пользователи видят свои рекомендации" ON ai_recommendations;
DROP POLICY IF EXISTS "Пользователи управляют своими рекомендациями" ON ai_recommendations;
DROP POLICY IF EXISTS "Пользователи управляют своими интересами" ON user_interests;

-- Удаляем триггеры
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
DROP TRIGGER IF EXISTS update_wishlists_updated_at ON wishlists;
DROP TRIGGER IF EXISTS update_wishlist_items_updated_at ON wishlist_items;
DROP TRIGGER IF EXISTS update_campaigns_updated_at ON campaigns;

-- Создаем или обновляем функции
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Создаем таблицу profiles (если не существует)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email text,
  name text NOT NULL,
  avatar_url text,
  username text UNIQUE,
  bio text,
  privacy_settings text DEFAULT 'public' CHECK (privacy_settings IN ('public', 'friends', 'private')),
  is_guest boolean DEFAULT false,
  interests text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Создаем индексы для profiles
CREATE INDEX IF NOT EXISTS profiles_username_idx ON profiles(username);
CREATE INDEX IF NOT EXISTS profiles_email_idx ON profiles(email);

-- Создаем таблицу wishlists
CREATE TABLE IF NOT EXISTS wishlists (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  is_public boolean DEFAULT false,
  cover_image text,
  category text,
  tags text[],
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Создаем индексы для wishlists
CREATE INDEX IF NOT EXISTS wishlists_user_id_idx ON wishlists(user_id);
CREATE INDEX IF NOT EXISTS wishlists_is_public_idx ON wishlists(is_public);

-- Создаем таблицу wishlist_items
CREATE TABLE IF NOT EXISTS wishlist_items (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  price decimal,
  currency text DEFAULT 'RUB',
  image_url text,
  store_url text,
  priority text CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
  is_purchased boolean DEFAULT false,
  purchased_by uuid REFERENCES profiles(id),
  wishlist_id uuid REFERENCES wishlists(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Создаем индексы для wishlist_items
CREATE INDEX IF NOT EXISTS wishlist_items_wishlist_id_idx ON wishlist_items(wishlist_id);
CREATE INDEX IF NOT EXISTS wishlist_items_is_purchased_idx ON wishlist_items(is_purchased);

-- Создаем таблицу campaigns
CREATE TABLE IF NOT EXISTS campaigns (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  wishlist_item_id uuid REFERENCES wishlist_items(id) ON DELETE CASCADE NOT NULL,
  goal_amount decimal NOT NULL,
  current_amount decimal DEFAULT 0,
  is_active boolean DEFAULT true,
  end_date timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Создаем индексы для campaigns
CREATE INDEX IF NOT EXISTS campaigns_wishlist_item_id_idx ON campaigns(wishlist_item_id);
CREATE INDEX IF NOT EXISTS campaigns_is_active_idx ON campaigns(is_active);

-- Создаем таблицу donations
CREATE TABLE IF NOT EXISTS donations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id uuid REFERENCES campaigns(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  amount decimal NOT NULL,
  status text DEFAULT 'simulated' CHECK (status IN ('simulated', 'pending', 'completed')),
  message text,
  is_anonymous boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Создаем индексы для donations
CREATE INDEX IF NOT EXISTS donations_campaign_id_idx ON donations(campaign_id);
CREATE INDEX IF NOT EXISTS donations_user_id_idx ON donations(user_id);

-- Создаем таблицу ai_recommendations
CREATE TABLE IF NOT EXISTS ai_recommendations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  recommendations_text text NOT NULL,
  context_hash text NOT NULL,
  expires_at timestamptz DEFAULT (now() + interval '24 hours'),
  created_at timestamptz DEFAULT now()
);

-- Создаем индексы для ai_recommendations
CREATE INDEX IF NOT EXISTS ai_recommendations_user_id_idx ON ai_recommendations(user_id);
CREATE INDEX IF NOT EXISTS ai_recommendations_expires_at_idx ON ai_recommendations(expires_at);

-- Создаем таблицу user_interests
CREATE TABLE IF NOT EXISTS user_interests (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  category text NOT NULL,
  keywords text[],
  weight integer DEFAULT 1,
  created_at timestamptz DEFAULT now()
);

-- Создаем индексы для user_interests
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

-- Создаем политики для profiles
CREATE POLICY "profiles_select_policy" ON profiles
  FOR SELECT USING (
    privacy_settings = 'public' OR 
    auth.uid() = id OR 
    auth.uid() IS NULL
  );

CREATE POLICY "profiles_update_policy" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "profiles_insert_policy" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Создаем политики для wishlists
CREATE POLICY "wishlists_select_policy" ON wishlists
  FOR SELECT USING (
    is_public = true OR 
    auth.uid() = user_id
  );

CREATE POLICY "wishlists_all_policy" ON wishlists
  FOR ALL USING (auth.uid() = user_id);

-- Создаем политики для wishlist_items
CREATE POLICY "wishlist_items_select_policy" ON wishlist_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM wishlists
      WHERE wishlists.id = wishlist_items.wishlist_id
      AND (wishlists.is_public = true OR wishlists.user_id = auth.uid())
    )
  );

CREATE POLICY "wishlist_items_all_policy" ON wishlist_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM wishlists
      WHERE wishlists.id = wishlist_items.wishlist_id
      AND wishlists.user_id = auth.uid()
    )
  );

-- Создаем политики для campaigns
CREATE POLICY "campaigns_select_policy" ON campaigns
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM wishlist_items wi
      JOIN wishlists w ON w.id = wi.wishlist_id
      WHERE wi.id = campaigns.wishlist_item_id
      AND (w.is_public = true OR w.user_id = auth.uid())
    )
  );

CREATE POLICY "campaigns_all_policy" ON campaigns
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM wishlist_items wi
      JOIN wishlists w ON w.id = wi.wishlist_id
      WHERE wi.id = campaigns.wishlist_item_id
      AND w.user_id = auth.uid()
    )
  );

-- Создаем политики для donations
CREATE POLICY "donations_select_policy" ON donations
  FOR SELECT USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM campaigns c
      JOIN wishlist_items wi ON wi.id = c.wishlist_item_id
      JOIN wishlists w ON w.id = wi.wishlist_id
      WHERE c.id = donations.campaign_id
      AND w.user_id = auth.uid()
    )
  );

CREATE POLICY "donations_insert_policy" ON donations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Создаем политики для ai_recommendations
CREATE POLICY "ai_recommendations_select_policy" ON ai_recommendations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "ai_recommendations_all_policy" ON ai_recommendations
  FOR ALL USING (auth.uid() = user_id);

-- Создаем политики для user_interests
CREATE POLICY "user_interests_all_policy" ON user_interests
  FOR ALL USING (auth.uid() = user_id);

-- Создаем функцию для автоматического создания профиля
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, email, name, username, is_guest)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email, 'Пользователь'),
    COALESCE(
      NEW.raw_user_meta_data->>'username', 
      CASE 
        WHEN NEW.email IS NOT NULL THEN split_part(NEW.email, '@', 1)
        ELSE 'user_' || substr(NEW.id::text, 1, 8)
      END
    ),
    CASE WHEN NEW.email IS NULL THEN true ELSE false END
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = COALESCE(EXCLUDED.name, profiles.name),
    username = COALESCE(EXCLUDED.username, profiles.username),
    is_guest = EXCLUDED.is_guest,
    updated_at = now();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Создаем триггер для автоматического создания профиля
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Создаем триггеры для updated_at
CREATE TRIGGER update_profiles_updated_at 
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wishlists_updated_at 
  BEFORE UPDATE ON wishlists
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wishlist_items_updated_at 
  BEFORE UPDATE ON wishlist_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaigns_updated_at 
  BEFORE UPDATE ON campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Создаем функцию для получения текущего пользователя (helper)
CREATE OR REPLACE FUNCTION auth.uid() RETURNS uuid
    LANGUAGE sql STABLE
    AS $$
  select 
    coalesce(
        nullif(current_setting('request.jwt.claim.sub', true), ''),
        (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
    )::uuid
$$;

-- Создаем тестовые данные для проверки (опционально)
DO $$
BEGIN
  -- Проверяем, есть ли уже данные
  IF NOT EXISTS (SELECT 1 FROM profiles LIMIT 1) THEN
    -- Можно добавить тестовые данные здесь, если нужно
    NULL;
  END IF;
END $$;