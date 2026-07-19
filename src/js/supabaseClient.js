import { createClient } from '@supabase/supabase-js';

// Mengambil variabel environment dari Vite (harus diawali dengan VITE_)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("⚠️ Variabel environment Supabase belum diatur. Pastikan .env sudah terisi.");
}

// Inisialisasi client Supabase
export const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseAnonKey || 'placeholder-key');
