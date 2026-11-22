import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { getPages } from './src/lib/content.mjs';

// Astro's inferred dynamic routes omit the legacy .html suffix.
const canonicalPages = new Set(
  [...getPages().map((page) => page.url), '/articles.html'].map(
    (url) => new URL(url, 'https://www.wulicode.com').href,
  ),
);

export default defineConfig({
  site: 'https://www.wulicode.com',
  output: 'static',
  publicDir: './docs/public',
  build: { format: 'preserve' },
  integrations: [
    sitemap({
      customPages: [...canonicalPages],
      filter: (page) => canonicalPages.has(page),
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
