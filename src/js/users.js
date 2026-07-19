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
  tbody.innerHTML = `<tr><td colspan="5" class="text-center py-4"><span class="loading loading-spinner"></span></td></tr>`;
  
  try {
    const { data, error } = await supabase.from('users_data').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    
    if (data.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" class="text-center py-4">Belum ada pengguna.</td></tr>`;
      return;
    }
    
    tbody.innerHTML = data.map(user => `
      <tr>
        <td class="font-medium">${user.full_name}</td>
        <td>${user.email}</td>
        <td><span class="badge ${user.role === 'admin' ? 'badge-primary' : 'badge-ghost'} badge-sm">${user.role}</span></td>
        <td><span class="badge ${user.status === 'active' ? 'badge-success' : 'badge-error'} badge-sm text-white">${user.status}</span></td>
        <td><button class="btn btn-ghost btn-xs text-error" onclick="window.deleteUser('${user.id}')">Hapus</button></td>
      </tr>
    `).join('');
  } catch (err) {
    console.error(err);
    tbody.innerHTML = `<tr><td colspan="5" class="text-center text-error">Error: ${err.message}</td></tr>`;
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
