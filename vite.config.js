import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'path';

// Custom plugin to support Clean URLs in Vite Dev Server
function cleanUrlPlugin() {
  return {
    name: 'clean-urls',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        // If it's a known page without extension (except root), route it internally to /pages/...html
        const pages = ['/login', '/register', '/dashboard', '/users', '/settings', '/roadmap', '/tools', '/tools/password-generator'];
        const urlWithoutQuery = req.url.split('?')[0];
        if (pages.includes(urlWithoutQuery)) {
          req.url = req.url.replace(urlWithoutQuery, '/pages' + urlWithoutQuery + '.html');
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
        login: resolve(__dirname, 'pages/login.html'),
        register: resolve(__dirname, 'pages/register.html'),
        dashboard: resolve(__dirname, 'pages/dashboard.html'),
        users: resolve(__dirname, 'pages/users.html'),
        settings: resolve(__dirname, 'pages/settings.html'),
        roadmap: resolve(__dirname, 'pages/roadmap.html'),
        tools: resolve(__dirname, 'pages/tools.html'),
        password_generator: resolve(__dirname, 'pages/tools/password-generator.html')
      }
    }
  }
});
