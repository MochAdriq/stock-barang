import { createClient } from "@supabase/supabase-js";

// Ambil kunci dari file .env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Cek keamanan (Biar Boss sadar kalau ada yang lupa disetting)
if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    "⚠️ Supabase URL atau Anon Key belum disetting di file .env!"
  );
}

// Buat koneksi
export const supabase = createClient(supabaseUrl, supabaseKey);
