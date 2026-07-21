import '../../style.css';
import { guardAuthenticated, checkSession, updateHeaderProfile, setupPageTransitions, setupSidebarToggle, setupGlobalLogout, setupHeaderDropdown, initLucideIcons } from '../auth.js';
import { generateImagePrompt } from '../services/ai-prompt.js';

async function initPromptBuilder() {
  const allowed = await guardAuthenticated();
  if (!allowed) return;
  
  const { user } = await checkSession();
  if (!user) return;
  
  updateHeaderProfile(user);
  
  setupPageTransitions();
  setupSidebarToggle();
  setupGlobalLogout();
  setupHeaderDropdown();
  initLucideIcons();

  setupBuilderLogic();
}

function setupBuilderLogic() {
  const form = document.getElementById('promptForm');
  const baseIdeaInput = document.getElementById('baseIdea');
  const visualStyle = document.getElementById('visualStyle');
  const cameraLens = document.getElementById('cameraLens');
  const lighting = document.getElementById('lighting');
  const aspectRatio = document.getElementById('aspectRatio');
  const btnReset = document.getElementById('btnReset');
  
  const btnGenerate = document.getElementById('btnGenerate');
  const btnText = document.getElementById('btnText');
  const btnSpinner = document.getElementById('btnSpinner');
  
  const outputSection = document.getElementById('outputSection');
  const resultPrompt = document.getElementById('resultPrompt');
  const btnCopy = document.getElementById('btnCopy');
  const toast = document.getElementById('toast');

  let toastTimeout;

  // Handle Form Submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const baseIdea = baseIdeaInput.value.trim();
    if (!baseIdea) {
      alert("Harap masukkan Ide Dasar terlebih dahulu!");
      baseIdeaInput.focus();
      return;
    }

    const params = {
      baseIdea: baseIdea,
      visualStyle: visualStyle.value,
      cameraLens: cameraLens.value,
      lighting: lighting.value,
      aspectRatio: aspectRatio.value
    };

    // Show Loading State
    btnGenerate.disabled = true;
    btnText.classList.add('opacity-0');
    btnSpinner.classList.remove('hidden');

    try {
      // Call AI Service
      const generatedText = await generateImagePrompt(params);
      
      // Display Result
      resultPrompt.textContent = generatedText;
      outputSection.classList.remove('hidden');
      
      // Scroll to result slightly delayed for smooth UI
      setTimeout(() => {
        outputSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100);
      
    } catch (error) {
      alert(`Terjadi kesalahan: ${error.message}`);
      console.error(error);
    } finally {
      // Restore Button State
      btnGenerate.disabled = false;
      btnText.classList.remove('opacity-0');
      btnSpinner.classList.add('hidden');
    }
  });

  // Handle Reset
  btnReset.addEventListener('click', () => {
    form.reset();
    outputSection.classList.add('hidden');
    resultPrompt.textContent = "";
  });

  // Handle Copy to Clipboard
  btnCopy.addEventListener('click', async () => {
    const textToCopy = resultPrompt.textContent;
    if (!textToCopy) return;

    try {
      await navigator.clipboard.writeText(textToCopy);
      
      // Visual Feedback on Button
      const originalHtml = btnCopy.innerHTML;
      btnCopy.innerHTML = '<i data-lucide="check" class="w-4 h-4 text-emerald-400"></i>';
      initLucideIcons();
      
      // Show Toast
      toast.classList.remove('translate-y-20', 'opacity-0');
      
      if (toastTimeout) clearTimeout(toastTimeout);
      
      toastTimeout = setTimeout(() => {
        toast.classList.add('translate-y-20', 'opacity-0');
        btnCopy.innerHTML = originalHtml;
        initLucideIcons();
      }, 3000);
      
    } catch (err) {
      console.error('Failed to copy!', err);
      alert('Gagal menyalin ke clipboard.');
    }
  });
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', initPromptBuilder);
