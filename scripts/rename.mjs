// Make this template your own Factory.
//
//   bun run rename <slug> [--name "Display Name"]
//   bun run rename reely --name Reely
//
// Renames the packages (@factory/* -> @<slug>/*), sets the product name in
// apps/ui/src/brand.json and the README title. Safe to run once on a fresh copy.
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { root } from './lib.mjs';

const [slug, ...rest] = process.argv.slice(2);
if (!slug || !/^[a-z][a-z0-9-]*$/.test(slug)) {
  console.error('usage: bun run rename <slug> [--name "Display Name"]   (slug: lowercase letters, digits, dashes)');
  process.exit(1);
}
const nameFlag = rest.indexOf('--name');
const displayName = nameFlag >= 0 ? rest[nameFlag + 1] : slug.charAt(0).toUpperCase() + slug.slice(1);

const edit = (path, fn) => {
  const file = join(root, path);
  writeFileSync(file, fn(readFileSync(file, 'utf8')));
  console.log(`updated ${path}`);
};
const editJson = (path, fn) => edit(path, text => `${JSON.stringify(fn(JSON.parse(text)), null, 2)}\n`);

editJson('package.json', pkg => ({ ...pkg, name: slug }));
editJson('apps/server/package.json', pkg => ({ ...pkg, name: `@${slug}/server` }));
editJson('apps/ui/package.json', pkg => ({ ...pkg, name: `@${slug}/ui` }));
editJson('apps/ui/src/brand.json', brand => ({ ...brand, name: displayName, shortName: displayName }));
edit('apps/server/src/mastra/index.ts', text => text.replace("'factory-template-v1'", `'${slug}-v1'`));
edit('README.md', text => text.replace(/^# .*$/m, `# ${displayName}`));

console.log(`\nRenamed to ${displayName} (${slug}). Replace apps/ui/src/ui/public/brand/logo.svg with your logo.`);
