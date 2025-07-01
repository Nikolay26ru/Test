import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  global: {
    headers: {
      'x-client-info': 'wishflick-app@1.0.0'
    }
  }
})

// Проверяем подключение при инициализации
supabase.auth.getSession().then(({ error }) => {
  if (error) {
    console.warn('⚠️ Supabase connection issue:', error.message);
  } else {
    console.log('✅ Supabase connected successfully');
  }
}).catch((error) => {
  console.error('❌ Failed to connect to Supabase:', error);
});