import { supabase } from './supabaseClient';
import { updateHeaderProfile, setupPageTransitions } from './auth';

let isSettingsEventAttached = false;
let currentUser = null;
let currentDbUser = null;

export async function initSettingsData() {
  const { data: { user } } = await supabase.auth.getUser();
  if(!user) return;
  currentUser = user;
  
  // Ambil data profil ekstra dari tabel users_data
  const { data: dbUser, error } = await supabase.from('users_data')
    .select('*')
    .eq('email', user.email)
    .single();
    
  if (dbUser) {
    currentDbUser = dbUser;
  } else {
    currentDbUser = { phone: '', address: '', birth_date: '' }; // Fallback jika belum ada
  }
  
  populateProfileViews();
  setupSettingsEvents();
  setupPageTransitions(); // Re-apply page transitions if loaded dynamically
}

function getAvatarUrl(name, storedUrl) {
  if (storedUrl) return storedUrl;
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1e1e1e&color=fff`;
}

function populateProfileViews() {
  if (!currentUser) return;
  
  const fullName = currentUser.user_metadata?.full_name || 'Admin User';
  const avatarUrl = getAvatarUrl(fullName, currentUser.user_metadata?.avatar_url);
  const email = currentUser.email;

  // Read-Only Elements
  const roName = document.getElementById('roName');
  const roEmail = document.getElementById('roEmail');
  const roAvatar = document.getElementById('roAvatar');
  const roPhone = document.getElementById('roPhone');
  const roAddress = document.getElementById('roAddress');
  const roBirthDate = document.getElementById('roBirthDate');

  if (roName) roName.textContent = fullName;
  if (roEmail) roEmail.textContent = email;
  if (roAvatar) roAvatar.src = avatarUrl;
  if (roPhone) roPhone.textContent = currentDbUser?.phone || '-';
  if (roAddress) roAddress.textContent = currentDbUser?.address || '-';
  
  if (roBirthDate) {
    if (currentDbUser?.birth_date) {
      // Format tanggal sederhana YYYY-MM-DD ke format lokal bisa ditambahkan di sini
      roBirthDate.textContent = currentDbUser.birth_date;
    } else {
      roBirthDate.textContent = '-';
    }
  }

  // Edit Elements
  const inputProfileName = document.getElementById('inputProfileName');
  const inputProfileEmail = document.getElementById('inputProfileEmail');
  const editAvatarPreview = document.getElementById('editAvatarPreview');
  const inputProfilePassword = document.getElementById('inputProfilePassword');
  const inputProfilePhone = document.getElementById('inputProfilePhone');
  const inputProfileAddress = document.getElementById('inputProfileAddress');
  const inputProfileBirthDate = document.getElementById('inputProfileBirthDate');
  
  if (inputProfileName) inputProfileName.value = fullName;
  if (inputProfileEmail) inputProfileEmail.value = email;
  if (editAvatarPreview) editAvatarPreview.src = avatarUrl;
  if (inputProfilePassword) inputProfilePassword.value = '';
  
  if (inputProfilePhone) inputProfilePhone.value = currentDbUser?.phone || '';
  if (inputProfileAddress) inputProfileAddress.value = currentDbUser?.address || '';
  if (inputProfileBirthDate) inputProfileBirthDate.value = currentDbUser?.birth_date || '';
}

export function setupSettingsEvents() {
  if(isSettingsEventAttached) return;
  isSettingsEventAttached = true;
  
  const roView = document.getElementById('profileReadOnlyView');
  const editView = document.getElementById('profileEditView');
  const btnEditMode = document.getElementById('btnEditMode');
  const btnCancelEdit = document.getElementById('btnCancelEdit');
  
  const profileForm = document.getElementById('profileForm');
  const profileSpinner = document.getElementById('profileSpinner');
  const btnSaveProfile = document.getElementById('btnSaveProfile');
  const alertContainer = document.getElementById('settingsAlertContainer');
  const alertMessage = document.getElementById('settingsAlertMessage');
  
  const inputAvatar = document.getElementById('inputProfileAvatar');
  const editAvatarPreview = document.getElementById('editAvatarPreview');

  // Toggle to Edit Mode
  if (btnEditMode) {
    btnEditMode.addEventListener('click', () => {
      roView.classList.add('hidden', 'opacity-0');
      roView.classList.remove('opacity-100');
      
      setTimeout(() => {
        editView.classList.remove('hidden');
        void editView.offsetWidth;
        editView.classList.add('opacity-100');
        editView.classList.remove('opacity-0');
      }, 300);
    });
  }

  // Toggle to Read-Only Mode (Cancel)
  if (btnCancelEdit) {
    btnCancelEdit.addEventListener('click', () => {
      populateProfileViews(); // Reset form values
      if(inputAvatar) inputAvatar.value = ''; // Reset file input
      
      editView.classList.add('hidden', 'opacity-0');
      editView.classList.remove('opacity-100');
      
      setTimeout(() => {
        roView.classList.remove('hidden');
        void roView.offsetWidth;
        roView.classList.add('opacity-100');
        roView.classList.remove('opacity-0');
      }, 300);
    });
  }

  // Avatar Image Preview
  if (inputAvatar) {
    inputAvatar.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file && editAvatarPreview) {
        const reader = new FileReader();
        reader.onload = (evt) => {
          editAvatarPreview.src = evt.target.result;
        };
        reader.readAsDataURL(file);
      }
    });
  }

  if(profileForm) {
    profileForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const newName = document.getElementById('inputProfileName').value;
      const newEmail = document.getElementById('inputProfileEmail').value;
      const newPassword = document.getElementById('inputProfilePassword').value;
      const newPhone = document.getElementById('inputProfilePhone')?.value || null;
      const newAddress = document.getElementById('inputProfileAddress')?.value || null;
      const newBirthDate = document.getElementById('inputProfileBirthDate')?.value || null;
      
      const avatarFile = inputAvatar?.files[0];
      
      btnSaveProfile.disabled = true;
      profileSpinner.classList.remove('hidden');
      alertContainer.classList.add('hidden');
      
      try {
        let updatedAvatarUrl = currentUser.user_metadata?.avatar_url;
        
        // 1. Upload Avatar if exists
        if (avatarFile) {
          const fileExt = avatarFile.name.split('.').pop();
          const fileName = `${currentUser.id}-${Math.random()}.${fileExt}`;
          const filePath = `${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(filePath, avatarFile, { upsert: true });

          if (uploadError) throw new Error("Gagal mengunggah foto profil: " + uploadError.message);

          const { data: { publicUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(filePath);
            
          updatedAvatarUrl = publicUrl;
        }

        // 2. Update Auth User
        const updateData = {
          data: { full_name: newName, avatar_url: updatedAvatarUrl }
        };
        
        if (newEmail && newEmail !== currentUser.email) {
          updateData.email = newEmail;
        }
        if (newPassword && newPassword.trim() !== '') {
          updateData.password = newPassword;
        }

        const { data: authData, error: authError } = await supabase.auth.updateUser(updateData);
        if (authError) throw authError;

        // 3. Update users_data table
        const dbUpdatePayload = { 
          full_name: newName, 
          email: newEmail || currentUser.email,
          phone: newPhone,
          address: newAddress,
          birth_date: newBirthDate || null
        };
        
        const { error: dbError } = await supabase.from('users_data')
          .update(dbUpdatePayload)
          .eq('email', currentUser.email); // Gunakan email lama sebagai pencarian

        if (dbError) {
          // Jika pengguna belum ada di users_data, kita bisa pertimbangkan upsert. 
          // Tapi asumsikan sudah ada saat registrasi.
          console.warn("Failed to sync with users_data:", dbError);
          // throw new Error("Gagal menyimpan ke database profil."); 
        } else {
           // Update local cache
           currentDbUser = { ...currentDbUser, ...dbUpdatePayload };
        }
        
        // Sukses
        currentUser = authData.user;
        populateProfileViews();
        updateHeaderProfile(currentUser);
        
        alertMessage.textContent = 'Profil berhasil diperbarui!';
        if(newEmail && newEmail !== currentUser.email) {
          alertMessage.textContent += ' Anda mungkin perlu memverifikasi email baru.';
        }
        alertContainer.className = 'bg-green-900/40 text-green-300 border border-green-800 rounded-[16px] p-4 mb-6 transition-all';
        alertContainer.classList.remove('hidden');
        
        // Return to Read-Only View
        btnCancelEdit.click();
        
      } catch (err) {
        alertMessage.textContent = err.message;
        alertContainer.className = 'bg-red-900/40 text-red-300 border border-red-800 rounded-[16px] p-4 mb-6 transition-all';
        alertContainer.classList.remove('hidden');
      } finally {
        btnSaveProfile.disabled = false;
        profileSpinner.classList.add('hidden');
      }
    });
  }
}
