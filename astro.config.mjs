import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://www.wulicode.com',
  output: 'static',
  publicDir: './docs/public',
  build: { format: 'preserve' },
  integrations: [
    sitemap({
      filter: (page) => !page.endsWith('/404') && !page.endsWith('/404.html'),
    }),
  ],
  server: { host: true, port: 9900 },
  devToolbar: { enabled: false },
  vite: {
    server: { strictPort: true },
    plugins: [
      {
        name: 'reload-markdown-articles',
        configureServer(server) {
          let timer;
          const reloadArticles = (event, file) => {
            if (
              !['add', 'change', 'unlink'].includes(event) ||
              !file.includes('/docs/') ||
              !file.endsWith('.md')
            )
              return;
            clearTimeout(timer);
            timer = setTimeout(() => {
              server
                .restart()
                .catch((error) => server.config.logger.error(error.message));
            }, 120);
          };
          server.watcher.on('all', reloadArticles);
          server.httpServer?.once('close', () => {
            clearTimeout(timer);
            server.watcher.off('all', reloadArticles);
          });
        },
      },
    ],
  },
});
