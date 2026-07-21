import '../style.css';
import { guardAuthenticated, checkSession, updateHeaderProfile, setupPageTransitions, setupSidebarToggle, setupGlobalLogout, setupHeaderDropdown, initLucideIcons } from './auth.js';

async function initToolsPage() {
  const allowed = await guardAuthenticated();
  if (!allowed) return;
  
  const { user } = await checkSession();
  if (!user) return;
  
  updateHeaderProfile(user);
  
  setupPageTransitions();
  setupSidebarToggle();
  setupGlobalLogout();
  setupHeaderDropdown();
  
  // Highlight Tools nav link
  document.querySelectorAll('.nav-link').forEach(link => {
    if (link.getAttribute('href') === '/tools') {
      link.classList.add('bg-blue-900/40', 'text-blue-400');
      link.classList.remove('text-zinc-300', 'hover:bg-zinc-800');
    }
  });

  initLucideIcons();
}

document.addEventListener('DOMContentLoaded', initToolsPage);
