/*
  # Простое исправление таблицы profiles

  1. Создание таблицы profiles с минимальными требованиями
  2. Простые политики RLS
  3. Без сложных триггеров и функций
*/

-- Создаем таблицу profiles если её нет
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY,
  email text,
  name text NOT NULL,
  avatar_url text,
  username text,
  bio text,
  privacy_settings text DEFAULT 'public',
  is_guest boolean DEFAULT false,
  interests text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Добавляем уникальный индекс для username если его нет
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'profiles' AND indexname = 'profiles_username_key'
  ) THEN
    CREATE UNIQUE INDEX profiles_username_key ON profiles(username);
  END IF;
END $$;

-- Добавляем foreign key constraint если его нет
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

-- Включаем RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Удаляем старые политики
DROP POLICY IF EXISTS "Публичные профили видны всем" ON profiles;
DROP POLICY IF EXISTS "Пользователи могут обновлять свой профиль" ON profiles;
DROP POLICY IF EXISTS "Пользователи могут создавать профиль" ON profiles;

-- Создаем простые политики
CREATE POLICY "profiles_select_policy" ON profiles
  FOR SELECT USING (
    privacy_settings = 'public' OR 
    auth.uid() = id
  );

CREATE POLICY "profiles_insert_policy" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_policy" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Создаем простую функцию для обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Создаем триггер для updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at 
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();