import fs from 'node:fs';
import { getPages } from '../src/lib/content.mjs';

const config = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
const redirects = new Map([
  ['/ops/canal-deployer.html', '/ops/canal/deployer.html'],
  ['/ops/of978e.html', '/ops/linux/rhel/firewalld.html'],
  [
    '/back-end/java/primer/jenv-java-environment--version-manager.html',
    '/back-end/java/primer/jenv-java-environment-version-manager.html',
  ],
]);
for (const page of getPages()) {
  if (page.url.endsWith('.html'))
    redirects.set(page.url.slice(0, -5), page.url);
  if (page.id.endsWith('/index')) redirects.set(`/${page.id}/`, page.url);
}
config.redirects = [...redirects]
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([source, destination]) => ({ source, destination, permanent: true }));
fs.writeFileSync('vercel.json', JSON.stringify(config, null, 2) + '\n');
console.log(`Synced ${config.redirects.length} legacy URL redirects`);
