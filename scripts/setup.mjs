#!/usr/bin/env node
import { existsSync } from 'node:fs';
import {
  mkdir,
  readFile,
  readdir,
  writeFile,
} from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { createInterface } from 'node:readline/promises';

const packageRoot = path.resolve(import.meta.dirname, '..');
const projectRoot = process.cwd();
const rawArgs = process.argv.slice(2).filter(argument => argument !== 'setup');
const flags = new Set(rawArgs.filter(argument => argument.startsWith('--')));
const dryRun = flags.has('--dry-run');
const force = flags.has('--force');
const navigation = [...flags]
  .find(flag => flag.startsWith('--navigation='))
  ?.split('=')[1] ?? 'none';

if (!['none', 'rnn'].includes(navigation)) {
  throw new Error('Supported navigation values are "none" and "rnn".');
}

const detectPackageManager = () => {
  if (existsSync(path.join(projectRoot, 'pnpm-lock.yaml'))) return 'pnpm';
  if (existsSync(path.join(projectRoot, 'yarn.lock'))) return 'yarn';
  return 'npm';
};

const collectFiles = async directory => {
  const entries = await readdir(directory, { withFileTypes: true });
  return (await Promise.all(entries.map(async entry => {
    const target = path.join(directory, entry.name);
    return entry.isDirectory() ? collectFiles(target) : [target];
  }))).flat();
};

const planned = [];
const addTemplate = async directory => {
  const files = await collectFiles(directory);
  files.forEach(source => {
    planned.push({
      source,
      destination: path.join(projectRoot, path.relative(directory, source)),
    });
  });
};

await addTemplate(path.join(packageRoot, 'starter/react-native'));
if (navigation === 'rnn') {
  await addTemplate(path.join(packageRoot, 'starter/react-native-rnn'));
}
planned.push({
  source: path.join(packageRoot, 'scripts/validate-design-system-setup.mjs'),
  destination: path.join(
    projectRoot,
    'scripts/validate-design-system-setup.mjs',
  ),
});

const packageJsonPath = path.join(projectRoot, 'package.json');
if (!existsSync(packageJsonPath)) {
  throw new Error(`No package.json found in ${projectRoot}.`);
}

const conflicts = planned.filter(file => existsSync(file.destination));
if (conflicts.length > 0 && !force && !dryRun) {
  if (!process.stdin.isTTY) {
    throw new Error(
      `${conflicts.length} setup files already exist. Re-run with --force to overwrite.`,
    );
  }
  const prompt = createInterface({ input: process.stdin, output: process.stdout });
  const answer = await prompt.question(
    `${conflicts.length} setup files already exist. Overwrite them? [y/N] `,
  );
  prompt.close();
  if (!/^y(?:es)?$/i.test(answer.trim())) {
    console.log('Setup cancelled without changing files.');
    process.exit(0);
  }
}

console.log(`Design-system setup (${navigation === 'rnn' ? 'Wix RNN' : 'standard'})`);
planned.forEach(file => {
  const action = existsSync(file.destination) ? 'overwrite' : 'create';
  console.log(`- ${action}: ${path.relative(projectRoot, file.destination)}`);
});

if (dryRun) {
  console.log('\nDry run complete. No files were changed.');
  process.exit(0);
}

for (const file of planned) {
  await mkdir(path.dirname(file.destination), { recursive: true });
  await writeFile(file.destination, await readFile(file.source));
}

if (navigation === 'rnn') {
  const indexPath = path.join(projectRoot, 'src/design-system/index.ts');
  const indexSource = await readFile(indexPath, 'utf8');
  const navigationExports = [
    "export * from './designSystemNavigation';",
    "export * from './registerAppScreen';",
  ];
  const additions = navigationExports.filter(line => !indexSource.includes(line));
  if (additions.length > 0) {
    await writeFile(
      indexPath,
      `${indexSource.trimEnd()}\n${additions.join('\n')}\n`,
      'utf8',
    );
  }
}

const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf8'));
packageJson.scripts = {
  ...packageJson.scripts,
  'validate:design-system': [
    'node ./scripts/validate-design-system-setup.mjs',
    navigation === 'rnn' ? '--navigation=rnn' : '',
  ].filter(Boolean).join(' '),
};
await writeFile(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`);

const packageManager = detectPackageManager();
console.log('\nSetup files generated successfully.');
console.log(`Package manager detected: ${packageManager}`);
console.log('Next steps:');
const nextSteps = [
  'Install required peer dependencies listed in docs/SETUP.md.',
];
if (navigation === 'rnn') {
  nextSteps.push('Install react-native-navigation and run npx rnn-link.');
}
nextSteps.push(
  'Run CocoaPods for iOS: cd ios && pod install && cd ..',
  `Run ${packageManager} run validate:design-system`,
  'Wrap your app or registered screens with DesignSystemSetup.',
);
nextSteps.forEach((step, index) => {
  console.log(`${index + 1}. ${step}`);
});
