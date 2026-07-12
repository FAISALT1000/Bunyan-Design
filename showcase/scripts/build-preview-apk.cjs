#!/usr/bin/env node

const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const androidDir = path.join(root, 'android');
const apkPath = path.join(
  androidDir,
  'app',
  'build',
  'outputs',
  'apk',
  'release',
  'app-release.apk',
);

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: options.cwd ?? root,
    env: {
      ...process.env,
      NODE_ENV: options.nodeEnv ?? 'production',
      EXPO_PUBLIC_SHOWCASE_ENTRY: 'preview',
      EXPO_PUBLIC_PREVIEW_APP: 'true',
    },
    stdio: 'inherit',
    shell: false,
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function commandExists(command) {
  const result = spawnSync(command, ['--version'], {
    cwd: root,
    stdio: 'ignore',
    shell: false,
  });
  return result.status === 0;
}

const npmCommand = process.platform === 'win32' ? 'npx.cmd' : 'npx';
const gradleCommand = process.platform === 'win32' ? 'gradlew.bat' : './gradlew';

console.log('Building Bunyan custom preview APK...');
console.log('Entry: EXPO_PUBLIC_SHOWCASE_ENTRY=preview');

if (!commandExists(npmCommand)) {
  console.error('npx was not found. Install dependencies before building the APK.');
  process.exit(1);
}

run(npmCommand, ['expo', 'prebuild', '--platform', 'android', '--no-install'], {
  nodeEnv: process.env.NODE_ENV ?? 'development',
});

if (!fs.existsSync(path.join(androidDir, gradleCommand.replace('./', '')))) {
  console.error('Android Gradle wrapper was not generated.');
  process.exit(1);
}

run(gradleCommand, [':app:assembleRelease', '--console=plain'], {
  cwd: androidDir,
});

if (!fs.existsSync(apkPath)) {
  console.error(`APK was not found at ${apkPath}`);
  process.exit(1);
}

console.log('');
console.log('Preview APK generated:');
console.log(apkPath);
