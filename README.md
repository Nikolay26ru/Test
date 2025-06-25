# WishFlick - Приложение для управления списками желаний

Современное веб-приложение для создания и управления списками желаний с возможностью делиться ими с друзьями и семьей.

## 🚀 Возможности

- **Google OAuth авторизация** - безопасный вход через Google аккаунт
- **Создание списков желаний** - организуйте свои мечты в красивые списки
- **Публичные и приватные списки** - контролируйте, кто может видеть ваши желания
- **Добавление товаров** - с изображениями, ценами и приоритетами
- **Адаптивный дизайн** - отлично работает на всех устройствах
- **Система избранного** - отмечайте понравившиеся списки
- **Прогресс выполнения** - отслеживайте исполненные желания

## 🛠 Технологии

- **React 18** с TypeScript
- **Vite** для сборки
- **Tailwind CSS** для стилизации
- **Supabase** для базы данных и авторизации
- **React Router** для навигации
- **Lucide React** для иконок

## 📦 Установка и запуск

1. **Клонируйте репозиторий**
   ```bash
   git clone <repository-url>
   cd wishflick-app
   ```

2. **Установите зависимости**
   ```bash
   npm install
   ```

3. **Настройте переменные окружения**
   - Скопируйте `.env.example` в `.env`
   - Заполните данные Supabase и Google OAuth

4. **Запустите проект**
   ```bash
   npm run dev
   ```

## 🔧 Настройка Supabase

1. Создайте проект в [Supabase](https://supabase.com)
2. Получите URL проекта и Anon Key
3. Обновите `.env` файл

### SQL схема базы данных

```sql
-- Создание таблицы пользователей
create table public.users (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  name text not null,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Создание таблицы списков желаний
create table public.wishlists (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  is_public boolean default false,
  cover_image text,
  user_id uuid references public.users(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Создание таблицы товаров
create table public.wish_items (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  price decimal,
  currency text default 'RUB',
  image_url text,
  store_url text,
  priority text check (priority in ('low', 'medium', 'high')) default 'medium',
  is_purchased boolean default false,
  wishlist_id uuid references public.wishlists(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Включение RLS
alter table public.users enable row level security;
alter table public.wishlists enable row level security;
alter table public.wish_items enable row level security;

-- Политики RLS
create policy "Users can view own profile" on public.users
  for select using (auth.uid() = id);

create policy "Users can update own profile" on public.users
  for update using (auth.uid() = id);

create policy "Anyone can view public wishlists" on public.wishlists
  for select using (is_public = true or auth.uid() = user_id);

create policy "Users can manage own wishlists" on public.wishlists
  for all using (auth.uid() = user_id);

create policy "Users can view items from accessible wishlists" on public.wish_items
  for select using (
    exists (
      select 1 from public.wishlists
      where wishlists.id = wish_items.wishlist_id
      and (wishlists.is_public = true or wishlists.user_id = auth.uid())
    )
  );

create policy "Users can manage items in own wishlists" on public.wish_items
  for all using (
    exists (
      select 1 from public.wishlists
      where wishlists.id = wish_items.wishlist_id
      and wishlists.user_id = auth.uid()
    )
  );
```

## 🔐 Настройка Google OAuth

1. Перейдите в [Google Cloud Console](https://console.cloud.google.com/)
2. Создайте новый проект или выберите существующий
3. Включите Google+ API
4. Создайте учетные данные OAuth 2.0
5. Добавьте разрешенные домены:
   - `http://localhost:5173` (для разработки)
   - `https://your-netlify-domain.netlify.app` (для продакшена)
6. Добавьте redirect URIs:
   - `http://localhost:5173/auth/callback`
   - `https://your-netlify-domain.netlify.app/auth/callback`

## 🌐 Деплой на Netlify

1. **Подключите проект к Netlify**
   - Загрузите код в GitHub
   - Подключите репозиторий в Netlify

2. **Настройте переменные окружения в Netlify**
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_GOOGLE_CLIENT_ID=your_google_client_id
   VITE_APP_URL=https://your-site.netlify.app
   ```

3. **Deploy команды**
   - Build command: `npm run build`
   - Publish directory: `dist`

## 📱 Возможности для развития

- **Мобильное приложение** - React Native версия
- **Push уведомления** - напоминания о важных событиях
- **Интеграция с магазинами** - автоматическое получение цен
- **Система друзей** - добавление друзей и просмотр их списков
- **Групповые списки** - совместное создание списков
- **Экспорт списков** - в PDF или другие форматы

## 📄 Лицензия

MIT License - подробности в файле LICENSE

## 🤝 Поддержка

Если у вас есть вопросы или предложения, создайте issue в репозитории.