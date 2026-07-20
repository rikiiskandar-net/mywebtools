import '../../style.css';
import { supabase } from '../supabaseClient';
import { guardGuest } from '../auth';

async function init() {
  const allowed = await guardGuest();
  if (!allowed) return;

  const loginForm = document.getElementById('loginForm');
  const loginBtn = document.getElementById('loginBtn');
  const loginSpinner = document.getElementById('loginSpinner');
  const loginAlert = document.getElementById('loginAlert');
  const loginAlertMessage = document.getElementById('loginAlertMessage');

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('emailInput').value;
      const password = document.getElementById('passwordInput').value;

      loginAlert.classList.add('hidden');
      loginBtn.disabled = true;
      loginSpinner.classList.remove('hidden');

      try {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        
        window.location.href = '/dashboard.html';
      } catch (err) {
        console.error("Login gagal:", err);
        loginAlertMessage.textContent = err.message || "Gagal masuk.";
        loginAlert.classList.remove('hidden');
      } finally {
        loginBtn.disabled = false;
        loginSpinner.classList.add('hidden');
      }
    });
  }
}

init();
