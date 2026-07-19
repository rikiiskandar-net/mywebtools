import '../style.css';
import { supabase } from './supabaseClient';
import { requireAuth } from './auth.js';

// KOMENTAR ALUR DATA:
// [Aksi User: Buka Halaman] -> [fetchUsers()] -> [Supabase API: select] -> [Database] -> [Render ke Tabel]

document.addEventListener('DOMContentLoaded', async () => {
  // Panggil penjaga rute (Route Guard)
  await requireAuth();

  // --- Sidebar Logic (Modular Component Reuse) ---
  const sidebarToggle = document.getElementById('sidebarToggle');
  const sidebar = document.getElementById('sidebar');
  const closeSidebar = document.getElementById('closeSidebar');
  const sidebarOverlay = document.getElementById('sidebarOverlay');
  
  function toggleSidebar() {
    sidebar.classList.toggle('hidden');
    sidebarOverlay.classList.toggle('hidden');
  }

  if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener('click', toggleSidebar);
    if (closeSidebar) closeSidebar.addEventListener('click', toggleSidebar);
    if (sidebarOverlay) sidebarOverlay.addEventListener('click', toggleSidebar);
  }

  // --- Users CRUD Logic ---
  const usersTableBody = document.getElementById('usersTableBody');
  const addUserForm = document.getElementById('addUserForm');
  const btnSaveUser = document.getElementById('btnSaveUser');
  const saveSpinner = document.getElementById('saveSpinner');
  const alertContainer = document.getElementById('alertContainer');
  const alertMessage = document.getElementById('alertMessage');

  // Fungsi untuk menampilkan pesan ke user
  function showAlert(message, type = 'alert-info') {
    alertMessage.textContent = message;
    alertContainer.className = `alert shadow-lg mb-4 ${type}`;
    alertContainer.classList.remove('hidden');
    setTimeout(() => { alertContainer.classList.add('hidden'); }, 5000);
  }

  // READ: Mengambil data pengguna dari Supabase
  async function fetchUsers() {
    try {
      // Panggil Supabase API
      const { data, error } = await supabase
        .from('users_data')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      renderUsers(data);
    } catch (err) {
      console.error("Gagal mengambil data:", err);
      // Fallback pesan jika DB belum disetup
      usersTableBody.innerHTML = `<tr><td colspan="5" class="text-center text-error py-4">Error memuat data. Apakah environment variables Supabase sudah diset? (${err.message})</td></tr>`;
    }
  }

  // Merender baris HTML ke tabel
  function renderUsers(users) {
    if (!users || users.length === 0) {
      usersTableBody.innerHTML = `<tr><td colspan="5" class="text-center py-4">Belum ada pengguna.</td></tr>`;
      return;
    }

    usersTableBody.innerHTML = users.map(user => `
      <tr>
        <td class="font-medium">${user.full_name}</td>
        <td>${user.email}</td>
        <td>
          <span class="badge ${user.role === 'admin' ? 'badge-primary' : 'badge-ghost'} badge-sm">
            ${user.role}
          </span>
        </td>
        <td>
          <span class="badge ${user.status === 'active' ? 'badge-success' : 'badge-error'} badge-sm text-white">
            ${user.status}
          </span>
        </td>
        <td>
          <button class="btn btn-ghost btn-xs text-error" onclick="window.deleteUser('${user.id}')">Hapus</button>
        </td>
      </tr>
    `).join('');
  }

  // CREATE: Menambah pengguna baru
  // ALUR DATA: [Aksi User: Submit Form] -> [Supabase API: insert] -> [Database] -> [Tutup Modal & fetchUsers()]
  addUserForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Ambil data dari input
    const fullName = document.getElementById('inputName').value;
    const email = document.getElementById('inputEmail').value;
    const role = document.getElementById('inputRole').value;
    
    // Loading State UI
    btnSaveUser.disabled = true;
    saveSpinner.classList.remove('hidden');

    try {
      const { data, error } = await supabase
        .from('users_data')
        .insert([{ full_name: fullName, email: email, role: role }])
        .select();

      if (error) throw error;

      showAlert('Pengguna berhasil ditambahkan!', 'alert-success');
      document.getElementById('user_modal').close(); // Tutup modal
      addUserForm.reset(); // Kosongkan form
      fetchUsers(); // Refresh tabel
    } catch (err) {
      console.error("Gagal menambah pengguna:", err);
      showAlert(`Gagal menambah pengguna: ${err.message}`, 'alert-error');
    } finally {
      // Kembalikan UI
      btnSaveUser.disabled = false;
      saveSpinner.classList.add('hidden');
    }
  });

  // DELETE: Menghapus pengguna (Didefinisikan di window agar bisa dipanggil dari inline onclick HTML)
  window.deleteUser = async (id) => {
    if (!confirm('Apakah Anda yakin ingin menghapus pengguna ini?')) return;
    
    try {
      const { error } = await supabase
        .from('users_data')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      showAlert('Pengguna berhasil dihapus!', 'alert-success');
      fetchUsers();
    } catch (err) {
      console.error("Gagal menghapus:", err);
      showAlert(`Gagal menghapus pengguna: ${err.message}`, 'alert-error');
    }
  };

  // Panggil fetch awal saat halaman dimuat
  fetchUsers();
});
