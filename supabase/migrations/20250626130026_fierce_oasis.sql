/*
  # Создание полной схемы WishFlick

  1. Новые таблицы
    - `profiles` - профили пользователей
    - `wishlists` - списки желаний
    - `wishlist_items` - товары в списках
    - `campaigns` - краудфандинговые кампании
    - `donations` - пожертвования
    - `ai_recommendations` - AI рекомендации
    - `user_interests` - интересы пользователей

  2. Безопасность
    - Включение RLS для всех таблиц
    - Создание политик доступа
    - Триггеры для автоматического обновления

  3. Индексы
    - Оптимизация производительности запросов
*/

-- Создаем функцию для обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Создаем таблицу profiles
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY,
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

-- Добавляем foreign key constraint для profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'profiles_id_fkey'
  ) THEN
    ALTER TABLE profiles ADD CONSTRAINT profiles_id_fkey 
    FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Создаем индексы для profiles
CREATE INDEX IF NOT EXISTS profiles_username_idx ON profiles(username);
CREATE INDEX IF NOT EXISTS profiles_email_idx ON profiles(email);
CREATE INDEX IF NOT EXISTS profiles_privacy_settings_idx ON profiles(privacy_settings);

-- Создаем таблицу wishlists
CREATE TABLE IF NOT EXISTS wishlists (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  is_public boolean DEFAULT false,
  cover_image text,
  category text,
  tags text[],
  user_id uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Добавляем foreign key constraint для wishlists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'wishlists_user_id_fkey'
  ) THEN
    ALTER TABLE wishlists ADD CONSTRAINT wishlists_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Создаем индексы для wishlists
CREATE INDEX IF NOT EXISTS wishlists_user_id_idx ON wishlists(user_id);
CREATE INDEX IF NOT EXISTS wishlists_is_public_idx ON wishlists(is_public);
CREATE INDEX IF NOT EXISTS wishlists_category_idx ON wishlists(category);

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
  purchased_by uuid,
  wishlist_id uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Добавляем foreign key constraints для wishlist_items
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'wishlist_items_wishlist_id_fkey'
  ) THEN
    ALTER TABLE wishlist_items ADD CONSTRAINT wishlist_items_wishlist_id_fkey 
    FOREIGN KEY (wishlist_id) REFERENCES wishlists(id) ON DELETE CASCADE;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'wishlist_items_purchased_by_fkey'
  ) THEN
    ALTER TABLE wishlist_items ADD CONSTRAINT wishlist_items_purchased_by_fkey 
    FOREIGN KEY (purchased_by) REFERENCES profiles(id);
  END IF;
END $$;

-- Создаем индексы для wishlist_items
CREATE INDEX IF NOT EXISTS wishlist_items_wishlist_id_idx ON wishlist_items(wishlist_id);
CREATE INDEX IF NOT EXISTS wishlist_items_is_purchased_idx ON wishlist_items(is_purchased);
CREATE INDEX IF NOT EXISTS wishlist_items_priority_idx ON wishlist_items(priority);

-- Создаем таблицу campaigns
CREATE TABLE IF NOT EXISTS campaigns (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  wishlist_item_id uuid NOT NULL,
  goal_amount decimal NOT NULL,
  current_amount decimal DEFAULT 0,
  is_active boolean DEFAULT true,
  end_date timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Добавляем foreign key constraint для campaigns
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'campaigns_wishlist_item_id_fkey'
  ) THEN
    ALTER TABLE campaigns ADD CONSTRAINT campaigns_wishlist_item_id_fkey 
    FOREIGN KEY (wishlist_item_id) REFERENCES wishlist_items(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Создаем индексы для campaigns
CREATE INDEX IF NOT EXISTS campaigns_wishlist_item_id_idx ON campaigns(wishlist_item_id);
CREATE INDEX IF NOT EXISTS campaigns_is_active_idx ON campaigns(is_active);
CREATE INDEX IF NOT EXISTS campaigns_end_date_idx ON campaigns(end_date);

-- Создаем таблицу donations
CREATE TABLE IF NOT EXISTS donations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id uuid NOT NULL,
  user_id uuid,
  amount decimal NOT NULL,
  status text DEFAULT 'simulated' CHECK (status IN ('simulated', 'pending', 'completed')),
  message text,
  is_anonymous boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Добавляем foreign key constraints для donations
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'donations_campaign_id_fkey'
  ) THEN
    ALTER TABLE donations ADD CONSTRAINT donations_campaign_id_fkey 
    FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'donations_user_id_fkey'
  ) THEN
    ALTER TABLE donations ADD CONSTRAINT donations_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Создаем индексы для donations
CREATE INDEX IF NOT EXISTS donations_campaign_id_idx ON donations(campaign_id);
CREATE INDEX IF NOT EXISTS donations_user_id_idx ON donations(user_id);
CREATE INDEX IF NOT EXISTS donations_status_idx ON donations(status);

-- Создаем таблицу ai_recommendations
CREATE TABLE IF NOT EXISTS ai_recommendations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  recommendations_text text NOT NULL,
  context_hash text NOT NULL,
  expires_at timestamptz DEFAULT (now() + interval '24 hours'),
  created_at timestamptz DEFAULT now()
);

-- Добавляем foreign key constraint для ai_recommendations
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'ai_recommendations_user_id_fkey'
  ) THEN
    ALTER TABLE ai_recommendations ADD CONSTRAINT ai_recommendations_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Создаем индексы для ai_recommendations
CREATE INDEX IF NOT EXISTS ai_recommendations_user_id_idx ON ai_recommendations(user_id);
CREATE INDEX IF NOT EXISTS ai_recommendations_expires_at_idx ON ai_recommendations(expires_at);
CREATE INDEX IF NOT EXISTS ai_recommendations_context_hash_idx ON ai_recommendations(context_hash);

-- Создаем таблицу user_interests
CREATE TABLE IF NOT EXISTS user_interests (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  category text NOT NULL,
  keywords text[],
  weight integer DEFAULT 1,
  created_at timestamptz DEFAULT now()
);

-- Добавляем foreign key constraint для user_interests
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'user_interests_user_id_fkey'
  ) THEN
    ALTER TABLE user_interests ADD CONSTRAINT user_interests_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

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

-- Удаляем существующие политики если они есть
DROP POLICY IF EXISTS "Публичные профили видны всем" ON profiles;
DROP POLICY IF EXISTS "Пользователи могут обновлять свой профиль" ON profiles;
DROP POLICY IF EXISTS "Пользователи могут создавать профиль" ON profiles;
DROP POLICY IF EXISTS "profiles_select_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON profiles;

DROP POLICY IF EXISTS "Публичные списки видны всем" ON wishlists;
DROP POLICY IF EXISTS "Пользователи управляют своими списками" ON wishlists;
DROP POLICY IF EXISTS "wishlists_select_policy" ON wishlists;
DROP POLICY IF EXISTS "wishlists_all_policy" ON wishlists;

DROP POLICY IF EXISTS "Товары видны если список доступен" ON wishlist_items;
DROP POLICY IF EXISTS "Владельцы списков управляют товарами" ON wishlist_items;
DROP POLICY IF EXISTS "wishlist_items_select_policy" ON wishlist_items;
DROP POLICY IF EXISTS "wishlist_items_all_policy" ON wishlist_items;

DROP POLICY IF EXISTS "Кампании видны если товар доступен" ON campaigns;
DROP POLICY IF EXISTS "Владельцы товаров управляют кампаниями" ON campaigns;
DROP POLICY IF EXISTS "campaigns_select_policy" ON campaigns;
DROP POLICY IF EXISTS "campaigns_all_policy" ON campaigns;

DROP POLICY IF EXISTS "Пожертвования видны участникам" ON donations;
DROP POLICY IF EXISTS "Авторизованные пользователи могут жертвовать" ON donations;
DROP POLICY IF EXISTS "donations_select_policy" ON donations;
DROP POLICY IF EXISTS "donations_insert_policy" ON donations;

DROP POLICY IF EXISTS "Пользователи видят свои рекомендации" ON ai_recommendations;
DROP POLICY IF EXISTS "Пользователи управляют своими рекомендациями" ON ai_recommendations;
DROP POLICY IF EXISTS "ai_recommendations_select_policy" ON ai_recommendations;
DROP POLICY IF EXISTS "ai_recommendations_all_policy" ON ai_recommendations;

DROP POLICY IF EXISTS "Пользователи управляют своими интересами" ON user_interests;
DROP POLICY IF EXISTS "user_interests_all_policy" ON user_interests;

-- Создаем политики для profiles
CREATE POLICY "Публичные профили видны всем" ON profiles
  FOR SELECT USING (
    privacy_settings = 'public' OR 
    (auth.uid() IS NOT NULL AND auth.uid() = id) OR 
    auth.uid() IS NULL
  );

CREATE POLICY "Пользователи могут обновлять свой профиль" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Пользователи могут создавать профиль" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Создаем политики для wishlists
CREATE POLICY "Публичные списки видны всем" ON wishlists
  FOR SELECT USING (
    is_public = true OR 
    (auth.uid() IS NOT NULL AND auth.uid() = user_id)
  );

CREATE POLICY "Пользователи управляют своими списками" ON wishlists
  FOR ALL USING (auth.uid() = user_id);

-- Создаем политики для wishlist_items
CREATE POLICY "Товары видны если список доступен" ON wishlist_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM wishlists
      WHERE wishlists.id = wishlist_items.wishlist_id
      AND (wishlists.is_public = true OR (auth.uid() IS NOT NULL AND wishlists.user_id = auth.uid()))
    )
  );

CREATE POLICY "Владельцы списков управляют товарами" ON wishlist_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM wishlists
      WHERE wishlists.id = wishlist_items.wishlist_id
      AND auth.uid() = wishlists.user_id
    )
  );

-- Создаем политики для campaigns
CREATE POLICY "Кампании видны если товар доступен" ON campaigns
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM wishlist_items wi
      JOIN wishlists w ON w.id = wi.wishlist_id
      WHERE wi.id = campaigns.wishlist_item_id
      AND (w.is_public = true OR (auth.uid() IS NOT NULL AND w.user_id = auth.uid()))
    )
  );

CREATE POLICY "Владельцы товаров управляют кампаниями" ON campaigns
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM wishlist_items wi
      JOIN wishlists w ON w.id = wi.wishlist_id
      WHERE wi.id = campaigns.wishlist_item_id
      AND auth.uid() = w.user_id
    )
  );

-- Создаем политики для donations
CREATE POLICY "Пожертвования видны участникам" ON donations
  FOR SELECT USING (
    (auth.uid() IS NOT NULL AND auth.uid() = user_id) OR
    EXISTS (
      SELECT 1 FROM campaigns c
      JOIN wishlist_items wi ON wi.id = c.wishlist_item_id
      JOIN wishlists w ON w.id = wi.wishlist_id
      WHERE c.id = donations.campaign_id
      AND auth.uid() = w.user_id
    )
  );

CREATE POLICY "Авторизованные пользователи могут жертвовать" ON donations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Создаем политики для ai_recommendations
CREATE POLICY "Пользователи видят свои рекомендации" ON ai_recommendations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Пользователи управляют своими рекомендациями" ON ai_recommendations
  FOR ALL USING (auth.uid() = user_id);

-- Создаем политики для user_interests
CREATE POLICY "Пользователи управляют своими интересами" ON user_interests
  FOR ALL USING (auth.uid() = user_id);

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