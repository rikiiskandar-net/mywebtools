import { checkSession } from '../auth';

async function init() {
  const { isAuthenticated } = await checkSession();
  if (isAuthenticated) {
    window.location.replace('/dashboard');
  } else {
    window.location.replace('/login');
  }
}

init();
