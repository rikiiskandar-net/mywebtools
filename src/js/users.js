import { supabase } from './supabaseClient';

export function initUsersData() {
  fetchUsers();
}

// Karena SPA, pendengar event form hanya dipasang sekali
let isUsersEventAttached = false;
export function setupUsersEvents() {
  if(isUsersEventAttached) return;
  isUsersEventAttached = true;
  
  const addUserForm = document.getElementById('addUserForm');
  if (addUserForm) {
    addUserForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fullName = document.getElementById('inputName').value;
      const email = document.getElementById('inputEmail').value;
      const role = document.getElementById('inputRole').value;
      const btnSaveUser = document.getElementById('btnSaveUser');

      btnSaveUser.disabled = true;
      try {
        const { error } = await supabase.from('users_data').insert([{ full_name: fullName, email, role }]);
        if (error) throw error;
        document.getElementById('user_modal').close();
        addUserForm.reset();
        fetchUsers(); // Refresh tabel
      } catch (err) {
        alert("Gagal menambah pengguna: " + err.message);
      } finally {
        btnSaveUser.disabled = false;
      }
    });
  }
}

async function fetchUsers() {
  const tbody = document.getElementById('usersTableBody');
  if(!tbody) return;
  tbody.innerHTML = `<div class="p-6 text-center text-zinc-400 flex flex-col items-center"><span class="w-6 h-6 border-2 border-zinc-500 border-t-transparent rounded-full animate-spin mb-2"></span>Memuat data...</div>`;
  
  try {
    const { data, error } = await supabase.from('users_data').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    
    if (data.length === 0) {
      tbody.innerHTML = `<div class="p-6 text-center text-zinc-400">Belum ada pengguna.</div>`;
      return;
    }
    
    tbody.innerHTML = data.map(user => `
      <div class="flex items-center hover:bg-zinc-700/30 transition-colors p-4 sm:p-6">
        <div class="w-12 h-12 shrink-0 bg-blue-900/30 text-blue-400 rounded-full flex justify-center items-center font-bold text-lg">
          ${user.full_name.charAt(0).toUpperCase()}
        </div>
        <div class="flex-1 px-4">
          <div class="text-zinc-100 font-medium flex items-center gap-2">
            ${user.full_name}
            ${user.role === 'admin' ? '<span class="px-2 py-0.5 rounded-md bg-blue-900/40 text-blue-400 text-xs">Admin</span>' : '<span class="px-2 py-0.5 rounded-md bg-zinc-700 text-zinc-300 text-xs">User</span>'}
          </div>
          <div class="text-zinc-500 text-sm mt-1">${user.email}</div>
          <div class="text-zinc-600 text-xs mt-1">Status: ${user.status === 'active' ? '<span class="text-green-500">Aktif</span>' : '<span class="text-red-500">Nonaktif</span>'}</div>
        </div>
        <div class="shrink-0">
          <button class="p-2 text-red-400 hover:bg-red-400/10 rounded-full transition-colors" onclick="window.deleteUser('${user.id}')" title="Hapus Pengguna">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </button>
        </div>
      </div>
    `).join('');
  } catch (err) {
    console.error(err);
    tbody.innerHTML = `<div class="p-6 text-center text-red-400">Error: ${err.message}</div>`;
  }
}

// Global function untuk dipanggil oleh onclick inline
window.deleteUser = async (id) => {
  if (!confirm('Hapus pengguna ini?')) return;
  try {
    const { error } = await supabase.from('users_data').delete().eq('id', id);
    if (error) throw error;
    fetchUsers();
  } catch (err) {
    alert("Gagal menghapus: " + err.message);
  }
};
