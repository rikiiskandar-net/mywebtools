import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'path';

// Custom plugin to support Clean URLs in Vite Dev Server
function cleanUrlPlugin() {
  return {
    name: 'clean-urls',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        // If it's a known page without extension (except root), append .html internally
        const pages = ['/login', '/register', '/dashboard', '/users', '/settings'];
        const urlWithoutQuery = req.url.split('?')[0];
        if (pages.includes(urlWithoutQuery)) {
          req.url = req.url.replace(urlWithoutQuery, urlWithoutQuery + '.html');
        }
        next();
      });
    }
  };
}

export default defineConfig({
  plugins: [
    tailwindcss(),
    cleanUrlPlugin()
  ],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        login: resolve(__dirname, 'login.html'),
        register: resolve(__dirname, 'register.html'),
        dashboard: resolve(__dirname, 'dashboard.html'),
        users: resolve(__dirname, 'users.html'),
        settings: resolve(__dirname, 'settings.html')
      }
    }
  }
});
