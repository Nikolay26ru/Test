/*
  # Исправление политик авторизации для анонимных пользователей

  1. Обновление политик RLS для поддержки анонимных пользователей
  2. Добавление функций для работы с анонимными пользователями
  3. Исправление ограничений и индексов
*/

-- Функция для получения UID (работает с анонимными пользователями)
CREATE OR REPLACE FUNCTION uid() RETURNS uuid AS $$
BEGIN
  RETURN auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Обновляем политики для profiles
DROP POLICY IF EXISTS "profiles_select_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON profiles;

CREATE POLICY "profiles_select_policy" ON profiles
  FOR SELECT USING (
    privacy_settings = 'public' OR 
    uid() = id OR
    uid() IS NOT NULL
  );

CREATE POLICY "profiles_insert_policy" ON profiles
  FOR INSERT WITH CHECK (
    uid() = id OR
    uid() IS NOT NULL
  );

CREATE POLICY "profiles_update_policy" ON profiles
  FOR UPDATE USING (uid() = id);

-- Обновляем политики для wishlists
DROP POLICY IF EXISTS "Пользователи управляют своими спи" ON wishlists;
DROP POLICY IF EXISTS "Публичные списки видны всем" ON wishlists;

CREATE POLICY "wishlists_all_policy" ON wishlists
  FOR ALL USING (uid() = user_id);

CREATE POLICY "wishlists_select_policy" ON wishlists
  FOR SELECT USING (
    (is_public = true) OR 
    (uid() IS NOT NULL AND uid() = user_id)
  );

-- Обновляем политики для wishlist_items
DROP POLICY IF EXISTS "Владельцы списков управляют товар" ON wishlist_items;
DROP POLICY IF EXISTS "Товары видны если список доступен" ON wishlist_items;

CREATE POLICY "wishlist_items_all_policy" ON wishlist_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM wishlists 
      WHERE wishlists.id = wishlist_items.wishlist_id 
      AND uid() = wishlists.user_id
    )
  );

CREATE POLICY "wishlist_items_select_policy" ON wishlist_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM wishlists 
      WHERE wishlists.id = wishlist_items.wishlist_id 
      AND (
        wishlists.is_public = true OR 
        (uid() IS NOT NULL AND wishlists.user_id = uid())
      )
    )
  );

-- Обновляем политики для campaigns
DROP POLICY IF EXISTS "Владельцы товаров управляют кампа" ON campaigns;
DROP POLICY IF EXISTS "Кампании видны если товар доступе" ON campaigns;

CREATE POLICY "campaigns_all_policy" ON campaigns
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM wishlist_items wi
      JOIN wishlists w ON w.id = wi.wishlist_id
      WHERE wi.id = campaigns.wishlist_item_id 
      AND uid() = w.user_id
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
        (uid() IS NOT NULL AND w.user_id = uid())
      )
    )
  );

-- Обновляем политики для donations
DROP POLICY IF EXISTS "Авторизованные пользователи могу" ON donations;
DROP POLICY IF EXISTS "Пожертвования видны участникам" ON donations;

CREATE POLICY "donations_insert_policy" ON donations
  FOR INSERT WITH CHECK (uid() = user_id);

CREATE POLICY "donations_select_policy" ON donations
  FOR SELECT USING (
    (uid() IS NOT NULL AND uid() = user_id) OR
    (EXISTS (
      SELECT 1 FROM campaigns c
      JOIN wishlist_items wi ON wi.id = c.wishlist_item_id
      JOIN wishlists w ON w.id = wi.wishlist_id
      WHERE c.id = donations.campaign_id 
      AND uid() = w.user_id
    ))
  );

-- Обновляем политики для ai_recommendations
DROP POLICY IF EXISTS "Пользователи видят свои рекоменда" ON ai_recommendations;
DROP POLICY IF EXISTS "Пользователи управляют своими рек" ON ai_recommendations;

CREATE POLICY "ai_recommendations_select_policy" ON ai_recommendations
  FOR SELECT USING (uid() = user_id);

CREATE POLICY "ai_recommendations_all_policy" ON ai_recommendations
  FOR ALL USING (uid() = user_id);

-- Обновляем политики для user_interests
DROP POLICY IF EXISTS "Пользователи управляют своими инт" ON user_interests;

CREATE POLICY "user_interests_all_policy" ON user_interests
  FOR ALL USING (uid() = user_id);

-- Обновляем политики для product_views
DROP POLICY IF EXISTS "Пользователи видят свои просмотры" ON product_views;
DROP POLICY IF EXISTS "Пользователи могут записывать сво" ON product_views;

CREATE POLICY "product_views_select_policy" ON product_views
  FOR SELECT USING (uid() = user_id);

CREATE POLICY "product_views_insert_policy" ON product_views
  FOR INSERT WITH CHECK (uid() = user_id);

-- Обновляем политики для product_recommendations
DROP POLICY IF EXISTS "Пользователи видят свои рекоменда" ON product_recommendations;
DROP POLICY IF EXISTS "Пользователи могут управлять свои" ON product_recommendations;

CREATE POLICY "product_recommendations_select_policy" ON product_recommendations
  FOR SELECT USING (uid() = user_id);

CREATE POLICY "product_recommendations_all_policy" ON product_recommendations
  FOR ALL USING (uid() = user_id);

-- Обновляем политики для friendships
DROP POLICY IF EXISTS "Пользователи видят свои дружеские" ON friendships;
DROP POLICY IF EXISTS "Пользователи могут создавать друж" ON friendships;
DROP POLICY IF EXISTS "Пользователи могут удалять свои д" ON friendships;

CREATE POLICY "friendships_select_policy" ON friendships
  FOR SELECT USING (uid() = user_id OR uid() = friend_id);

CREATE POLICY "friendships_insert_policy" ON friendships
  FOR INSERT WITH CHECK (uid() = user_id);

CREATE POLICY "friendships_delete_policy" ON friendships
  FOR DELETE USING (uid() = user_id OR uid() = friend_id);

-- Обновляем политики для friend_requests
DROP POLICY IF EXISTS "Пользователи видят свои запросы н" ON friend_requests;
DROP POLICY IF EXISTS "Пользователи могут обновлять запр" ON friend_requests;
DROP POLICY IF EXISTS "Пользователи могут отправлять зап" ON friend_requests;
DROP POLICY IF EXISTS "Пользователи могут удалять свои з" ON friend_requests;

CREATE POLICY "friend_requests_select_policy" ON friend_requests
  FOR SELECT USING (uid() = sender_id OR uid() = receiver_id);

CREATE POLICY "friend_requests_insert_policy" ON friend_requests
  FOR INSERT WITH CHECK (uid() = sender_id);

CREATE POLICY "friend_requests_update_policy" ON friend_requests
  FOR UPDATE USING (uid() = receiver_id OR uid() = sender_id);

CREATE POLICY "friend_requests_delete_policy" ON friend_requests
  FOR DELETE USING (uid() = sender_id OR uid() = receiver_id);

-- Добавляем индексы для оптимизации
CREATE INDEX IF NOT EXISTS profiles_email_idx ON profiles(email);
CREATE INDEX IF NOT EXISTS profiles_username_idx ON profiles(username);
CREATE INDEX IF NOT EXISTS profiles_privacy_settings_idx ON profiles(privacy_settings);

-- Функция для автоматического создания профиля при регистрации
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