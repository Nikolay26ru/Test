/*
  # Полная схема базы данных WishFlick

  1. Новые таблицы
    - `profiles` - профили пользователей
    - `wishlists` - списки желаний
    - `wishlist_items` - товары в списках
    - `friendships` - дружеские связи
    - `friend_requests` - запросы на дружбу
    - `campaigns` - краудфандинг кампании
    - `donations` - пожертвования
    - `ai_recommendations` - AI рекомендации
    - `user_interests` - интересы пользователей
    - `product_views` - просмотры товаров
    - `product_recommendations` - рекомендации товаров

  2. Безопасность
    - RLS политики для всех таблиц
    - Правильные foreign key связи
    - Валидация данных

  3. Индексы
    - Оптимизация для быстрых запросов
    - Составные индексы для сложных запросов
*/

-- Создаем расширения
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Функция для обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Таблица профилей пользователей
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  name text NOT NULL,
  username text UNIQUE,
  avatar_url text,
  bio text,
  privacy_settings text DEFAULT 'public' CHECK (privacy_settings IN ('public', 'friends', 'private')),
  is_guest boolean DEFAULT false,
  email_verified boolean DEFAULT false,
  interests text[],
  last_login timestamptz,
  login_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Таблица списков желаний
CREATE TABLE IF NOT EXISTS wishlists (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  is_public boolean DEFAULT false,
  cover_image text,
  category text,
  tags text[],
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Таблица товаров в списках
CREATE TABLE IF NOT EXISTS wishlist_items (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  price numeric CHECK (price >= 0),
  currency text DEFAULT 'RUB',
  image_url text,
  store_url text,
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  is_purchased boolean DEFAULT false,
  purchased_by uuid REFERENCES profiles(id),
  wishlist_id uuid NOT NULL REFERENCES wishlists(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Таблица дружеских связей
CREATE TABLE IF NOT EXISTS friendships (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  friend_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, friend_id),
  CHECK (user_id != friend_id)
);

-- Таблица запросов на дружбу
CREATE TABLE IF NOT EXISTS friend_requests (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(sender_id, receiver_id),
  CHECK (sender_id != receiver_id)
);

-- Таблица краудфандинг кампаний
CREATE TABLE IF NOT EXISTS campaigns (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  wishlist_item_id uuid NOT NULL REFERENCES wishlist_items(id) ON DELETE CASCADE,
  goal_amount numeric NOT NULL CHECK (goal_amount > 0),
  current_amount numeric DEFAULT 0 CHECK (current_amount >= 0),
  is_active boolean DEFAULT true,
  end_date timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Таблица пожертвований
CREATE TABLE IF NOT EXISTS donations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id uuid NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  amount numeric NOT NULL CHECK (amount > 0),
  status text DEFAULT 'simulated' CHECK (status IN ('simulated', 'pending', 'completed')),
  message text,
  is_anonymous boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Таблица AI рекомендаций
CREATE TABLE IF NOT EXISTS ai_recommendations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  recommendations_text text NOT NULL,
  context_hash text NOT NULL,
  expires_at timestamptz DEFAULT (now() + interval '24 hours'),
  created_at timestamptz DEFAULT now()
);

-- Таблица интересов пользователей
CREATE TABLE IF NOT EXISTS user_interests (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  category text NOT NULL,
  keywords text[],
  weight integer DEFAULT 1,
  created_at timestamptz DEFAULT now()
);

-- Таблица просмотров товаров
CREATE TABLE IF NOT EXISTS product_views (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  wishlist_item_id uuid NOT NULL REFERENCES wishlist_items(id) ON DELETE CASCADE,
  viewed_at timestamptz DEFAULT now()
);

-- Таблица рекомендаций товаров
CREATE TABLE IF NOT EXISTS product_recommendations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  recommended_items jsonb NOT NULL,
  view_count integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + interval '24 hours')
);

-- Создаем индексы для оптимизации
CREATE INDEX IF NOT EXISTS profiles_email_idx ON profiles(email);
CREATE INDEX IF NOT EXISTS profiles_username_idx ON profiles(username);
CREATE INDEX IF NOT EXISTS profiles_privacy_settings_idx ON profiles(privacy_settings);

CREATE INDEX IF NOT EXISTS wishlists_user_id_idx ON wishlists(user_id);
CREATE INDEX IF NOT EXISTS wishlists_is_public_idx ON wishlists(is_public);
CREATE INDEX IF NOT EXISTS wishlists_category_idx ON wishlists(category);

CREATE INDEX IF NOT EXISTS wishlist_items_wishlist_id_idx ON wishlist_items(wishlist_id);
CREATE INDEX IF NOT EXISTS wishlist_items_is_purchased_idx ON wishlist_items(is_purchased);
CREATE INDEX IF NOT EXISTS wishlist_items_priority_idx ON wishlist_items(priority);

CREATE INDEX IF NOT EXISTS friendships_user_id_idx ON friendships(user_id);
CREATE INDEX IF NOT EXISTS friendships_friend_id_idx ON friendships(friend_id);

CREATE INDEX IF NOT EXISTS friend_requests_sender_id_idx ON friend_requests(sender_id);
CREATE INDEX IF NOT EXISTS friend_requests_receiver_id_idx ON friend_requests(receiver_id);
CREATE INDEX IF NOT EXISTS friend_requests_status_idx ON friend_requests(status);

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

CREATE INDEX IF NOT EXISTS product_views_user_id_idx ON product_views(user_id);
CREATE INDEX IF NOT EXISTS product_views_wishlist_item_id_idx ON product_views(wishlist_item_id);
CREATE INDEX IF NOT EXISTS product_views_viewed_at_idx ON product_views(viewed_at);

CREATE INDEX IF NOT EXISTS product_recommendations_user_id_idx ON product_recommendations(user_id);
CREATE INDEX IF NOT EXISTS product_recommendations_expires_at_idx ON product_recommendations(expires_at);

-- Включаем RLS для всех таблиц
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE friend_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_recommendations ENABLE ROW LEVEL SECURITY;

-- RLS политики для profiles
CREATE POLICY "profiles_select_policy" ON profiles
  FOR SELECT USING (
    privacy_settings = 'public' OR 
    auth.uid() = id OR
    auth.uid() IS NOT NULL
  );

CREATE POLICY "profiles_insert_policy" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_policy" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- RLS политики для wishlists
CREATE POLICY "wishlists_select_policy" ON wishlists
  FOR SELECT USING (
    is_public = true OR 
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM friendships 
      WHERE (user_id = auth.uid() AND friend_id = wishlists.user_id)
         OR (user_id = wishlists.user_id AND friend_id = auth.uid())
    )
  );

CREATE POLICY "wishlists_insert_policy" ON wishlists
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "wishlists_update_policy" ON wishlists
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "wishlists_delete_policy" ON wishlists
  FOR DELETE USING (auth.uid() = user_id);

-- RLS политики для wishlist_items
CREATE POLICY "wishlist_items_select_policy" ON wishlist_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM wishlists 
      WHERE wishlists.id = wishlist_items.wishlist_id 
      AND (
        wishlists.is_public = true OR 
        auth.uid() = wishlists.user_id OR
        EXISTS (
          SELECT 1 FROM friendships 
          WHERE (user_id = auth.uid() AND friend_id = wishlists.user_id)
             OR (user_id = wishlists.user_id AND friend_id = auth.uid())
        )
      )
    )
  );

CREATE POLICY "wishlist_items_insert_policy" ON wishlist_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM wishlists 
      WHERE wishlists.id = wishlist_items.wishlist_id 
      AND auth.uid() = wishlists.user_id
    )
  );

CREATE POLICY "wishlist_items_update_policy" ON wishlist_items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM wishlists 
      WHERE wishlists.id = wishlist_items.wishlist_id 
      AND auth.uid() = wishlists.user_id
    )
  );

CREATE POLICY "wishlist_items_delete_policy" ON wishlist_items
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM wishlists 
      WHERE wishlists.id = wishlist_items.wishlist_id 
      AND auth.uid() = wishlists.user_id
    )
  );

-- RLS политики для friendships
CREATE POLICY "friendships_select_policy" ON friendships
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "friendships_insert_policy" ON friendships
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "friendships_delete_policy" ON friendships
  FOR DELETE USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- RLS политики для friend_requests
CREATE POLICY "friend_requests_select_policy" ON friend_requests
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "friend_requests_insert_policy" ON friend_requests
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "friend_requests_update_policy" ON friend_requests
  FOR UPDATE USING (auth.uid() = receiver_id OR auth.uid() = sender_id);

CREATE POLICY "friend_requests_delete_policy" ON friend_requests
  FOR DELETE USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- RLS политики для campaigns
CREATE POLICY "campaigns_select_policy" ON campaigns
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM wishlist_items wi
      JOIN wishlists w ON w.id = wi.wishlist_id
      WHERE wi.id = campaigns.wishlist_item_id 
      AND (
        w.is_public = true OR 
        auth.uid() = w.user_id OR
        EXISTS (
          SELECT 1 FROM friendships 
          WHERE (user_id = auth.uid() AND friend_id = w.user_id)
             OR (user_id = w.user_id AND friend_id = auth.uid())
        )
      )
    )
  );

CREATE POLICY "campaigns_insert_policy" ON campaigns
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM wishlist_items wi
      JOIN wishlists w ON w.id = wi.wishlist_id
      WHERE wi.id = campaigns.wishlist_item_id 
      AND auth.uid() = w.user_id
    )
  );

CREATE POLICY "campaigns_update_policy" ON campaigns
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM wishlist_items wi
      JOIN wishlists w ON w.id = wi.wishlist_id
      WHERE wi.id = campaigns.wishlist_item_id 
      AND auth.uid() = w.user_id
    )
  );

CREATE POLICY "campaigns_delete_policy" ON campaigns
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM wishlist_items wi
      JOIN wishlists w ON w.id = wi.wishlist_id
      WHERE wi.id = campaigns.wishlist_item_id 
      AND auth.uid() = w.user_id
    )
  );

-- RLS политики для donations
CREATE POLICY "donations_select_policy" ON donations
  FOR SELECT USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM campaigns c
      JOIN wishlist_items wi ON wi.id = c.wishlist_item_id
      JOIN wishlists w ON w.id = wi.wishlist_id
      WHERE c.id = donations.campaign_id 
      AND auth.uid() = w.user_id
    )
  );

CREATE POLICY "donations_insert_policy" ON donations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS политики для ai_recommendations
CREATE POLICY "ai_recommendations_select_policy" ON ai_recommendations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "ai_recommendations_insert_policy" ON ai_recommendations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "ai_recommendations_update_policy" ON ai_recommendations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "ai_recommendations_delete_policy" ON ai_recommendations
  FOR DELETE USING (auth.uid() = user_id);

-- RLS политики для user_interests
CREATE POLICY "user_interests_select_policy" ON user_interests
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "user_interests_insert_policy" ON user_interests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_interests_update_policy" ON user_interests
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "user_interests_delete_policy" ON user_interests
  FOR DELETE USING (auth.uid() = user_id);

-- RLS политики для product_views
CREATE POLICY "product_views_select_policy" ON product_views
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "product_views_insert_policy" ON product_views
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS политики для product_recommendations
CREATE POLICY "product_recommendations_select_policy" ON product_recommendations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "product_recommendations_insert_policy" ON product_recommendations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "product_recommendations_update_policy" ON product_recommendations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "product_recommendations_delete_policy" ON product_recommendations
  FOR DELETE USING (auth.uid() = user_id);

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

CREATE TRIGGER update_friend_requests_updated_at 
  BEFORE UPDATE ON friend_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaigns_updated_at 
  BEFORE UPDATE ON campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Функции для работы с дружбой
CREATE OR REPLACE FUNCTION create_mutual_friendship(user1_id uuid, user2_id uuid)
RETURNS void AS $$
BEGIN
  INSERT INTO friendships (user_id, friend_id) 
  VALUES (user1_id, user2_id), (user2_id, user1_id)
  ON CONFLICT (user_id, friend_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION remove_mutual_friendship(user1_id uuid, user2_id uuid)
RETURNS void AS $$
BEGIN
  DELETE FROM friendships 
  WHERE (user_id = user1_id AND friend_id = user2_id) 
     OR (user_id = user2_id AND friend_id = user1_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Функция для автоматического создания профиля
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, username, is_guest)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', new.email, 'Пользователь'),
    COALESCE(
      new.raw_user_meta_data->>'username',
      split_part(new.email, '@', 1),
      'user_' || substring(new.id::text, 1, 8)
    ),
    COALESCE(new.is_anonymous, false)
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Триггер для автоматического создания профиля
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();