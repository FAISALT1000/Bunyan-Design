import { spawnSync } from 'node:child_process';
import {
  mkdir,
  readFile,
  rm,
  writeFile,
} from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import process from 'node:process';
import { validatePackage } from './validate-package.mjs';

const root = path.resolve(import.meta.dirname, '..');
const packagePath = path.join(root, 'package.json');
const lockPath = path.join(root, 'package-lock.json');
const outputPath = path.join(root, 'package-output');
const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const gitCommand = process.platform === 'win32' ? 'git.exe' : 'git';
const npmCache = path.join(os.tmpdir(), 'bunyan-design-system-npm-cache');
const releaseTypes = new Set(['patch', 'minor', 'major']);
const SEMVER_PATTERN = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/;

export const validateReleaseType = releaseType => {
  if (!releaseTypes.has(releaseType)) {
    throw new Error(
      `Unsupported release type "${releaseType}". Use patch, minor, or major.`,
    );
  }
  return releaseType;
};

export const parseSemanticVersion = version => {
  const match = SEMVER_PATTERN.exec(version);
  if (!match) {
    throw new Error(
      `Unsupported semantic version "${version}". Prerelease versions are not supported.`,
    );
  }
  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
  };
};

export const incrementSemanticVersion = (version, releaseType) => {
  validateReleaseType(releaseType);
  const parsed = parseSemanticVersion(version);
  if (releaseType === 'major') return `${parsed.major + 1}.0.0`;
  if (releaseType === 'minor') return `${parsed.major}.${parsed.minor + 1}.0`;
  return `${parsed.major}.${parsed.minor}.${parsed.patch + 1}`;
};

export const readPackageJson = async (file = packagePath) =>
  JSON.parse(await readFile(file, 'utf8'));

export const writePackageJson = async (value, file = packagePath) => {
  await writeFile(file, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
};

export const restorePackageJson = async snapshots => {
  await Promise.all(
    snapshots.map(({ file, contents }) => writeFile(file, contents, 'utf8')),
  );
};

export const runCommand = (
  command,
  args,
  { capture = false, cwd = root } = {},
) => {
  console.log(`\n> ${command} ${args.join(' ')}`);
  const result = spawnSync(command, args, {
    cwd,
    shell: false,
    encoding: capture ? 'utf8' : undefined,
    stdio: capture ? 'pipe' : 'inherit',
    env: { ...process.env, npm_config_cache: npmCache },
  });
  if (capture) {
    process.stdout.write(result.stdout ?? '');
    process.stderr.write(result.stderr ?? '');
  }
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(' ')} failed with exit code ${result.status}.`);
  }
  return result;
};

const updateLockVersion = (lock, version) => ({
  ...lock,
  version,
  packages: {
    ...lock.packages,
    '': {
      ...lock.packages?.[''],
      version,
    },
  },
});

async function main() {
  const releaseType = validateReleaseType(
    process.argv.slice(2).find(argument => !argument.startsWith('--')) ?? 'patch',
  );
  const flags = new Set(process.argv.slice(2).filter(argument => argument.startsWith('--')));
  const dryRun = flags.has('--dry-run');
  const gitCommit = flags.has('--git-commit');
  const gitTag = flags.has('--git-tag');
  const unsupportedFlags = [...flags].filter(flag => (
    !['--dry-run', '--git-commit', '--git-tag'].includes(flag)
  ));
  if (unsupportedFlags.length > 0) {
    throw new Error(`Unsupported flags: ${unsupportedFlags.join(', ')}`);
  }

  const originalPackage = await readFile(packagePath, 'utf8');
  const originalLock = await readFile(lockPath, 'utf8');
  const packageJson = JSON.parse(originalPackage);
  const previousVersion = packageJson.version;
  const nextVersion = incrementSemanticVersion(previousVersion, releaseType);
  let archivePath;
  let versionUpdated = false;
  let packagingComplete = false;

  console.log('Generating Bunyan design-system package');
  console.log(`Release type:     ${releaseType}`);
  console.log(`Previous version: ${previousVersion}`);
  console.log(`Next version:     ${nextVersion}`);
  console.log(`Dry run:          ${dryRun ? 'yes' : 'no'}`);

  try {
    runCommand(npmCommand, ['run', 'typecheck']);
    runCommand(npmCommand, ['run', 'lint']);
    runCommand(npmCommand, ['test', '--', '--runInBand']);

    await rm(path.join(root, 'dist'), { recursive: true, force: true });
    if (!dryRun) {
      await rm(outputPath, { recursive: true, force: true });
    }
    runCommand(npmCommand, ['run', 'build']);
    await validatePackage({ inspectArchive: true });

    if (dryRun) {
      console.log('\nPackage dry run completed successfully');
      console.log(`Current version:  ${previousVersion}`);
      console.log(`Would increment:  ${nextVersion}`);
      console.log(`Release type:     ${releaseType}`);
      console.log(`Would write to:   ${path.relative(root, outputPath)}`);
      return;
    }

    const nextPackage = { ...packageJson, version: nextVersion };
    const lockJson = JSON.parse(originalLock);
    await writePackageJson(nextPackage);
    await writePackageJson(updateLockVersion(lockJson, nextVersion), lockPath);
    versionUpdated = true;

    await mkdir(outputPath, { recursive: true });
    const packResult = runCommand(
      npmCommand,
      ['pack', '--pack-destination', outputPath, '--ignore-scripts'],
      { capture: true },
    );
    const archiveName = packResult.stdout.trim().split(/\r?\n/).filter(Boolean).at(-1);
    if (!archiveName) throw new Error('npm pack did not return an archive filename.');
    archivePath = path.join(outputPath, archiveName);
    packagingComplete = true;

    if (gitCommit || gitTag) {
      runCommand(gitCommand, ['add', 'package.json', 'package-lock.json']);
      if (gitCommit) {
        runCommand(gitCommand, ['commit', '-m', `chore(release): v${nextVersion}`]);
      }
      if (gitTag) {
        runCommand(gitCommand, ['tag', `v${nextVersion}`]);
      }
    }

    console.log('\nPackage generated successfully\n');
    console.log(`Previous version: ${previousVersion}`);
    console.log(`New version:      ${nextVersion}`);
    console.log(`Release type:     ${releaseType}`);
    console.log(`Package:          ${path.relative(root, archivePath)}`);
  } catch (error) {
    if (versionUpdated && !packagingComplete) {
      await restorePackageJson([
        { file: packagePath, contents: originalPackage },
        { file: lockPath, contents: originalLock },
      ]);
      if (archivePath) await rm(archivePath, { force: true });
      console.error('\nVersion files were restored after the failure.');
    }
    throw error;
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(import.meta.filename)) {
  main().catch(error => {
    console.error(
      `\nPackage generation failed: ${error instanceof Error ? error.message : error}`,
    );
    process.exitCode = 1;
  });
}
