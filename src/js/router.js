import { checkSession } from './auth';
import { initUsersData } from './users';
import { initDocsData } from './documents';

// KOMENTAR ALUR DATA (ROUTER SPA):
// [Perubahan Hash URL] -> [handleRoute()] -> [Cek Auth] -> [Hide/Show View] -> [Panggil Init Data]

export async function handleRoute() {
  const hash = window.location.hash || '#dashboard';
  
  const viewLogin = document.getElementById('view-login');
  const viewMain = document.getElementById('view-main');
  
  // 1. Cek otentikasi dari Supabase
  const isAuthenticated = await checkSession();
  
  if (!isAuthenticated) {
    // Paksa ke login view
    viewLogin.classList.remove('hidden');
    viewMain.classList.add('hidden');
    // Ganti hash ke login tanpa memicu event route berulang
    history.replaceState(null, null, '#login');
    return;
  }
  
  // Jika sudah autentikasi
  viewLogin.classList.add('hidden');
  viewMain.classList.remove('hidden');

  // Mencegah user mengakses /#login secara eksplisit jika sudah auth
  if (hash === '#login') {
    window.location.hash = '#dashboard';
    return;
  }
  
  // 2. Sembunyikan semua page-view di dalam main container
  document.querySelectorAll('.page-view').forEach(el => el.classList.add('hidden'));
  
  // 3. Tampilkan page-view sesuai hash
  const targetPageId = hash.replace('#', 'page-');
  const targetPage = document.getElementById(targetPageId);
  if (targetPage) {
    targetPage.classList.remove('hidden');
  } else {
    // Fallback jika hash tidak dikenali
    document.getElementById('page-dashboard').classList.remove('hidden');
  }
  
  // 4. Update tampilan navigasi aktif di Sidebar
  document.querySelectorAll('.nav-link').forEach(el => {
    if (el.getAttribute('href') === hash) {
      el.classList.add('bg-primary', 'text-primary-content');
      el.classList.remove('text-base-content');
    } else {
      el.classList.remove('bg-primary', 'text-primary-content');
      el.classList.add('text-base-content');
    }
  });

  // 5. Panggil Inisialisasi Data Spesifik Komponen
  if (hash === '#users') {
    initUsersData();
  } else if (hash === '#dashboard' || hash === '') {
    initDocsData();
  }
}

// Inisiasi pendengar perubahan hash global
export function setupRouter() {
  window.addEventListener('hashchange', handleRoute);
  // Panggil sekali di awal saat halaman dimuat
  handleRoute();
}
