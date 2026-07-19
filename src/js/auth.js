import '../style.css';
import { supabase } from './supabaseClient';

// KOMENTAR ALUR DATA (AUTH):
// [Aksi User: Submit Login] -> [auth.signInWithPassword()] -> [Supabase API] -> [Session Dibuat] -> [Redirect ke index.html]

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const loginBtn = document.getElementById('loginBtn');
  const loginSpinner = document.getElementById('loginSpinner');
  const loginAlert = document.getElementById('loginAlert');
  const loginAlertMessage = document.getElementById('loginAlertMessage');

  // Hanya jalankan logika form jika berada di halaman login
  if (loginForm) {
    // Pengecekan sesi awal: Jika sudah login, lempar ke dashboard
    checkSession();

    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const email = document.getElementById('emailInput').value;
      const password = document.getElementById('passwordInput').value;

      // Reset UI state
      loginAlert.classList.add('hidden');
      loginBtn.disabled = true;
      loginSpinner.classList.remove('hidden');

      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email,
          password: password,
        });

        if (error) throw error;

        // Login sukses, redirect ke dashboard
        window.location.href = 'index.html';
      } catch (err) {
        console.error("Login gagal:", err);
        // Tampilkan pesan error deskriptif (Aturan 3)
        loginAlertMessage.textContent = err.message || "Gagal masuk. Periksa kembali kredensial Anda.";
        loginAlert.classList.remove('hidden');
      } finally {
        // Kembalikan UI
        loginBtn.disabled = false;
        loginSpinner.classList.add('hidden');
      }
    });
  }
});

// Fungsi utilitas untuk memeriksa sesi aktif di halaman Login
async function checkSession() {
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    // Jika sudah ada sesi, tidak perlu login lagi
    window.location.href = 'index.html';
  }
}

// Fungsi global untuk proteksi halaman (Route Guard)
export async function requireAuth() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    // Jika tidak ada sesi, paksa ke login
    window.location.href = 'login.html';
    return null;
  }
  return session;
}

// Fungsi global untuk logout
export async function logoutUser() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    // Berhasil logout, kembali ke halaman login
    window.location.href = 'login.html';
  } catch (err) {
    console.error("Logout error:", err);
    alert(`Gagal logout: ${err.message}`);
  }
}

// Attach logout global ke window agar bisa dipanggil dari atribut onclick di HTML
window.logoutUser = logoutUser;
