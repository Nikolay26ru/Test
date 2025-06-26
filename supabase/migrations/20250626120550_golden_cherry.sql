/*
  # Полная схема WishFlick с AI и краудфандингом

  1. Новые таблицы
    - `profiles` - расширенные профили пользователей
    - `campaigns` - краудфандинговые кампании
    - `donations` - пожертвования (демо-режим)
    - `ai_recommendations` - кэш AI-рекомендаций
    - `user_interests` - интересы пользователей

  2. Обновления существующих таблиц
    - Добавлены поля для приватности
    - Улучшена структура wishlist_items

  3. Безопасность
    - RLS политики для всех таблиц
    - Гостевой доступ с ограничениями
*/

-- Расширенные профили пользователей
CREATE TABLE IF NOT EXISTS profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
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

-- Обновленная таблица списков желаний
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

-- Обновленная таблица товаров
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

-- Краудфандинговые кампании
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

-- Пожертвования (демо-режим)
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

-- AI рекомендации (кэш)
CREATE TABLE IF NOT EXISTS ai_recommendations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  recommendations_text text NOT NULL,
  context_hash text NOT NULL,
  expires_at timestamptz DEFAULT (now() + interval '24 hours'),
  created_at timestamptz DEFAULT now()
);

-- Интересы пользователей
CREATE TABLE IF NOT EXISTS user_interests (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  category text NOT NULL,
  keywords text[],
  weight integer DEFAULT 1,
  created_at timestamptz DEFAULT now()
);

-- Включение RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_interests ENABLE ROW LEVEL SECURITY;

-- Политики для profiles
CREATE POLICY "Публичные профили видны всем" ON profiles
  FOR SELECT USING (
    privacy_settings = 'public' OR 
    auth.uid() = id OR 
    auth.uid() IS NULL
  );

CREATE POLICY "Пользователи могут обновлять свой профиль" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Пользователи могут создавать профиль" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Политики для wishlists
CREATE POLICY "Публичные списки видны всем" ON wishlists
  FOR SELECT USING (
    is_public = true OR 
    auth.uid() = user_id
  );

CREATE POLICY "Пользователи управляют своими списками" ON wishlists
  FOR ALL USING (auth.uid() = user_id);

-- Политики для wishlist_items
CREATE POLICY "Товары видны если список доступен" ON wishlist_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM wishlists
      WHERE wishlists.id = wishlist_items.wishlist_id
      AND (wishlists.is_public = true OR wishlists.user_id = auth.uid())
    )
  );

CREATE POLICY "Владельцы списков управляют товарами" ON wishlist_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM wishlists
      WHERE wishlists.id = wishlist_items.wishlist_id
      AND wishlists.user_id = auth.uid()
    )
  );

-- Политики для campaigns
CREATE POLICY "Кампании видны если товар доступен" ON campaigns
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM wishlist_items wi
      JOIN wishlists w ON w.id = wi.wishlist_id
      WHERE wi.id = campaigns.wishlist_item_id
      AND (w.is_public = true OR w.user_id = auth.uid())
    )
  );

CREATE POLICY "Владельцы товаров управляют кампаниями" ON campaigns
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM wishlist_items wi
      JOIN wishlists w ON w.id = wi.wishlist_id
      WHERE wi.id = campaigns.wishlist_item_id
      AND w.user_id = auth.uid()
    )
  );

-- Политики для donations
CREATE POLICY "Пожертвования видны участникам" ON donations
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

CREATE POLICY "Авторизованные пользователи могут жертвовать" ON donations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Политики для AI рекомендаций
CREATE POLICY "Пользователи видят свои рекомендации" ON ai_recommendations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Пользователи управляют своими рекомендациями" ON ai_recommendations
  FOR ALL USING (auth.uid() = user_id);

-- Политики для интересов
CREATE POLICY "Пользователи управляют своими интересами" ON user_interests
  FOR ALL USING (auth.uid() = user_id);

-- Функция для автоматического создания профиля
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, email, name, username, is_guest)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email, 'Пользователь'),
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8)),
    CASE WHEN NEW.email IS NULL THEN true ELSE false END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Триггер для создания профиля
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Функция для обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггеры для updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wishlists_updated_at BEFORE UPDATE ON wishlists
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wishlist_items_updated_at BEFORE UPDATE ON wishlist_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();