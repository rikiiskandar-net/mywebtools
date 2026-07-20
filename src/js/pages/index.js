import { checkSession } from '../auth';

async function init() {
  const { isAuthenticated } = await checkSession();
  if (isAuthenticated) {
    window.location.href = '/dashboard.html';
  } else {
    window.location.href = '/login.html';
  }
}

init();
