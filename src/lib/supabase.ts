import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

console.log('🔧 Supabase: Initializing client', {
  url: supabaseUrl ? '✅ URL configured' : '❌ URL missing',
  key: supabaseAnonKey ? '✅ Key configured' : '❌ Key missing'
});

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase: Missing environment variables!');
  console.error('Please check your .env file and ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  }
})

// Добавляем глобальный доступ для отладки
if (typeof window !== 'undefined') {
  (window as any).supabase = supabase;
  console.log('🔧 Supabase: Client available globally as window.supabase');
}