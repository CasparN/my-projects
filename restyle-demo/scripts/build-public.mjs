import { execFileSync } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
const base = process.env.SITE_BASE || '/my-projects';
if (!/^\/[a-zA-Z0-9_-]+$/.test(base)) throw new Error('SITE_BASE must be one path segment.');
execFileSync('npm', ['run', 'build'], { stdio: 'inherit', env: { ...process.env, PUBLIC_SITE: 'true' } });
for (const name of await fs.readdir('dist', { recursive: true })) {
  if (!/\.(html|css|js|json|svg|xml|txt)$/.test(name)) continue;
  const file = path.join('dist', name);
  await fs.writeFile(file, (await fs.readFile(file, 'utf8')).replaceAll('/portfolio/', base + '/'));
}
console.log(`Public Field journal site built at ${base}/`);
