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
  
  tbody.innerHTML = `<div class="p-6 text-center text-zinc-400 flex flex-col items-center"><span class="w-6 h-6 border-2 border-zinc-500 border-t-transparent rounded-full animate-spin mb-2"></span>Memuat data...</div>`;
  
  try {
    const { data, error } = await supabase.from('dokumen').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    
    if(statTotal) statTotal.textContent = `${data.length} dokumen`;

    if (data.length === 0) {
      tbody.innerHTML = `<div class="p-6 text-center text-zinc-400">Belum ada dokumen.</div>`;
      return;
    }
    
    tbody.innerHTML = data.map(doc => `
      <div class="flex items-center hover:bg-zinc-700/30 transition-colors p-4 sm:p-6 group">
        <div class="w-10 sm:w-16 shrink-0 text-zinc-400 flex justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
        </div>
        <div class="flex-1 px-2 sm:px-4">
          <div class="text-zinc-100 font-medium">${doc.judul}</div>
          <div class="text-zinc-500 text-sm mt-1 line-clamp-1">${doc.deskripsi || '-'}</div>
          <div class="text-zinc-600 text-xs mt-1">Ditambahkan: ${new Date(doc.created_at).toLocaleDateString('id-ID')} &bull; ID: ${doc.id.substring(0,8)}</div>
        </div>
        <div class="text-zinc-500 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <button class="p-2 hover:bg-zinc-600 rounded-full transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
          </button>
        </div>
      </div>
    `).join('');
  } catch (err) {
    console.error(err);
    tbody.innerHTML = `<div class="p-6 text-center text-red-400">Error: ${err.message}</div>`;
  }
}
