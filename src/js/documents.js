import { supabase } from './supabaseClient';

export function initDocsData() {
  fetchDocs();
}

let isDocsEventAttached = false;
export function setupDocsEvents() {
  if(isDocsEventAttached) return;
  isDocsEventAttached = true;
  
  const addDocForm = document.getElementById('addDocForm');
  if (addDocForm) {
    addDocForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const judul = document.getElementById('inputDocJudul').value;
      const deskripsi = document.getElementById('inputDocDeskripsi').value;
      const btnSaveDoc = document.getElementById('btnSaveDoc');

      btnSaveDoc.disabled = true;
      try {
        const { error } = await supabase.from('dokumen').insert([{ judul, deskripsi }]);
        if (error) throw error;
        document.getElementById('doc_modal').close();
        addDocForm.reset();
        fetchDocs(); // Refresh tabel
      } catch (err) {
        alert("Gagal menambah dokumen: " + err.message + "\nPastikan tabel 'dokumen' ada di Supabase dengan kolom judul & deskripsi.");
      } finally {
        btnSaveDoc.disabled = false;
      }
    });
  }
}

async function fetchDocs() {
  const tbody = document.getElementById('docsTableBody');
  const statTotal = document.getElementById('statTotalDoc');
  if(!tbody) return;
  
  tbody.innerHTML = `<tr><td colspan="4" class="text-center py-4"><span class="loading loading-spinner"></span></td></tr>`;
  
  try {
    const { data, error } = await supabase.from('dokumen').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    
    if(statTotal) statTotal.textContent = data.length;

    if (data.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4" class="text-center py-4">Belum ada dokumen.</td></tr>`;
      return;
    }
    
    tbody.innerHTML = data.map(doc => `
      <tr>
        <td class="font-medium text-xs opacity-50">${doc.id.substring(0,8)}...</td>
        <td class="font-bold">${doc.judul}</td>
        <td>${doc.deskripsi || '-'}</td>
        <td class="text-sm">${new Date(doc.created_at).toLocaleDateString('id-ID')}</td>
      </tr>
    `).join('');
  } catch (err) {
    console.error(err);
    tbody.innerHTML = `<tr><td colspan="4" class="text-center text-error">Error: ${err.message} <br> Apakah tabel 'dokumen' sudah dibuat?</td></tr>`;
  }
}
