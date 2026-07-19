---
name: admin-dashboard-principles
description: Panduan wajib untuk proyek Admin Dashboard, meliputi pemahaman layouting komponen, logika alur data, dan standar debugging deskriptif.
---

# Prinsip Dasar Admin Dashboard

Ketika mengerjakan proyek web ini, Anda (Agent AI) WAJIB mematuhi 3 aturan dasar berikut:

## 1. Pemahaman Komponen & Layout (Struktur)
- Gunakan Tailwind CSS (Flexbox, Grid) sebagai pilar utama layouting.
- Pecah tampilan UI menjadi komponen-komponen kecil dan logis (misalnya: pisahkan bagian Sidebar, Navbar, dan Main Content). Jangan mencampur semua elemen dalam satu wadah besar tanpa hierarki yang jelas.

## 2. Logika Alur Data (Data Flow)
- Pahami dengan jelas siklus perpindahan data.
- Ketika ada interaksi (misal: tombol "Simpan" diklik), Anda harus tahu ke mana data input tersebut diarahkan dan bagaimana cara menyimpannya (apakah disimpan sementara di LocalStorage browser atau dikirim via API seperti Google Sheets).
- Berikan komentar atau penjelasan mengenai alur ini di dalam kode.

## 3. Debugging/Troubleshooting secara Deskriptif
- Jangan panik saat program mengalami error.
- WAJIB menyalin pesan error secara utuh dari terminal/console ke dalam prompt atau log.
- Jelaskan kronologi kejadian secara rinci dan deskriptif kepada pengguna atau agen lain (misal: "Error ini muncul tepat setelah saya klik tombol A"). Jangan sekadar memberikan kode perbaikan tanpa penjelasan konteks.
