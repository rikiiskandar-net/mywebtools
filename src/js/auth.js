import { supabase } from './supabaseClient';

export function getRole(user) {
  // Hanya percayai app_metadata untuk role admin demi keamanan yang ketat.
  // user_metadata bisa dimanipulasi user lewat API klien, app_metadata tidak.
  if (user?.app_metadata?.role === 'admin') return 'admin';
  return 'user';
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

// Apply RBAC to DOM
export function applyRBAC(role) {
  if (role === 'admin') {
    document.querySelectorAll('[data-admin-only="true"]').forEach(el => {
      el.classList.remove('hidden');
    });
  }
}

// GUARD: Memastikan pengguna sudah login (Untuk halaman Dashboard, dll)
export async function guardAuthenticated() {
  const { isAuthenticated, role } = await checkSession();
  if (!isAuthenticated) {
    window.location.replace('/login');
    return false;
  }
  applyRBAC(role);
  document.body.style.visibility = 'visible';
  setTimeout(() => {
    const mainContent = document.getElementById('mainContent');
    if (mainContent) {
      mainContent.classList.remove('opacity-0');
      mainContent.classList.add('opacity-100');
    }
  }, 10);
  return true;
}

// GUARD: Memastikan pengguna belum login (Untuk halaman Login/Register)
export async function guardGuest() {
  const { isAuthenticated } = await checkSession();
  if (isAuthenticated) {
    window.location.replace('/dashboard');
    return false;
  }
  document.body.style.visibility = 'visible';
  setTimeout(() => {
    const mainContent = document.getElementById('mainContent');
    if (mainContent) {
      mainContent.classList.remove('opacity-0');
      mainContent.classList.add('opacity-100');
    }
  }, 10);
  return true;
}

// GUARD: Memastikan pengguna adalah admin (Untuk halaman Users)
export async function guardAdmin() {
  const { isAuthenticated, role } = await checkSession();
  if (!isAuthenticated) {
    window.location.replace('/login');
    return false;
  }
  if (role !== 'admin') {
    window.location.replace('/dashboard');
    return false;
  }
  applyRBAC(role);
  document.body.style.visibility = 'visible';
  setTimeout(() => {
    const mainContent = document.getElementById('mainContent');
    if (mainContent) {
      mainContent.classList.remove('opacity-0');
      mainContent.classList.add('opacity-100');
    }
  }, 10);
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
        // Paksa bersihkan state dan hindari tombol back
        window.location.replace('/login');
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

// Setup Desktop Sidebar Toggle (Collapsible)
export function setupSidebarToggle() {
  const sidebar = document.getElementById('sidebar');
  const toggleBtn = document.getElementById('sidebarDesktopToggle');
  if (!sidebar || !toggleBtn) return;

  const navTexts = sidebar.querySelectorAll('.nav-text');
  const navLinks = sidebar.querySelectorAll('.nav-link');
  const toggleIcon = document.getElementById('sidebarToggleIcon');

  const applyState = (collapsed) => {
    if (collapsed) {
      sidebar.classList.remove('w-64');
      sidebar.classList.add('w-20');
      navTexts.forEach(el => {
        el.classList.remove('opacity-100');
        el.classList.add('opacity-0', 'hidden');
      });
      navLinks.forEach(el => {
        el.classList.remove('px-4', 'gap-4', 'justify-start');
        el.classList.add('px-0', 'justify-center');
      });
      if(toggleIcon) toggleIcon.classList.add('rotate-180');
    } else {
      sidebar.classList.remove('w-20');
      sidebar.classList.add('w-64');
      navTexts.forEach(el => {
        el.classList.remove('hidden');
        // timeout for smooth fade in
        setTimeout(() => el.classList.remove('opacity-0'), 50);
        el.classList.add('opacity-100');
      });
      navLinks.forEach(el => {
        el.classList.remove('px-0', 'justify-center');
        el.classList.add('px-4', 'gap-4', 'justify-start');
      });
      if(toggleIcon) toggleIcon.classList.remove('rotate-180');
    }
  };

  const isCollapsed = localStorage.getItem('sidebar_collapsed') === 'true';
  applyState(isCollapsed);

  toggleBtn.addEventListener('click', () => {
    const currentState = localStorage.getItem('sidebar_collapsed') === 'true';
    const newState = !currentState;
    localStorage.setItem('sidebar_collapsed', newState);
    applyState(newState);
  });
}

// Inisialisasi Lucide Icons
export function initLucideIcons() {
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

// Setup Pre-fetching & Page Transitions
export function setupPageTransitions() {
  const navLinks = document.querySelectorAll('a.nav-link');
  
  navLinks.forEach(link => {
    // 1. Pre-fetching
    link.addEventListener('mouseenter', () => {
      const href = link.getAttribute('href');
      if (href && href.startsWith('/')) {
        const existingLink = document.querySelector(`link[rel="prefetch"][href="${href}"]`);
        if (!existingLink) {
          const prefetchLink = document.createElement('link');
          prefetchLink.rel = 'prefetch';
          prefetchLink.href = href;
          document.head.appendChild(prefetchLink);
        }
      }
    });

    // 2. Page Transition on Click
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      // Abaikan jika href sama dengan path saat ini
      if (href === window.location.pathname || href === '#') return;

      e.preventDefault();
      
      const mainContent = document.getElementById('mainContent');
      if (mainContent) {
        mainContent.classList.remove('opacity-100');
        mainContent.classList.add('opacity-0');
      }
      
      setTimeout(() => {
        window.location.href = href;
      }, 150);
    });
  });
}
