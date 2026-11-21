export interface ArticleRecord {
  id: string;
  url: string;
  title: string;
  description: string;
  category: string;
  body: string;
  meta: Record<string, unknown>;
  date?: string;
  generated?: boolean;
}
export interface ArticleHeading {
  depth: number;
  slug: string;
  text: string;
}
export function getArticles(): ArticleRecord[];
export function getPages(): ArticleRecord[];
export function parseArticle(source: string, id: string): ArticleRecord;
export function articleUrl(id: string): string;
export function normalizeLink(href: string, currentId?: string): string;
export function sidebarScope(id: string): string;
export function getSidebar(
  id: string,
): { id: string; title: string; articles: ArticleRecord[] }[];
export function slugify(value: string): string;
export function renderArticle(
  article: ArticleRecord,
): Promise<{ html: string; headings: ArticleHeading[] }>;
