import { getArticles } from '../lib/content.mjs';
export function GET() {
  const escape = (value) =>
    String(value || '').replace(
      /[<>&"']/g,
      (char) =>
        ({
          '<': '&lt;',
          '>': '&gt;',
          '&': '&amp;',
          '"': '&quot;',
          "'": '&apos;',
        })[char],
    );
  const articles = [...getArticles()]
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''))
    .slice(0, 100);
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>Wulicode</title><link>https://www.wulicode.com</link><description>开发笔记与技术资料</description><language>zh-CN</language>${articles.map((article) => `<item><title>${escape(article.title)}</title><link>${escape('https://www.wulicode.com' + article.url)}</link><guid>${escape('https://www.wulicode.com' + article.url)}</guid><description>${escape(article.description)}</description>${article.date ? `<pubDate>${new Date(article.date).toUTCString()}</pubDate>` : ''}</item>`).join('')}</channel></rss>`,
    { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } },
  );
}
