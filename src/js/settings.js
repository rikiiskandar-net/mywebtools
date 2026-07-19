import { supabase } from './supabaseClient';
import { updateHeaderProfile } from './auth';

let isSettingsEventAttached = false;

export async function initSettingsData() {
  const { data: { user } } = await supabase.auth.getUser();
  if(!user) return;
  
  const inputProfileName = document.getElementById('inputProfileName');
  const inputProfileEmail = document.getElementById('inputProfileEmail');
  
  // Ambil metadata dari supabase auth
  const fullName = user.user_metadata?.full_name || 'Admin User';
  
  if(inputProfileName) inputProfileName.value = fullName;
  if(inputProfileEmail) inputProfileEmail.value = user.email;
  
  setupSettingsEvents();
}

export function setupSettingsEvents() {
  if(isSettingsEventAttached) return;
  isSettingsEventAttached = true;
  
  // Tema dihapus karena hardcoded dark mode (MD3 style)

  // Profile Form Logic
  const profileForm = document.getElementById('profileForm');
  const profileSpinner = document.getElementById('profileSpinner');
  const btnSaveProfile = document.getElementById('btnSaveProfile');
  const alertContainer = document.getElementById('settingsAlertContainer');
  const alertMessage = document.getElementById('settingsAlertMessage');

  if(profileForm) {
    profileForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const newName = document.getElementById('inputProfileName').value;
      
      btnSaveProfile.disabled = true;
      profileSpinner.classList.remove('hidden');
      alertContainer.classList.add('hidden');
      
      try {
        const { data, error } = await supabase.auth.updateUser({
          data: { full_name: newName }
        });
        
        if (error) throw error;
        
        // Sukses
        alertMessage.textContent = 'Profil berhasil diperbarui!';
        alertContainer.className = 'alert alert-success shadow-sm mb-4';
        alertContainer.classList.remove('hidden');
        
        // Update header juga
        updateHeaderProfile(data.user);
        
      } catch (err) {
        alertMessage.textContent = 'Gagal menyimpan profil: ' + err.message;
        alertContainer.className = 'alert alert-error shadow-sm mb-4';
        alertContainer.classList.remove('hidden');
      } finally {
        btnSaveProfile.disabled = false;
        profileSpinner.classList.add('hidden');
      }
    });
  }
}

// Inisialisasi tema global (dihapus/tidak perlu lagi karena hardcoded)
export function initGlobalTheme() {
  document.documentElement.classList.add('dark');
}
