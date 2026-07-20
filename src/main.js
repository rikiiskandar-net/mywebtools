import './style.css';
import { setupRouter } from './js/router';
import { initAuthFlow } from './js/auth';
import { setupUsersEvents } from './js/users';
import { setupDocsEvents } from './js/documents';
import { initGlobalTheme } from './js/settings';

// Entry Point SPA Murni
document.addEventListener('DOMContentLoaded', () => {
  initGlobalTheme();
  
  // 1. Pasang Event Listeners Statis (Form Submit, Logout, dll) hanya SEKALI
  initAuthFlow();
  setupUsersEvents();
  setupDocsEvents();
  
  // 2. Setup Logika UI Sidebar Dinamis
  const sidebarToggle = document.getElementById('sidebarToggle');
  const sidebar = document.getElementById('sidebar');
  const closeSidebar = document.getElementById('closeSidebar');
  const sidebarOverlay = document.getElementById('sidebarOverlay');
  
  function toggleSidebar() {
    if(!sidebar) return;
    sidebar.classList.toggle('hidden');
    if(sidebarOverlay) sidebarOverlay.classList.toggle('hidden');
  }

  if (sidebarToggle) sidebarToggle.addEventListener('click', toggleSidebar);
  if (closeSidebar) closeSidebar.addEventListener('click', toggleSidebar);
  if (sidebarOverlay) sidebarOverlay.addEventListener('click', toggleSidebar);
  
  // Tutup sidebar saat klik menu di layar kecil (mobile UX)
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      if(window.innerWidth < 768 && sidebar) {
        sidebar.classList.add('hidden');
        if(sidebarOverlay) sidebarOverlay.classList.add('hidden');
      }
    });
  });

  // 3. Logika Dropdown Profil
  const profileDropdownBtn = document.getElementById('profileDropdownBtn');
  const profileDropdownMenu = document.getElementById('profileDropdownMenu');
  
  if (profileDropdownBtn && profileDropdownMenu) {
    profileDropdownBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      profileDropdownMenu.classList.toggle('hidden');
    });

    // Tutup dropdown jika klik di luar
    document.addEventListener('click', (e) => {
      if (!profileDropdownBtn.contains(e.target) && !profileDropdownMenu.contains(e.target)) {
        profileDropdownMenu.classList.add('hidden');
      }
    });
    
    // Tutup dropdown saat menu diklik
    profileDropdownMenu.querySelectorAll('a, button').forEach(item => {
        item.addEventListener('click', () => {
            profileDropdownMenu.classList.add('hidden');
        });
    });
  }

  // 4. Nyalakan Mesin Router Utama
  // Ini akan menentukan halaman mana yang muncul pertama kali dan mencegat pengguna tak dikenal
  setupRouter();
});
