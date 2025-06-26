/*
  # Система социальной сети

  1. Новые таблицы
    - `friendships` - дружеские связи между пользователями
    - `friend_requests` - запросы на добавление в друзья
    - `product_views` - история просмотров товаров
    - `product_recommendations` - персональные рекомендации товаров

  2. Безопасность
    - RLS политики для всех таблиц
    - Валидация данных

  3. Индексы
    - Оптимизация для быстрых запросов
*/

-- Таблица дружеских связей
CREATE TABLE IF NOT EXISTS friendships (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  friend_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, friend_id),
  CHECK (user_id != friend_id)
);

-- Таблица запросов на добавление в друзья
CREATE TABLE IF NOT EXISTS friend_requests (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  receiver_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(sender_id, receiver_id),
  CHECK (sender_id != receiver_id)
);

-- Таблица истории просмотров товаров
CREATE TABLE IF NOT EXISTS product_views (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  wishlist_item_id uuid REFERENCES wishlist_items(id) ON DELETE CASCADE NOT NULL,
  viewed_at timestamptz DEFAULT now()
);

-- Таблица рекомендаций товаров
CREATE TABLE IF NOT EXISTS product_recommendations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  recommended_items jsonb NOT NULL,
  view_count integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + interval '24 hours')
);

-- Создаем индексы
CREATE INDEX IF NOT EXISTS friendships_user_id_idx ON friendships(user_id);
CREATE INDEX IF NOT EXISTS friendships_friend_id_idx ON friendships(friend_id);
CREATE INDEX IF NOT EXISTS friend_requests_sender_id_idx ON friend_requests(sender_id);
CREATE INDEX IF NOT EXISTS friend_requests_receiver_id_idx ON friend_requests(receiver_id);
CREATE INDEX IF NOT EXISTS friend_requests_status_idx ON friend_requests(status);
CREATE INDEX IF NOT EXISTS product_views_user_id_idx ON product_views(user_id);
CREATE INDEX IF NOT EXISTS product_views_item_id_idx ON product_views(wishlist_item_id);
CREATE INDEX IF NOT EXISTS product_views_viewed_at_idx ON product_views(viewed_at);
CREATE INDEX IF NOT EXISTS product_recommendations_user_id_idx ON product_recommendations(user_id);
CREATE INDEX IF NOT EXISTS product_recommendations_expires_at_idx ON product_recommendations(expires_at);

-- Включаем RLS
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE friend_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_recommendations ENABLE ROW LEVEL SECURITY;

-- Политики для friendships
CREATE POLICY "Пользователи видят свои дружеские связи" ON friendships
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "Пользователи могут создавать дружеские связи" ON friendships
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Пользователи могут удалять свои дружеские связи" ON friendships
  FOR DELETE USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- Политики для friend_requests
CREATE POLICY "Пользователи видят свои запросы на дружбу" ON friend_requests
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Пользователи могут отправлять запросы на дружбу" ON friend_requests
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Пользователи могут обновлять запросы на дружбу" ON friend_requests
  FOR UPDATE USING (auth.uid() = receiver_id OR auth.uid() = sender_id);

CREATE POLICY "Пользователи могут удалять свои запросы на дружбу" ON friend_requests
  FOR DELETE USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Политики для product_views
CREATE POLICY "Пользователи видят свои просмотры" ON product_views
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Пользователи могут записывать свои просмотры" ON product_views
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Политики для product_recommendations
CREATE POLICY "Пользователи видят свои рекомендации" ON product_recommendations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Пользователи могут управлять своими рекомендациями" ON product_recommendations
  FOR ALL USING (auth.uid() = user_id);

-- Триггер для обновления updated_at в friend_requests
DROP TRIGGER IF EXISTS update_friend_requests_updated_at ON friend_requests;
CREATE TRIGGER update_friend_requests_updated_at 
  BEFORE UPDATE ON friend_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Функция для создания взаимной дружбы
CREATE OR REPLACE FUNCTION create_mutual_friendship(user1_id uuid, user2_id uuid)
RETURNS void AS $$
BEGIN
  -- Создаем дружбу в обе стороны
  INSERT INTO friendships (user_id, friend_id) 
  VALUES (user1_id, user2_id), (user2_id, user1_id)
  ON CONFLICT (user_id, friend_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Функция для удаления взаимной дружбы
CREATE OR REPLACE FUNCTION remove_mutual_friendship(user1_id uuid, user2_id uuid)
RETURNS void AS $$
BEGIN
  -- Удаляем дружбу в обе стороны
  DELETE FROM friendships 
  WHERE (user_id = user1_id AND friend_id = user2_id) 
     OR (user_id = user2_id AND friend_id = user1_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;