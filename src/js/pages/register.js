import '../../style.css';
import { supabase } from '../supabaseClient';
import { guardGuest } from '../auth';

async function init() {
  const allowed = await guardGuest();
  if (!allowed) return;

  const registerForm = document.getElementById('registerForm');
  const registerBtn = document.getElementById('registerBtn');
  const registerSpinner = document.getElementById('registerSpinner');
  const registerAlert = document.getElementById('registerAlert');
  const registerAlertMessage = document.getElementById('registerAlertMessage');
  const registerSuccessAlert = document.getElementById('registerSuccessAlert');
  const registerSuccessMessage = document.getElementById('registerSuccessMessage');

  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('regNameInput').value;
      const email = document.getElementById('regEmailInput').value;
      const password = document.getElementById('regPasswordInput').value;

      registerAlert.classList.add('hidden');
      registerSuccessAlert.classList.add('hidden');
      registerBtn.disabled = true;
      registerSpinner.classList.remove('hidden');

      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name,
              role: 'user'
            }
          }
        });
        
        if (error) throw error;

        // Cek jika email butuh konfirmasi
        if (data.user && data.user.identities && data.user.identities.length === 0) {
          throw new Error("Email ini sudah terdaftar sebelumnya.");
        }

        if (data.session) {
          window.location.href = '/dashboard.html';
        } else {
          registerSuccessMessage.textContent = "Pendaftaran berhasil! Silakan cek email Anda untuk verifikasi.";
          registerSuccessAlert.classList.remove('hidden');
          registerForm.reset();
        }
      } catch (err) {
        console.error("Register gagal:", err);
        registerAlertMessage.textContent = err.message || "Gagal mendaftar.";
        registerAlert.classList.remove('hidden');
      } finally {
        registerBtn.disabled = false;
        registerSpinner.classList.add('hidden');
      }
    });
  }
}

init();
