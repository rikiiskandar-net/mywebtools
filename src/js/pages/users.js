import '../../style.css';
import { guardAdmin, checkSession, updateHeaderProfile, setupGlobalLogout, setupHeaderDropdown } from '../auth';
import { initUsersData } from '../users';

async function init() {
  const allowed = await guardAdmin();
  if (!allowed) return;

  const { user } = await checkSession();
  updateHeaderProfile(user);
  setupGlobalLogout();
  setupHeaderDropdown();

  // Aktifkan styling link navigasi
  document.querySelectorAll('.nav-link').forEach(el => {
    if (el.getAttribute('href') === '/users.html') {
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
