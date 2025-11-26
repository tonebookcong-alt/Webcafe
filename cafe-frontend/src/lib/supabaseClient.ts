// src/lib/supabaseClient.ts

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase URL or Anon Key');
}

// Cấu hình tùy chỉnh cho việc lưu trữ session
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Sử dụng localStorage nhưng với khóa (key) tùy chỉnh để tránh xung đột
    storageKey: 'supabase.auth.token',
    // Tự động làm mới token
    autoRefreshToken: true,
    // Duy trì session kể cả khi đóng tab
    persistSession: true,
    // Quan trọng: Phát hiện session trong URL (dùng cho OAuth/Magic Link)
    detectSessionInUrl: true,
    // Cấu hình storage tùy chỉnh (nếu cần, nhưng thử mặc định trước)
    // storage: window.localStorage,
  },
});