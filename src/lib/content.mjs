import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { parse as parseYaml } from 'yaml';
import MarkdownIt from 'markdown-it';
import anchor from 'markdown-it-anchor';
import container from 'markdown-it-container';
import { createHighlighter, bundledLanguages } from 'shiki';
import sanitizeHtml from 'sanitize-html';
import { categoryNames } from './site.mjs';

const root = process.cwd();
const docs = path.join(root, 'docs');
function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (entry.name.startsWith('.')) return [];
    const file = path.join(dir, entry.name);
    return entry.isDirectory()
      ? walk(file)
      : file.endsWith('.md')
        ? [file]
        : [];
  });
}
const dates = new Map();
try {
  let timestamp;
  for (const line of execFileSync(
    'git',
    ['log', '--format=@%aI', '--name-only', '--', 'docs'],
    { cwd: root, encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 },
  ).split('\n')) {
    if (line.startsWith('@')) timestamp = line.slice(1);
    else if (line && !dates.has(line)) dates.set(line, timestamp);
  }
} catch {
  /* Archives without Git still use frontmatter dates. */
}
export function articleUrl(id) {
  return id === 'index'
    ? '/'
    : id.endsWith('/index')
      ? `/${id.slice(0, -5)}`
      : `/${id}.html`;
}
export function parseArticle(source, id) {
  const front = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(source);
  const meta = front ? parseYaml(front[1]) || {} : {};
  const body = front ? source.slice(front[0].length) : source;
  const heading = /^#\s+(.+)$/m.exec(body)?.[1];
  const ogTitle = meta.head?.find(
    (item) =>
      item?.[1]?.name === 'og:title' || item?.[1]?.property === 'og:title',
  )?.[1]?.content;
  const clean = (value) =>
    String(value || '')
      .replace(/<[^>]*>/g, '')
      .replace(/[*`]/g, '')
      .trim();
  const title = clean(
    meta.title ||
      heading ||
      ogTitle ||
      body.split('slug:')[0].split('\n')[0].slice(0, 100) ||
      id.split('/').pop(),
  );
  const description = clean(
    meta.description ||
      body
        .replace(/```[\s\S]*?```/g, '')
        .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
        .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
        .replace(/[#>\n]/g, ' ')
        .replace(/\s+/g, ' '),
  ).slice(0, 180);
  const dateValue =
    meta.lastUpdated ||
    meta.date ||
    meta.published ||
    dates.get(`docs/${id}.md`);
  const date = dateValue ? new Date(dateValue) : undefined;
  return {
    id,
    url: articleUrl(id),
    title,
    description,
    body,
    meta,
    category: categoryNames[id.split('/')[0]] || id.split('/')[0],
    date:
      date && !Number.isNaN(date.getTime()) ? date.toISOString() : undefined,
  };
}
let cachedKey = '',
  cachedArticles,
  nextScan = 0;
export function getArticles() {
  if (cachedArticles && (import.meta.env?.PROD || Date.now() < nextScan))
    return cachedArticles;
  nextScan = Date.now() + 500;
  const files = walk(docs).filter(
    (file) => path.relative(docs, file) !== 'index.md',
  );
  const key = files
    .map((file) => `${file}:${fs.statSync(file).mtimeMs}`)
    .join('|');
  if (key !== cachedKey) {
    cachedArticles = files
      .map((file) =>
        parseArticle(
          fs.readFileSync(file, 'utf8'),
          path
            .relative(docs, file)
            .replace(/\.md$/, '')
            .split(path.sep)
            .join('/'),
        ),
      )
      .sort((a, b) => a.id.localeCompare(b.id, 'zh-CN', { numeric: true }));
    cachedKey = key;
  }
  return cachedArticles;
}
export function getPages() {
  const articles = getArticles();
  const pages = new Map(articles.map((article) => [article.id, article]));
  for (const article of articles) {
    const parts = article.id.split('/');
    parts.pop();
    while (parts.length) {
      const dir = parts.join('/');
      if (!pages.has(`${dir}/index`))
        pages.set(`${dir}/index`, {
          id: `${dir}/index`,
          url: `/${dir}/`,
          title: categoryNames[parts.at(-1)] || parts.at(-1),
          category: categoryNames[parts[0]] || parts[0],
          description: `${categoryNames[parts.at(-1)] || parts.at(-1)} 相关文章与技术笔记`,
          body: '',
          meta: {},
          generated: true,
        });
      parts.pop();
    }
  }
  return [...pages.values()];
}
export function normalizeLink(href, currentId = 'index') {
  if (!href || /^(?:[a-z][a-z\d+.-]*:|#|\/\/)/i.test(href)) return href;
  const url = new URL(href, `https://www.wulicode.com/${currentId}.html`);
  let pathname = decodeURI(url.pathname);
  if (pathname.endsWith('.md')) pathname = pathname.slice(0, -3) + '.html';
  if (pathname.endsWith('/index') || pathname.endsWith('/index.html'))
    pathname = pathname.replace(/index(?:\.html)?$/, '');
  if (!pathname.endsWith('/') && !path.posix.extname(pathname)) {
    const id = pathname.slice(1);
    const articles = getArticles();
    pathname = articles.some((article) => article.id === id)
      ? `${pathname}.html`
      : `${pathname}/`;
  }
  return encodeURI(pathname) + url.search + url.hash;
}
export function sidebarScope(id) {
  const parts = id.replace(/\/index$/, '').split('/');
  return ['back-end', 'front-end', 'database'].includes(parts[0]) &&
    parts.length > 1
    ? parts.slice(0, 2).join('/')
    : parts[0];
}
export function getSidebar(id) {
  const scope = sidebarScope(id);
  const groups = new Map();
  for (const article of getArticles().filter((article) =>
    article.id.startsWith(`${scope}/`),
  )) {
    const rest = article.id.slice(scope.length + 1).split('/');
    const group = rest.length > 1 ? rest[0] : '';
    if (!groups.has(group)) groups.set(group, []);
    groups.get(group).push(article);
  }
  return [...groups].map(([id, articles]) => ({
    id,
    title:
      categoryNames[id] ||
      id ||
      categoryNames[scope.split('/').at(-1)] ||
      scope,
    articles,
  }));
}
// Match the legacy VitePress anchor format, including Chinese and duplicate headings.
export const slugify = (value) =>
  value
    .normalize('NFKD')
    .replace(/[\u0300-\u036F]/g, '')
    .replace(/[\u0000-\u001f]/g, '')
    .replace(/[\s~`!@#$%^&*()\-_+=[\]{}|\\;:"'“”‘’<>,.?/]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/^(\d)/, '_$1')
    .toLowerCase();
let highlighterPromise;
async function highlighter() {
  if (!highlighterPromise) {
    const names = new Set(['text']);
    const aliases = {
      shell: 'bash',
      sh: 'bash',
      zsh: 'bash',
      plain: 'text',
      plaintext: 'text',
      console: 'bash',
      js: 'javascript',
      ts: 'typescript',
      yml: 'yaml',
    };
    for (const article of getArticles())
      for (const match of article.body.matchAll(/^\s*```([^\s`{]+)/gm)) {
        const name = match[1].toLowerCase();
        const lang = aliases[name] || name;
        if (lang in bundledLanguages) names.add(lang);
      }
    highlighterPromise = createHighlighter({
      themes: ['github-light', 'github-dark'],
      langs: [...names].filter((name) => name !== 'text'),
    });
  }
  return highlighterPromise;
}
export async function renderArticle(article) {
  const shiki = await highlighter();
  const md = new MarkdownIt({
    html: true,
    linkify: true,
    highlight(code, info) {
      const aliases = {
        shell: 'bash',
        sh: 'bash',
        zsh: 'bash',
        plain: 'text',
        plaintext: 'text',
        console: 'bash',
        js: 'javascript',
        ts: 'typescript',
        yml: 'yaml',
      };
      const name = info.toLowerCase().replace(/\{.*$/, '');
      const lang = aliases[name] || name;
      return shiki.codeToHtml(code, {
        lang: shiki.getLoadedLanguages().includes(lang) ? lang : 'text',
        themes: { light: 'github-light', dark: 'github-dark' },
        defaultColor: false,
      });
    },
  }).use(anchor, { slugify, level: [1, 2, 3, 4, 5, 6] });
  for (const type of [
    'info',
    'tip',
    'warning',
    'danger',
    'note',
    'important',
    'caution',
    'details',
  ])
    md.use(container, type, {
      render(tokens, index) {
        if (tokens[index].nesting === -1)
          return type === 'details' ? '</details>\n' : '</aside>\n';
        const title =
          tokens[index].info.trim().slice(type.length).trim() ||
          {
            info: '说明',
            tip: '提示',
            warning: '注意',
            danger: '警告',
            note: '笔记',
            important: '重要',
            caution: '注意',
            details: '详细内容',
          }[type];
        return type === 'details'
          ? `<details><summary>${md.utils.escapeHtml(title)}</summary>`
          : `<aside class="custom-block ${type}"><p class="custom-block-title">${md.utils.escapeHtml(title)}</p>\n`;
      },
    });
  const tokens = md.parse(article.body, {});
  const headings = [];
  let firstHeading = true;
  function visit(tokens) {
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      if (token.type === 'heading_open') {
        const text = tokens[i + 1]?.content || '';
        if (
          token.tag === 'h1' &&
          firstHeading &&
          text.replace(/[*`]/g, '') === article.title
        ) {
          token.hidden = true;
          tokens[i + 1].hidden = true;
          tokens[i + 1].content = '';
          tokens[i + 1].children = [];
          if (tokens[i + 2]) tokens[i + 2].hidden = true;
        } else if (['h2', 'h3', 'h4'].includes(token.tag))
          headings.push({
            depth: Number(token.tag.slice(1)),
            slug: token.attrGet('id'),
            text: text.replace(/[*`]/g, ''),
          });
        firstHeading = false;
      }
      if (token.type === 'link_open') {
        const href = token.attrGet('href');
        token.attrSet('href', normalizeLink(href, article.id));
        if (/^https?:\/\//.test(href || '')) {
          token.attrSet('target', '_blank');
          token.attrSet('rel', 'noopener noreferrer');
        }
      }
      if (token.type === 'image') {
        token.attrSet('loading', 'lazy');
        token.attrSet('decoding', 'async');
      }
      if (token.children) visit(token.children);
    }
  }
  visit(tokens);
  const fence = md.renderer.rules.fence;
  md.renderer.rules.fence = (...args) => {
    const language = args[0][args[1]].info
      .trim()
      .split(/[\s{]/)[0]
      .toLowerCase();
    const labels = {
      py: 'python',
      js: 'javascript',
      ts: 'typescript',
      sh: 'shell',
      bash: 'shell',
      zsh: 'shell',
      yml: 'yaml',
      plaintext: 'text',
      plain: 'text',
    };
    const label = md.utils.escapeHtml(labels[language] || language);
    const languageLabel =
      label && label !== 'text'
        ? `<span class="code-language">${label}</span>`
        : '';
    return `<div class="code-block">${languageLabel}<div class="code-toolbar"><button type="button" class="copy-code" aria-label="复制代码">复制</button></div>${fence(...args)}</div>`;
  };
  const html = sanitizeHtml(md.renderer.render(tokens, md.options, {}), {
    allowedTags: [
      ...sanitizeHtml.defaults.allowedTags,
      'img',
      'picture',
      'source',
      'video',
      'audio',
      'iframe',
      'details',
      'summary',
      'button',
      'input',
      'aside',
      'section',
      'figure',
      'figcaption',
      'del',
      'mark',
    ],
    allowedAttributes: {
      '*': ['class', 'id', 'aria-label', 'aria-hidden', 'role'],
      a: ['href', 'name', 'target', 'rel'],
      img: ['src', 'alt', 'title', 'width', 'height', 'loading', 'decoding'],
      span: ['class', 'style'],
      pre: ['class', 'style', 'tabindex'],
      code: ['class'],
      iframe: [
        'src',
        'title',
        'width',
        'height',
        'allow',
        'allowfullscreen',
        'loading',
      ],
      video: ['src', 'controls', 'poster', 'width', 'height'],
      audio: ['src', 'controls'],
      source: ['src', 'srcset', 'type'],
      button: ['type', 'class', 'aria-label'],
      input: ['type', 'checked', 'disabled'],
      td: ['colspan', 'rowspan', 'style'],
      th: ['colspan', 'rowspan', 'style'],
    },
  });
  return { html, headings };
}
