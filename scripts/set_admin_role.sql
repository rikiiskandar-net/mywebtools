-- SKRIP SQL UNTUK MENGINJEKSI ROLE ADMIN KE DALAM JWT (app_metadata)
-- Panduan Eksekusi:
-- 1. Buka Dasbor Supabase Anda (https://supabase.com/dashboard)
-- 2. Masuk ke menu "SQL Editor" di bilah navigasi kiri
-- 3. Klik "New Query"
-- 4. Copy-Paste seluruh skrip ini ke dalam editor
-- 5. Ubah 'admin@example.com' menjadi alamat email akun Anda yang sebenarnya
-- 6. Klik tombol "Run" di kanan bawah

UPDATE auth.users 
SET raw_app_meta_data = raw_app_meta_data || '{"role": "admin"}' 
WHERE email = 'admin@example.com';

-- Untuk memverifikasi apakah role berhasil disuntikkan, Anda bisa menjalankan query ini:
-- SELECT email, raw_app_meta_data FROM auth.users WHERE email = 'admin@example.com';
