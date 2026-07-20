import { supabase } from './supabaseClient';

// Mengekstrak role dari user metadata / app metadata
export function getRole(user) {
  return user?.app_metadata?.role || user?.user_metadata?.role || 'user';
}

// Mengecek status autentikasi
export async function checkSession() {
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    const role = getRole(session.user);
    return { isAuthenticated: true, role, user: session.user };
  }
  return { isAuthenticated: false, role: 'guest', user: null };
}

// GUARD: Memastikan pengguna sudah login (Untuk halaman Dashboard, dll)
export async function guardAuthenticated() {
  const { isAuthenticated } = await checkSession();
  if (!isAuthenticated) {
    window.location.href = '/login.html';
    return false;
  }
  return true;
}

// GUARD: Memastikan pengguna belum login (Untuk halaman Login/Register)
export async function guardGuest() {
  const { isAuthenticated } = await checkSession();
  if (isAuthenticated) {
    window.location.href = '/dashboard.html';
    return false;
  }
  return true;
}

// GUARD: Memastikan pengguna adalah admin (Untuk halaman Users)
export async function guardAdmin() {
  const { isAuthenticated, role } = await checkSession();
  if (!isAuthenticated) {
    window.location.href = '/login.html';
    return false;
  }
  if (role !== 'admin') {
    window.location.href = '/dashboard.html';
    return false;
  }
  return true;
}

// Update Header Profile
export function updateHeaderProfile(user) {
  const headerName = document.getElementById('headerUserName');
  const headerAvatar = document.getElementById('headerUserAvatar');
  const headerAvatarLarge = document.getElementById('headerUserAvatarLarge');
  
  if (user) {
    const name = user.user_metadata?.full_name || user.email.split('@')[0];
    const role = getRole(user);
    
    if (headerName) headerName.textContent = name;
    
    const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1e1e1e&color=fff`;
    if (headerAvatar) headerAvatar.src = avatarUrl;
    if (headerAvatarLarge) headerAvatarLarge.src = avatarUrl;
    
    // Perbarui label role di profil dropdown
    const roleLabel = document.querySelector('#profileDropdownMenu span.text-sm.text-zinc-400');
    if (roleLabel) {
      roleLabel.textContent = role === 'admin' ? 'Administrator' : 'User Biasa';
    }
  }
}

// Set up Global Logout Button
export function setupGlobalLogout() {
  const btnGlobalLogout = document.getElementById('btnGlobalLogout');
  if(btnGlobalLogout){
    btnGlobalLogout.addEventListener('click', async () => {
      try {
        await supabase.auth.signOut();
        window.location.href = '/login.html';
      } catch(err) {
        alert("Gagal logout: " + err.message);
      }
    });
  }
}

// Setup Header Dropdown Toggle
export function setupHeaderDropdown() {
  const profileDropdownBtn = document.getElementById('profileDropdownBtn');
  const profileDropdownMenu = document.getElementById('profileDropdownMenu');
  
  if (profileDropdownBtn && profileDropdownMenu) {
    profileDropdownBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      profileDropdownMenu.classList.toggle('hidden');
    });

    document.addEventListener('click', (e) => {
      if (!profileDropdownBtn.contains(e.target) && !profileDropdownMenu.contains(e.target)) {
        profileDropdownMenu.classList.add('hidden');
      }
    });
  }
}
