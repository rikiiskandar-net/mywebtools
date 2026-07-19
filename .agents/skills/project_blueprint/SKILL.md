---
name: project-blueprint
description: Cetak biru pengembangan proyek dan panduan kendali AI Agent menggunakan stack Github, Supabase, Tailwind, dan Vercel.
---

# CETAK BIRU PENGEMBANGAN PROYEK & PANDUAN KENDALI AI AGENT
**(STACK: GITHUB + SUPABASE + TAILWIND + VERCEL)**

## BAGIAN 1: MODAL SKILL UTAMA PENGEMBANG (MANAJEMEN LOGIKA SISTEM)

Sebagai agen AI yang berkolaborasi di proyek ini, saya memegang teguh 3 pilar logika berikut:

**1. PEMAHAMAN KOMPONEN & LAYOUT (STRUKTUR)**
- Jangan melihat web sebagai satu halaman utuh yang rumit. Pecah tampilan menjadi kotak-kotak komponen kecil yang modular.
- Gunakan konsep dasar Flexbox dan Grid pada Tailwind CSS untuk mengatur posisi elemen dengan presisi.
- Pisahkan logika file visual (Sidebar, Navbar, Main Content) agar kode tidak menumpuk di satu tempat.

**2. LOGIKA ALUR DATA & DATABASE (SUPABASE INTEGRATION)**
- Pahami konsep dasar tabel database relasional untuk Supabase (tabel user, transaksi, logs).
- Petakan perjalanan data secara kronologis sebelum menulis kode: `[Aksi User] -> [Fungsi JS] -> [Supabase API] -> [Database]`.
- Selalu pastikan alur data dan struktur tabel jelas sebelum merakit fungsi CRUD Supabase.

**3. GIT WORKFLOW & DEPLOYMENT MANAGEMENT (GITHUB + VERCEL)**
- Bekerja menggunakan branching yang rapi di GitHub.
- Pahami bahwa `git push` akan memicu Vercel untuk melakukan build dan deployment otomatis.
- Jika terjadi build error, biasakan meminta atau menyalin log error utuh dari dashboard Vercel untuk dianalisis.

## BAGIAN 2: PROMPT JANGKAR PEMBUKA PROYEK

Jika pengguna memulai sesi dengan *prompt* jangkar proyek, agen WAJIB mematuhi instruksi berikut:
- **Teknologi Utama**: HTML5, Tailwind CSS (utility-first), Vanilla JavaScript (ES6+), Supabase (Auth & DB), GitHub, Vercel.
- **Batasan**:
  1. JANGAN menulis kode aplikasi utuh dalam satu waktu sebelum arsitektur disepakati.
  2. JANGAN membuat file monolitik. Gunakan pendekatan modular.
  3. Lakukan analisis awal (MVP, Skema DB Supabase, Struktur Folder Vercel-ready, dan Roadmap).
  4. Jelaskan logika di balik kode dan berikan komentar penjelasan, terutama pada inisialisasi Supabase dan `.env`.
