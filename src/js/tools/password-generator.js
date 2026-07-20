import '../../style.css';
import { guardAuthenticated, updateHeaderProfile, setupPageTransitions, setupSidebarToggle, setupGlobalLogout, setupHeaderDropdown, initLucideIcons } from '../auth.js';

async function initPasswordGenerator() {
  const { user } = await guardAuthenticated();
  if (!user) return;
  
  updateHeaderProfile(user);
  
  setupPageTransitions();
  setupSidebarToggle();
  setupGlobalLogout();
  setupHeaderDropdown();

  // Highlight Tools nav link
  document.querySelectorAll('.nav-link').forEach(link => {
    if (link.getAttribute('href') === '/tools') {
      link.classList.add('bg-blue-900/40', 'text-blue-400');
      link.classList.remove('text-zinc-300', 'hover:bg-zinc-800');
    }
  });

  setupGeneratorLogic();
  initLucideIcons();
}

function setupGeneratorLogic() {
  const form = document.getElementById('pwdGenForm');
  const baseWordInput = document.getElementById('baseWord');
  const lengthInput = document.getElementById('charLength');
  const lengthLabel = document.getElementById('charLengthLabel');
  
  const optNumbers = document.getElementById('optNumbers');
  const optSymbols = document.getElementById('optSymbols');
  const optLeet = document.getElementById('optLeet');
  
  const resultsContainer = document.getElementById('resultsContainer');

  lengthInput.addEventListener('input', (e) => {
    lengthLabel.textContent = e.target.value;
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const base = baseWordInput.value.trim();
    const len = parseInt(lengthInput.value, 10);
    const useNum = optNumbers.checked;
    const useSym = optSymbols.checked;
    const useLeet = optLeet.checked;

    const passwords = generateVariations(base, len, useNum, useSym, useLeet, 5);
    renderResults(passwords, resultsContainer);
  });
}

const leetMap = {
  'a': '@', 'A': '4', 'e': '3', 'E': '3',
  'i': '1', 'I': '1', 'o': '0', 'O': '0',
  's': '$', 'S': '5', 't': '7', 'T': '7'
};

function applyLeetSpeak(str) {
  return str.split('').map(c => leetMap[c] || c).join('');
}

function randomChar(chars) {
  return chars[Math.floor(Math.random() * chars.length)];
}

function generateVariations(base, length, useNum, useSym, useLeet, count) {
  const results = [];
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const nums = '0123456789';
  const syms = '!@#$%^&*_-+=';

  for (let i = 0; i < count; i++) {
    let pwd = base;

    if (useLeet && pwd.length > 0) {
      if (Math.random() > 0.3) {
        pwd = applyLeetSpeak(pwd);
      }
    }

    if (pwd.length > 0 && Math.random() > 0.5) {
      const arr = pwd.split('');
      const idx = Math.floor(Math.random() * arr.length);
      arr[idx] = arr[idx].toUpperCase();
      pwd = arr.join('');
    }

    let pool = chars;
    if (useNum) pool += nums;
    if (useSym) pool += syms;

    if (pwd.length < length) {
      const needed = length - pwd.length;
      let suffix = '';
      let hasN = false;
      let hasS = false;
      
      for (let j = 0; j < needed; j++) {
        let p = chars;
        if (useNum && !hasN && j === needed - 1) { p = nums; hasN = true; }
        else if (useSym && !hasS && j === needed - 2) { p = syms; hasS = true; }
        else { p = pool; }
        
        suffix += randomChar(p);
      }
      pwd += suffix;
    } else if (pwd.length === 0) {
      for (let j = 0; j < length; j++) {
        pwd += randomChar(pool);
      }
    } else {
      if (useNum) pwd += randomChar(nums);
      if (useSym) pwd += randomChar(syms);
    }

    if (!base) {
      pwd = pwd.split('').sort(() => 0.5 - Math.random()).join('');
    }

    results.push(pwd);
  }

  return results;
}

function getStrength(pwd) {
  let score = 0;
  if (pwd.length >= 8) score += 1;
  if (pwd.length > 10) score += 1;
  if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score += 1;
  if (/[0-9]/.test(pwd)) score += 1;
  if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

  if (score < 3 || pwd.length < 8) return { label: 'Lemah', color: 'bg-red-500', text: 'text-red-400' };
  if (score >= 4 && pwd.length > 10 && /[^A-Za-z0-9]/.test(pwd)) return { label: 'Kuat', color: 'bg-green-500', text: 'text-green-400' };
  return { label: 'Sedang', color: 'bg-orange-500', text: 'text-orange-400' };
}

function renderResults(passwords, container) {
  container.innerHTML = '';
  
  passwords.forEach(pwd => {
    const strength = getStrength(pwd);
    
    const div = document.createElement('div');
    div.className = 'bg-zinc-900 border border-zinc-700/50 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group';
    
    div.innerHTML = `
      <div class="flex-1 overflow-hidden">
        <div class="font-mono text-zinc-100 text-lg truncate mb-1 select-all">${pwd}</div>
        <div class="flex items-center gap-2">
          <div class="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <div class="h-full ${strength.color} transition-all" style="width: ${strength.label === 'Lemah' ? '30%' : (strength.label === 'Sedang' ? '60%' : '100%')}"></div>
          </div>
          <span class="text-xs font-medium ${strength.text}">${strength.label}</span>
        </div>
      </div>
      <button class="shrink-0 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 p-2 rounded-lg transition-colors" title="Copy to clipboard">
        <i data-lucide="copy" class="w-5 h-5"></i>
      </button>
    `;

    const copyBtn = div.querySelector('button');
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(pwd);
      const icon = copyBtn.querySelector('i');
      icon.setAttribute('data-lucide', 'check');
      icon.classList.replace('text-zinc-300', 'text-green-400');
      if (window.lucide) window.lucide.createIcons({ root: copyBtn });
      
      setTimeout(() => {
        icon.setAttribute('data-lucide', 'copy');
        icon.classList.replace('text-green-400', 'text-zinc-300');
        if (window.lucide) window.lucide.createIcons({ root: copyBtn });
      }, 2000);
    });

    container.appendChild(div);
  });
  
  if (window.lucide) window.lucide.createIcons();
}

document.addEventListener('DOMContentLoaded', initPasswordGenerator);
