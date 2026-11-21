import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  getArticles,
  getPages,
  parseArticle,
  articleUrl,
  normalizeLink,
  renderArticle,
  slugify,
} from '../src/lib/content.mjs';

test('retains every existing Markdown article and builds unique routes', () => {
  const articles = getArticles();
  assert.ok(articles.length >= 803);
  assert.equal(
    new Set(articles.map((article) => article.url)).size,
    articles.length,
  );
  const pages = getPages();
  assert.equal(new Set(pages.map((page) => page.url)).size, pages.length);
  for (const article of articles)
    assert.ok(pages.some((page) => page.id === article.id));
  assert.ok(pages.some((page) => page.url === '/design/ui/'));
});
test('preserves legacy article and directory URLs', () => {
  assert.equal(articleUrl('ai/openspec/1-core'), '/ai/openspec/1-core.html');
  assert.equal(articleUrl('back-end/java/index'), '/back-end/java/');
  assert.equal(
    normalizeLink('./2-setup.md#安装', 'back-end/java/core/1-introduction'),
    '/back-end/java/core/2-setup.html#%E5%AE%89%E8%A3%85',
  );
  assert.equal(normalizeLink('/ops/index'), '/ops/');
  assert.equal(
    normalizeLink('/ai/openspec/1-core'),
    '/ai/openspec/1-core.html',
  );
  assert.equal(normalizeLink('https://maxiaoxi.com'), 'https://maxiaoxi.com');
});
test('frontmatter metadata and legacy og titles remain usable', () => {
  const article = parseArticle(
    '---\ntitle: 标题\nlastUpdated: 2026-11-20\ndescription: 摘要\n---\n# 正文标题\n内容',
    'test',
  );
  assert.equal(article.title, '标题');
  assert.equal(article.description, '摘要');
  assert.ok(article.date.startsWith('2026-11-20'));
  assert.equal(
    parseArticle(
      '---\nhead:\n  - - meta\n    - name: og:title\n      content: 旧标题\n---\n正文',
      'legacy',
    ).title,
    '旧标题',
  );
});
test('heading anchors match legacy VitePress punctuation and numbering', () => {
  assert.equal(slugify('1. Hello, World!'), '_1-hello-world');
  assert.equal(slugify('为什么先写 Spec'), '为什么先写-spec');
  assert.equal(slugify('Café & Node.js'), 'cafe-node-js');
});
test('renders legacy callouts, syntax highlighting, duplicate anchors and relative links', async () => {
  const article = parseArticle(
    '# Test\n\n::: tip 提示\n内容\n:::\n\n## 重复标题\n\n## 重复标题\n\n```JS\nconst value = 1;\n```\n\n[下一篇](./next.md)',
    'ai/test',
  );
  const { html, headings } = await renderArticle(article);
  assert.match(html, /custom-block tip/);
  assert.match(html, /shiki/);
  assert.match(html, /复制代码/);
  assert.equal(headings.length, 2);
  assert.notEqual(headings[0].slug, headings[1].slug);
  assert.match(html, /href="\/ai\/next.html"/);
  assert.doesNotMatch(html, /<h1/);
});
test('article HTML cannot execute embedded script snippets', async () => {
  const { html } = await renderArticle(
    parseArticle(
      '# Test\n\n<script>alert(1)</script>\n\n<img src="https://example.com/image.png" onerror="alert(1)">',
      'test',
    ),
  );
  assert.doesNotMatch(html, /<script|onerror=/);
  assert.match(html, /image.png/);
});
