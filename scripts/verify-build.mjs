import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { getArticles, getPages, normalizeLink } from '../src/lib/content.mjs';
import {
  topics,
  featuredArticles,
  nav,
  relatedSiteGroups,
} from '../src/lib/site.mjs';
const fileFor = (url) =>
  path.join(
    'dist',
    decodeURI(url).replace(/^\//, ''),
    url.endsWith('/') ? 'index.html' : '',
  );
for (const page of getPages()) {
  assert.ok(
    fs.existsSync(fileFor(page.url)),
    `Missing legacy route: ${page.url}`,
  );
  const html = fs.readFileSync(fileFor(page.url), 'utf8');
  for (const [, href] of html.matchAll(/<a\b[^>]*\bhref="([^"]+)"/g)) {
    const link = new URL(
      href.replaceAll('&amp;', '&'),
      `https://www.wulicode.com${page.url}`,
    );
    if (!['www.wulicode.com', 'wulicode.com'].includes(link.hostname)) continue;
    assert.ok(
      fs.existsSync(fileFor(link.pathname)),
      `Broken article link: ${page.url} -> ${href}`,
    );
  }
  assert.match(html, /<html lang="zh-CN"/);
  assert.ok(
    html.includes(
      'rel="canonical" href="https://www.wulicode.com' +
        encodeURI(page.url) +
        '"',
    ) ||
      html.includes(
        'rel="canonical" href="https://www.wulicode.com' + page.url + '"',
      ),
    `Canonical URL missing: ${page.url}`,
  );
}
const links = [
  ...topics,
  ...featuredArticles,
  ...nav.flatMap((item) =>
    item.items ? item.items.flatMap((child) => child.items || [child]) : [item],
  ),
];
for (const item of links)
  assert.ok(
    fs.existsSync(fileFor(normalizeLink(item.link))),
    `Broken navigation: ${item.link}`,
  );
const home = fs.readFileSync('dist/index.html', 'utf8');
for (const group of relatedSiteGroups)
  for (const site of group.sites)
    assert.ok(
      home.includes(`href="${site.link}"`),
      `Missing related site ${site.link}`,
    );
assert.ok(!home.includes('weiran.tech'));
for (const file of [
  '404.html',
  'articles.html',
  'rss.xml',
  'sitemap-index.xml',
  'robots.txt',
])
  assert.ok(fs.existsSync(`dist/${file}`), `Missing ${file}`);
// Check every sitemap entry against the actual output and canonical routes.
const expectedSitemap = new Set(
  ['/', ...getPages().map((page) => page.url), '/articles.html'].map(
    (url) => new URL(url, 'https://www.wulicode.com').href,
  ),
);
const sitemapIndex = fs.readFileSync('dist/sitemap-index.xml', 'utf8');
const sitemapUrls = [];
for (const [, location] of sitemapIndex.matchAll(/<loc>([^<]+)<\/loc>/g)) {
  const xml = fs.readFileSync(fileFor(new URL(location).pathname), 'utf8');
  for (const [, url] of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) {
    assert.ok(expectedSitemap.has(url), `Non-canonical sitemap URL: ${url}`);
    assert.ok(
      fs.existsSync(fileFor(new URL(url).pathname)),
      `Broken sitemap URL: ${url}`,
    );
    sitemapUrls.push(url);
  }
}
assert.equal(
  sitemapUrls.length,
  new Set(sitemapUrls).size,
  'Duplicate sitemap URLs',
);
assert.deepEqual(
  new Set(sitemapUrls),
  expectedSitemap,
  'Missing canonical sitemap URLs',
);
const redirects = JSON.parse(fs.readFileSync('vercel.json', 'utf8')).redirects;
assert.equal(new Set(redirects.map((r) => r.source)).size, redirects.length);
for (const redirect of redirects) {
  assert.notEqual(redirect.source, redirect.destination);
  assert.ok(
    fs.existsSync(fileFor(redirect.destination)),
    `Broken redirect: ${redirect.source}`,
  );
}
const article = fs.readFileSync('dist/ai/openspec/1-core.html', 'utf8');
assert.match(article, /id="从-vibe-coding-说起"/);
assert.match(article, /本页目录/);
console.log(
  `Verified ${getArticles().length} articles, ${getPages().length} preserved/generated routes, navigation, related sites, RSS and sitemap.`,
);
