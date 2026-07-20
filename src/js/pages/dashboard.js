import '../../style.css';
import { guardAuthenticated, checkSession, updateHeaderProfile, setupGlobalLogout, setupHeaderDropdown, setupSidebarToggle, initLucideIcons, setupPageTransitions } from '../auth';
import { initDocsData } from '../documents';

async function init() {
  const allowed = await guardAuthenticated();
  if (!allowed) return;

  const { user, role } = await checkSession();
  updateHeaderProfile(user);
  setupGlobalLogout();
  setupHeaderDropdown();
  setupSidebarToggle();
  initLucideIcons();
  setupPageTransitions();
  
  // Guard untuk menyembunyikan menu Users jika bukan admin
  const usersNavLink = document.querySelector('a.nav-link[href="/users"]');
  if (usersNavLink) {
    if (role === 'admin') {
      usersNavLink.classList.remove('hidden');
      usersNavLink.classList.add('flex');
    } else {
      usersNavLink.classList.add('hidden');
      usersNavLink.classList.remove('flex');
    }
  }

  // Aktifkan styling link navigasi
  document.querySelectorAll('.nav-link').forEach(el => {
    if (el.getAttribute('href') === '/dashboard') {
      el.classList.add('bg-blue-900/40', 'text-blue-400');
      el.classList.remove('text-zinc-300', 'hover:bg-zinc-800');
    }
  });

  // Sidebar mobile toggle
  const sidebarToggle = document.getElementById('sidebarToggle');
  const sidebar = document.getElementById('sidebar');
  const sidebarOverlay = document.getElementById('sidebarOverlay');
  if (sidebarToggle && sidebar && sidebarOverlay) {
    sidebarToggle.addEventListener('click', () => {
      sidebar.classList.toggle('-translate-x-full');
      sidebarOverlay.classList.toggle('hidden');
    });
    sidebarOverlay.addEventListener('click', () => {
      sidebar.classList.add('-translate-x-full');
      sidebarOverlay.classList.add('hidden');
    });
  }

  // Load Data
  initDocsData();
}

init();
