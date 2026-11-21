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
const article = fs.readFileSync('dist/ai/openspec/1-core.html', 'utf8');
assert.match(article, /id="从-vibe-coding-说起"/);
assert.match(article, /本页目录/);
console.log(
  `Verified ${getArticles().length} articles, ${getPages().length} preserved/generated routes, navigation, related sites, RSS and sitemap.`,
);
