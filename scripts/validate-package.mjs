import { existsSync } from 'node:fs';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import process from 'node:process';
import { spawnSync } from 'node:child_process';

const root = path.resolve(import.meta.dirname, '..');
const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const npmCache = path.join(os.tmpdir(), 'bunyan-design-system-npm-cache');
const SEMVER_PATTERN = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/;

const fail = message => {
  throw new Error(`Package validation failed: ${message}`);
};

const collectFiles = async directory => {
  if (!existsSync(directory)) return [];
  const entries = await readdir(directory, { withFileTypes: true });
  return (await Promise.all(entries.map(async entry => {
    const target = path.join(directory, entry.name);
    return entry.isDirectory() ? collectFiles(target) : [target];
  }))).flat();
};

export async function validatePackage({ inspectArchive = true } = {}) {
  const packagePath = path.join(root, 'package.json');
  if (!existsSync(packagePath)) fail('package.json does not exist.');
  const packageJson = JSON.parse(await readFile(packagePath, 'utf8'));

  if (!packageJson.name) fail('package name is required.');
  if (!SEMVER_PATTERN.test(packageJson.version ?? '')) {
    fail(`"${packageJson.version}" is not a supported semantic version.`);
  }
  if (!packageJson.main || !existsSync(path.join(root, packageJson.main))) {
    fail(`main entry "${packageJson.main}" does not exist.`);
  }
  if (!packageJson.types || !existsSync(path.join(root, packageJson.types))) {
    fail(`types entry "${packageJson.types}" does not exist.`);
  }

  for (const required of ['src/index.ts', 'README.md', 'scripts/generate-package.mjs']) {
    if (!existsSync(path.join(root, required))) fail(`${required} is required.`);
  }

  const dependencies = packageJson.dependencies ?? {};
  const peerDependencies = packageJson.peerDependencies ?? {};
  for (const peer of ['react', 'react-native']) {
    if (!peerDependencies[peer]) fail(`${peer} must be a peer dependency.`);
    if (dependencies[peer]) fail(`${peer} must not be bundled as a dependency.`);
  }
  if (!dependencies['i18n-js']) {
    fail('i18n-js must be declared as a runtime dependency.');
  }

  const builtFiles = await collectFiles(path.join(root, 'dist'));
  if (builtFiles.length === 0) fail('dist build output is empty.');
  for (const file of builtFiles.filter(file => file.endsWith('.js'))) {
    const source = await readFile(file, 'utf8');
    if (/(?:from|require\()\s*['"](?:@\/|~\/)/.test(source)) {
      fail(`source-only alias remains in ${path.relative(root, file)}.`);
    }
  }

  if (inspectArchive) {
    const result = spawnSync(
      npmCommand,
      ['pack', '--dry-run', '--json', '--ignore-scripts'],
      {
        cwd: root,
        encoding: 'utf8',
        shell: false,
        env: { ...process.env, npm_config_cache: npmCache },
      },
    );
    if (result.status !== 0) {
      process.stdout.write(result.stdout ?? '');
      process.stderr.write(result.stderr ?? '');
      fail('npm pack --dry-run failed.');
    }
    const report = JSON.parse(result.stdout);
    const files = report[0]?.files?.map(entry => entry.path) ?? [];
    const forbidden = files.filter(file => (
      /\.(?:test|stories)\.[cm]?[jt]sx?$/.test(file)
      || /(^|\/)(?:tests?|showcase|coverage|package-output)(\/|$)/.test(file)
      || /(^|\/)\.(?:env|npmrc)(\.|$)/.test(file)
      || /(?:secret|credential|private-key)/i.test(file)
    ));
    if (forbidden.length > 0) {
      fail(`archive contains internal or sensitive files: ${forbidden.join(', ')}`);
    }
  }

  console.log('Package validation passed.');
  return packageJson;
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(import.meta.filename)) {
  validatePackage().catch(error => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
