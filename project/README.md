# WishFlick — Гибридная платформа списков желаний и социальная сеть

## 🌟 Обзор

**WishFlick** — это современная веб-платформа, объединяющая функции списков желаний (wishlist), социальные взаимодействия (профили, лента активности, лайки, комментарии) и краудфандинг подарков. Она позволяет пользователям создавать и делиться списками желаний, а также совместно финансировать подарки для друзей и близких.

## 🚀 Технологический стек

- **Фронтенд:** React 18 + TypeScript (с использованием Vite)
- **Стилизация:** Tailwind CSS
- **Иконки:** Lucide React
- **Бэкенд:** Supabase (PostgreSQL, Аутентификация, Edge Functions)
- **База данных:** PostgreSQL (через Supabase)
- **Аутентификация:** Email/пароль, OAuth (Google, VK, Яндекс) через Supabase Auth
- **Платежи:** ЮKassa (основной), Stripe (альтернативный)
- **Развертывание:** Netlify (фронтенд), Supabase (бэкенд и БД)

## 📱 Системные требования

### Минимальные требования для разработки:
- **Node.js:** версия 18.0 или выше
- **npm:** версия 8.0 или выше (или yarn/pnpm)
- **Браузер:** Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **ОС:** Windows 10+, macOS 10.15+, Ubuntu 18.04+
- **RAM:** минимум 4 ГБ (рекомендуется 8 ГБ)
- **Свободное место:** минимум 1 ГБ

### Поддерживаемые устройства:
- **Десктоп:** Windows, macOS, Linux
- **Мобильные:** iOS 12+, Android 8+ (через браузер)
- **Планшеты:** iPad OS 13+, Android tablets

## 🛠️ Установка и запуск проекта

### 1. Клонирование репозитория

```bash
# Клонируйте репозиторий
git clone https://github.com/your-username/wishflick.git

# Перейдите в директорию проекта
cd wishflick
```

### 2. Установка зависимостей

```bash
# Установка через npm
npm install

# Или через yarn
yarn install

# Или через pnpm
pnpm install
```

### 3. Настройка переменных окружения

Создайте файл `.env` в корне проекта:

```bash
# Скопируйте пример файла окружения
cp .env.example .env
```

Заполните `.env` файл:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Payment Systems (для production)
VITE_YUKASSA_SHOP_ID=your_yukassa_shop_id
VITE_YUKASSA_SECRET_KEY=your_yukassa_secret_key
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key

# App Configuration
VITE_APP_URL=http://localhost:5173
VITE_API_URL=http://localhost:5173/api
```

### 4. Запуск в режиме разработки

```bash
# Запуск dev-сервера
npm run dev

# Или
yarn dev

# Или
pnpm dev
```

Приложение будет доступно по адресу: `http://localhost:5173`

### 5. Сборка для production

```bash
# Сборка проекта
npm run build

# Предварительный просмотр сборки
npm run preview
```

## 🖥️ Запуск на различных устройствах

### Windows

#### Через Command Prompt:
```cmd
# Установка Node.js (если не установлен)
# Скачайте с https://nodejs.org/

# Клонирование и запуск
git clone https://github.com/your-username/wishflick.git
cd wishflick
npm install
npm run dev
```

#### Через PowerShell:
```powershell
# Те же команды, что и в CMD
# Убедитесь, что ExecutionPolicy позволяет запуск скриптов:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

#### Через WSL (Windows Subsystem for Linux):
```bash
# В WSL терминале
sudo apt update
sudo apt install nodejs npm git
git clone https://github.com/your-username/wishflick.git
cd wishflick
npm install
npm run dev
```

### macOS

#### Через Terminal:
```bash
# Установка Homebrew (если не установлен)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Установка Node.js
brew install node

# Клонирование и запуск
git clone https://github.com/your-username/wishflick.git
cd wishflick
npm install
npm run dev
```

#### Через iTerm2:
```bash
# Те же команды, что и в Terminal
# iTerm2 предоставляет расширенные возможности терминала
```

### Linux (Ubuntu/Debian)

```bash
# Обновление пакетов
sudo apt update

# Установка Node.js и npm
sudo apt install nodejs npm git

# Проверка версий
node --version
npm --version

# Клонирование и запуск
git clone https://github.com/your-username/wishflick.git
cd wishflick
npm install
npm run dev
```

### Linux (CentOS/RHEL/Fedora)

```bash
# Для CentOS/RHEL
sudo yum install nodejs npm git

# Для Fedora
sudo dnf install nodejs npm git

# Клонирование и запуск
git clone https://github.com/your-username/wishflick.git
cd wishflick
npm install
npm run dev
```

### Arch Linux

```bash
# Установка через pacman
sudo pacman -S nodejs npm git

# Клонирование и запуск
git clone https://github.com/your-username/wishflick.git
cd wishflick
npm install
npm run dev
```

## 📱 Доступ с мобильных устройств

### Локальная разработка:

1. **Найдите IP-адрес вашего компьютера:**

```bash
# Windows
ipconfig

# macOS/Linux
ifconfig
# или
ip addr show
```

2. **Запустите dev-сервер с доступом по сети:**

```bash
# Vite автоматически делает сервер доступным по сети
npm run dev

# Или явно указать хост
npm run dev -- --host 0.0.0.0
```

3. **Откройте в мобильном браузере:**
   - Перейдите по адресу: `http://YOUR_IP_ADDRESS:5173`
   - Например: `http://192.168.1.100:5173`

### Тестирование на мобильных устройствах:

#### iOS (iPhone/iPad):
- Откройте Safari
- Введите IP-адрес вашего dev-сервера
- Добавьте на главный экран для удобства

#### Android:
- Откройте Chrome или другой браузер
- Введите IP-адрес вашего dev-сервера
- Используйте Chrome DevTools для отладки

## 🐳 Запуск через Docker

### Создание Dockerfile:

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
```

### Docker Compose:

```yaml
# docker-compose.yml
version: '3.8'

services:
  wishflick:
    build: .
    ports:
      - "5173:5173"
    volumes:
      - .:/app
      - /app/node_modules
    environment:
      - VITE_SUPABASE_URL=${VITE_SUPABASE_URL}
      - VITE_SUPABASE_ANON_KEY=${VITE_SUPABASE_ANON_KEY}
```

### Запуск:

```bash
# Сборка и запуск
docker-compose up --build

# Или через Docker
docker build -t wishflick .
docker run -p 5173:5173 wishflick
```

## 🔧 Настройка IDE и инструментов разработки

### Visual Studio Code

Рекомендуемые расширения:

```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-vscode.vscode-typescript-next",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense"
  ]
}
```

### WebStorm/IntelliJ IDEA

1. Откройте проект
2. Настройте Node.js интерпретатор
3. Включите поддержку TypeScript
4. Настройте Prettier и ESLint

## 🔐 Требования к кибербезопасности

Проект разработан с учетом следующих принципов безопасности:

- **OAuth 2.0 / OpenID Connect:** Для безопасной авторизации через социальные сети
- **JWT + refresh tokens:** Для управления безопасными сессиями
- **HTTPS-only:** Весь трафик шифруется с использованием TLS 1.3
- **Валидация и очистка ввода:** Для защиты от XSS и SQL-инъекций
- **Rate limiting и защита от brute-force:** Настроены для входа и чувствительных API
- **Хэширование паролей:** Пароли хранятся в базе данных в хэшированном виде
- **CSRF защита:** Для всех POST-запросов
- **CORS:** Настроен по whitelisting-доменам
- **Заголовки безопасности:** Включая Content-Security-Policy, X-Frame-Options, HSTS
- **Соответствие ФЗ-152:** Требования к персональным данным в РФ
- **GDPR-compliance:** Для международной аудитории
- **Логирование событий безопасности:** Отслеживание входов, попыток взлома
- **PCI-DSS совместимость:** Для платежных систем (ЮKassa, Stripe)

## 🎨 UI/UX Руководство

### Цветовая палитра:
- **Primary:** `#B48DFE` (основной фиолетовый)
- **Accent:** `#6A49C8` (акцентный фиолетовый)
- **Secondary:** `#98E2D5` (мятный)
- **Neutral:** Оттенки серого от 50 до 900

### Принципы дизайна:
- **Mobile-first:** Адаптивный дизайн с приоритетом мобильных устройств
- **Минимализм:** Чистый и современный интерфейс
- **Микроанимации:** Плавные переходы и hover-эффекты
- **Доступность:** Соответствие WCAG 2.1 AA

## 🧩 Основные функции (MVP)

### Реализованные функции:
- ✅ **Профиль пользователя:** Отображение информации, статистики
- ✅ **Вишлисты:** Создание и просмотр списков желаний
- ✅ **Краудфандинг:** Отображение прогресса сбора средств
- ✅ **Социальные функции:** Лайки, комментарии, лента активности
- ✅ **Адаптивный дизайн:** Поддержка всех размеров экранов

### В разработке:
- 🔄 **Аутентификация:** Интеграция с Supabase Auth
- 🔄 **Платежи:** Интеграция с ЮKassa/Stripe
- 🔄 **База данных:** Миграция с mock-данных на Supabase
- 🔄 **Push-уведомления:** Уведомления о взносах и достижениях

## 🗄️ Схема базы данных (PostgreSQL)

### Основные таблицы:

```sql
-- Пользователи
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  avatar TEXT,
  bio TEXT,
  followers INTEGER DEFAULT 0,
  following INTEGER DEFAULT 0,
  privacy_level VARCHAR(50) DEFAULT 'public',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Вишлисты
CREATE TABLE wishlists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Подарки/желания
CREATE TABLE gift_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wishlist_id UUID REFERENCES wishlists(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  current_amount DECIMAL(10,2) DEFAULT 0,
  goal_amount DECIMAL(10,2) NOT NULL,
  image_url TEXT,
  link TEXT,
  category VARCHAR(100),
  tags TEXT[],
  is_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Взносы
CREATE TABLE contributions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  gift_item_id UUID REFERENCES gift_items(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  payment_id VARCHAR(255),
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Комментарии
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  wishlist_id UUID REFERENCES wishlists(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  likes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Лог активности
CREATE TABLE activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(100) NOT NULL,
  target_id UUID,
  data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🚀 Переход от моковых данных к реальному развертыванию

### Шаги по настройке бэкенда с Supabase:

#### 1. Создание проекта Supabase:
- Перейдите на [supabase.com](https://supabase.com/)
- Создайте новый проект
- Сохраните `Project URL` и `anon public key`

#### 2. Настройка переменных окружения:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

#### 3. Установка клиента Supabase:
```bash
npm install @supabase/supabase-js
```

#### 4. Инициализация клиента:
```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

### Привязка аутентификации (Supabase Auth):

#### Настройка провайдеров:
```typescript
// Регистрация по email
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123',
})

// Вход по email
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123',
})

// OAuth (Google, VK, Яндекс)
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: 'http://localhost:5173/welcome',
  },
})
```

### Привязка платежей (ЮKassa):

#### 1. Настройка ЮKassa:
- Зарегистрируйтесь на [yookassa.ru](https://yookassa.ru/)
- Получите `shopId` и `secretKey`
- Настройте webhook URL

#### 2. Создание платежа:
```typescript
// Supabase Edge Function
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

serve(async (req) => {
  const { amount, description, userId, giftId } = await req.json()
  
  const payment = await fetch('https://api.yookassa.ru/v3/payments', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${btoa(`${shopId}:${secretKey}`)}`,
      'Content-Type': 'application/json',
      'Idempotence-Key': crypto.randomUUID(),
    },
    body: JSON.stringify({
      amount: {
        value: amount,
        currency: 'RUB'
      },
      confirmation: {
        type: 'redirect',
        return_url: `${origin}/success`
      },
      description,
      metadata: {
        userId,
        giftId
      }
    })
  })
  
  const paymentData = await payment.json()
  return new Response(JSON.stringify(paymentData))
})
```

#### 3. Обработка webhook:
```typescript
// Webhook для обновления статуса платежа
serve(async (req) => {
  const event = await req.json()
  
  if (event.event === 'payment.succeeded') {
    const { userId, giftId } = event.object.metadata
    const amount = parseFloat(event.object.amount.value)
    
    // Обновляем базу данных
    await supabase
      .from('contributions')
      .insert({
        user_id: userId,
        gift_item_id: giftId,
        amount,
        payment_id: event.object.id,
        status: 'completed'
      })
    
    // Обновляем текущую сумму подарка
    await supabase.rpc('update_gift_amount', {
      gift_id: giftId,
      contribution_amount: amount
    })
  }
  
  return new Response('OK')
})
```

## 🌐 Развертывание проекта

### Фронтенд (Netlify):

1. **Подключение репозитория:**
   - Войдите в [netlify.com](https://netlify.com/)
   - Подключите GitHub репозиторий
   - Настройте команду сборки: `npm run build`
   - Директория публикации: `dist`

2. **Настройка переменных окружения:**
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_YUKASSA_SHOP_ID=your_yukassa_shop_id
   ```

3. **Настройка редиректов:**
   ```
   # netlify.toml
   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

### Бэкенд (Supabase):

1. **Развертывание Edge Functions:**
   ```bash
   # Установка Supabase CLI
   npm install -g supabase

   # Логин
   supabase login

   # Развертывание функций
   supabase functions deploy
   ```

2. **Настройка переменных окружения в Supabase:**
   - Перейдите в Settings → API
   - Добавьте секретные ключи платежных систем

## 🧪 Тестирование

### Запуск тестов:
```bash
# Unit тесты
npm run test

# E2E тесты
npm run test:e2e

# Тесты с покрытием
npm run test:coverage
```

### Тестирование на устройствах:
```bash
# Запуск с доступом по сети
npm run dev -- --host 0.0.0.0

# Тестирование производительности
npm run lighthouse
```

## 📊 Мониторинг и аналитика

### Настройка мониторинга:
- **Sentry:** Отслеживание ошибок
- **Google Analytics:** Аналитика пользователей
- **Supabase Analytics:** Мониторинг базы данных
- **Netlify Analytics:** Статистика сайта

