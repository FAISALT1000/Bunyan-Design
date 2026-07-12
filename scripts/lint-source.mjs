import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const root = path.resolve(import.meta.dirname, '..');
const sourceRoot = path.join(root, 'src');
const failures = [];

async function collectFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(entries.map(async entry => {
    const target = path.join(directory, entry.name);
    return entry.isDirectory() ? collectFiles(target) : [target];
  }));
  return files.flat();
}

const sourceFiles = (await collectFiles(sourceRoot))
  .filter(file => /\.(ts|tsx)$/.test(file));

for (const file of sourceFiles) {
  const source = await readFile(file, 'utf8');
  const relative = path.relative(root, file);
  const checks = [
    [/@ts-(?:ignore|nocheck)/, 'TypeScript suppression is not allowed.'],
    [/\bdebugger\s*;/, 'debugger statements are not allowed.'],
    [
      /from\s+['"][^'"]*localization\/(?:en|ar)\.json['"]/,
      'Application translation JSON must not be imported by the package.',
    ],
  ];
  for (const [pattern, message] of checks) {
    if (pattern.test(source)) failures.push(`${relative}: ${message}`);
  }
}

if (failures.length > 0) {
  console.error('Source lint failed:\n');
  failures.forEach(failure => console.error(`- ${failure}`));
  process.exitCode = 1;
} else {
  console.log(`Source lint passed (${sourceFiles.length} files checked).`);
}
