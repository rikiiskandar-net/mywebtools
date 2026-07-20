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
        // Tidak perlu redirect manual di sini, onAuthStateChange SIGNED_IN akan mengurusnya
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

  // 1.5 Logika Form Register
  const registerForm = document.getElementById('registerForm');
  const registerBtn = document.getElementById('registerBtn');
  const registerSpinner = document.getElementById('registerSpinner');
  const registerAlert = document.getElementById('registerAlert');
  const registerAlertMessage = document.getElementById('registerAlertMessage');
  const registerSuccessAlert = document.getElementById('registerSuccessAlert');
  const registerSuccessMessage = document.getElementById('registerSuccessMessage');

  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('regNameInput').value;
      const email = document.getElementById('regEmailInput').value;
      const password = document.getElementById('regPasswordInput').value;

      registerAlert.classList.add('hidden');
      registerSuccessAlert.classList.add('hidden');
      registerBtn.disabled = true;
      registerSpinner.classList.remove('hidden');

      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name,
              role: 'user'
            }
          }
        });
        
        if (error) throw error;

        // Cek jika email butuh konfirmasi
        if (data.user && data.user.identities && data.user.identities.length === 0) {
          throw new Error("Email ini sudah terdaftar sebelumnya.");
        }

        if (data.session) {
          // Jika tidak butuh konfirmasi email, langsung login otomatis
          // onAuthStateChange SIGNED_IN akan terpicu
        } else {
          // Jika butuh konfirmasi email
          registerSuccessMessage.textContent = "Pendaftaran berhasil! Silakan cek kotak masuk email Anda untuk memverifikasi akun sebelum login.";
          registerSuccessAlert.classList.remove('hidden');
          registerForm.reset();
        }
      } catch (err) {
        console.error("Register gagal:", err);
        registerAlertMessage.textContent = err.message || "Gagal mendaftar.";
        registerAlert.classList.remove('hidden');
      } finally {
        registerBtn.disabled = false;
        registerSpinner.classList.add('hidden');
      }
    });
  }

  // 1.8 Logika Toggle Login/Register
  const btnShowRegister = document.getElementById('btnShowRegister');
  const btnShowLogin = document.getElementById('btnShowLogin');
  const loginContainer = document.getElementById('loginContainer');
  const registerContainer = document.getElementById('registerContainer');

  if (btnShowRegister && btnShowLogin && loginContainer && registerContainer) {
    btnShowRegister.addEventListener('click', () => {
      loginContainer.classList.add('-translate-x-full');
      setTimeout(() => {
        loginContainer.classList.add('hidden');
        registerContainer.classList.remove('hidden');
        // Trigger reflow
        void registerContainer.offsetWidth;
        registerContainer.classList.remove('translate-x-full');
      }, 300);
    });

    btnShowLogin.addEventListener('click', () => {
      registerContainer.classList.add('translate-x-full');
      setTimeout(() => {
        registerContainer.classList.add('hidden');
        loginContainer.classList.remove('hidden');
        // Trigger reflow
        void loginContainer.offsetWidth;
        loginContainer.classList.remove('-translate-x-full');
      }, 300);
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

  // 3. Global Listener untuk mendeteksi token mati / log out jarak jauh / login sukses
  supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
      // Tendang ke halaman login secara paksa untuk menghindari White Screen
      window.location.hash = '#login';
      document.getElementById('view-login').classList.remove('hidden');
      document.getElementById('view-main').classList.add('hidden');
    } else if (event === 'SIGNED_IN') {
      // Masuk ke dashboard jika baru login/register
      window.location.hash = '#dashboard';
      // Router (handleRoute) akan mendeteksi perubahan hash dan mengurus transisi UI
    }
  });
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

// Mengembalikan objek status sesi beserta role (RBAC)
export async function checkSession() {
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    updateHeaderProfile(session.user);
    const role = session.user.app_metadata?.role || 'user';
    return { isAuthenticated: true, role };
  }
  return { isAuthenticated: false, role: 'guest' };
}
