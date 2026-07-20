import '../../style.css';
import { guardAdmin, checkSession, updateHeaderProfile, setupGlobalLogout, setupHeaderDropdown, setupSidebarToggle, initLucideIcons, setupPageTransitions } from '../auth';
import { initUsersData } from '../users';

async function init() {
  const allowed = await guardAdmin();
  if (!allowed) return;

  const { user } = await checkSession();
  updateHeaderProfile(user);
  setupGlobalLogout();
  setupHeaderDropdown();
  setupSidebarToggle();
  initLucideIcons();
  setupPageTransitions();

  // Aktifkan styling link navigasi
  document.querySelectorAll('.nav-link').forEach(el => {
    if (el.getAttribute('href') === '/users') {
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
  initUsersData();
}

init();
