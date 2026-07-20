import { supabase } from './supabaseClient';
import { handleRoute } from './router';

// Inisiasi Logika Form Login dipanggil satu kali oleh main.js
export function initAuthFlow() {
  const loginForm = document.getElementById('loginForm');
  const loginBtn = document.getElementById('loginBtn');
  const loginSpinner = document.getElementById('loginSpinner');
  const loginAlert = document.getElementById('loginAlert');
  const loginAlertMessage = document.getElementById('loginAlertMessage');

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('emailInput').value;
      const password = document.getElementById('passwordInput').value;

      loginAlert.classList.add('hidden');
      loginBtn.disabled = true;
      loginSpinner.classList.remove('hidden');

      try {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        
        // Login berhasil, router urus sisanya dengan mengubah hash ke dashboard
        window.location.hash = '#dashboard';
      } catch (err) {
        console.error("Login gagal:", err);
        loginAlertMessage.textContent = err.message || "Gagal masuk.";
        loginAlert.classList.remove('hidden');
      } finally {
        loginBtn.disabled = false;
        loginSpinner.classList.add('hidden');
      }
    });
  }
  
  // Inisiasi tombol Logout Global
  const btnGlobalLogout = document.getElementById('btnGlobalLogout');
  if(btnGlobalLogout){
    btnGlobalLogout.addEventListener('click', async () => {
      try {
        await supabase.auth.signOut();
        // Trigger perubahan hash agar view beralih ke login
        window.location.hash = '#login'; 
      } catch(err) {
        alert("Gagal logout: " + err.message);
      }
    });
  }
}

// Fungsi bantu untuk mengubah nama dan avatar di Header
export function updateHeaderProfile(user) {
  const headerName = document.getElementById('headerUserName');
  const headerAvatar = document.getElementById('headerUserAvatar');
  const headerAvatarLarge = document.getElementById('headerUserAvatarLarge');
  
  if(user && headerName) {
    const name = user.user_metadata?.full_name || 'Admin User';
    headerName.textContent = name;
    
    const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1e1e1e&color=fff`;
    if(headerAvatar) headerAvatar.src = avatarUrl;
    if(headerAvatarLarge) headerAvatarLarge.src = avatarUrl;
  }
}

// Hanya mengembalikan boolean status sesi, tapi sekalian update header
export async function checkSession() {
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    updateHeaderProfile(session.user);
    return true;
  }
  return false;
}
